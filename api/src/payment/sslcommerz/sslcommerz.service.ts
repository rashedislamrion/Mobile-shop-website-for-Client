import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  OrderStatus,
  PaymentGatewayName,
  PaymentStatus,
} from '@prisma/client';

@Injectable()
export class SslcommerzService {
  constructor(private prisma: PrismaService) {}

  private async getCredentials() {
    const config = await this.prisma.paymentGatewayConfig.findUnique({
      where: { gateway: PaymentGatewayName.SSLCOMMERZ },
    });

    if (!config || !config.isActive) {
      throw new BadRequestException('SSLCommerz is not currently available.');
    }

    const creds = (config.credentials || {}) as Record<string, any>;
    const storeId = creds.storeId || creds.store_id;
    const storePassword = creds.storePassword || creds.store_passwd || creds.storePasswd;

    if (!storeId || !storePassword) {
      throw new BadRequestException('SSLCommerz credentials are not fully configured in admin settings.');
    }

    const isLive = config.mode === 'Live';
    const baseUrl = isLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';

    return { storeId, storePassword, baseUrl, config };
  }

  async initiate(orderId: string, apiBaseUrl?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: true,
        shippingAddress: true,
      },
    });
    if (!order) throw new NotFoundException(`Order "${orderId}" not found.`);

    const { storeId, storePassword, baseUrl } = await this.getCredentials();

    const apiBase = apiBaseUrl || process.env.API_URL || 'http://localhost:4000/api/v1';
    const successUrl = `${apiBase}/payments/sslcommerz/success?orderId=${order.id}`;
    const failUrl = `${apiBase}/payments/sslcommerz/fail?orderId=${order.id}`;
    const cancelUrl = `${apiBase}/payments/sslcommerz/cancel?orderId=${order.id}`;
    const ipnUrl = `${apiBase}/payments/sslcommerz/ipn`;

    const params = new URLSearchParams();
    params.append('store_id', storeId);
    params.append('store_passwd', storePassword);
    params.append('total_amount', Number(order.totalAmount).toFixed(2));
    params.append('currency', 'BDT');
    params.append('tran_id', order.id);
    params.append('success_url', successUrl);
    params.append('fail_url', failUrl);
    params.append('cancel_url', cancelUrl);
    params.append('ipn_url', ipnUrl);
    params.append('cus_name', order.customer?.name || 'Valued Customer');
    params.append('cus_email', order.customer?.email || 'customer@mobilehubbd.com');
    params.append('cus_add1', order.shippingAddress?.fullAddress || 'Dhaka, Bangladesh');
    params.append('cus_city', 'Dhaka');
    params.append('cus_country', 'Bangladesh');
    params.append('shipping_method', 'Courier');
    params.append('product_name', order.orderCode);
    params.append('product_category', 'Mobile & Electronics');
    params.append('product_profile', 'general');

    const res = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await res.json();

    if (data.status !== 'SUCCESS' || !data.GatewayPageURL) {
      throw new BadRequestException(
        `SSLCommerz session creation failed: ${data.failedreason || JSON.stringify(data)}`,
      );
    }

    await this.prisma.paymentAttempt.create({
      data: {
        orderId: order.id,
        gateway: PaymentGatewayName.SSLCOMMERZ,
        gatewayRef: data.sessionkey || null,
        status: 'INITIATED',
        rawResponse: data,
      },
    });

    return {
      GatewayPageURL: data.GatewayPageURL,
      sessionkey: data.sessionkey,
    };
  }

  async validateAndMarkPaid(valId: string, tranId: string, bankTranId?: string) {
    const { storeId, storePassword, baseUrl } = await this.getCredentials();

    const valUrl = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(storeId)}&store_passwd=${encodeURIComponent(storePassword)}&v=1&format=json`;

    const res = await fetch(valUrl);
    const data = await res.json();

    if (data.status === 'VALID' || data.status === 'VALIDATED') {
      await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: tranId },
          include: { items: true },
        });
        if (!order) return;

        if (order.paymentStatus !== PaymentStatus.PAID) {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
              });
            }
          }

          await tx.order.update({
            where: { id: tranId },
            data: {
              paymentStatus: PaymentStatus.PAID,
              paymentMethod: 'SSLCOMMERZ',
              paidAmount: order.totalAmount,
              dueAmount: 0,
              status: OrderStatus.CONFIRMED,
            },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: tranId,
              status: OrderStatus.CONFIRMED,
              note: `Payment validated via SSLCommerz (ValID: ${valId}, BankTranID: ${bankTranId || data.bank_tran_id || 'N/A'})`,
            },
          });

          await tx.paymentAttempt.updateMany({
            where: { orderId: tranId, gateway: PaymentGatewayName.SSLCOMMERZ },
            data: {
              status: 'SUCCESS',
              gatewayRef: valId,
              rawResponse: data,
            },
          });
        }
      });
      return true;
    }
    return false;
  }

  async handleIPN(payload: any) {
    const valId = payload.val_id;
    const tranId = payload.tran_id;
    const bankTranId = payload.bank_tran_id;

    if (valId && tranId) {
      const isValid = await this.validateAndMarkPaid(valId, tranId, bankTranId);
      return { status: isValid ? 'SUCCESS' : 'FAILED' };
    }
    return { status: 'INVALID_PAYLOAD' };
  }

  async handleSuccess(query: any, body: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const orderId = query?.orderId || body?.tran_id || query?.tran_id;
    const valId = body?.val_id || query?.val_id;
    const bankTranId = body?.bank_tran_id || query?.bank_tran_id;

    if (valId && orderId) {
      try {
        await this.validateAndMarkPaid(valId, orderId, bankTranId);
      } catch (e) {
        // Log validation error
      }
    }

    return `${frontendUrl}/order/confirmation/${orderId || ''}`;
  }

  async handleFail(query: any, body: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const orderId = query?.orderId || body?.tran_id || query?.tran_id;
    return `${frontendUrl}/order/payment-failed?orderId=${orderId || ''}&reason=Failed`;
  }

  async handleCancel(query: any, body: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const orderId = query?.orderId || body?.tran_id || query?.tran_id;
    return `${frontendUrl}/order/payment-failed?orderId=${orderId || ''}&reason=Cancelled`;
  }
}
