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
export class BkashService {
  constructor(private prisma: PrismaService) {}

  private async getCredentials() {
    const config = await this.prisma.paymentGatewayConfig.findUnique({
      where: { gateway: PaymentGatewayName.BKASH },
    });

    if (!config || !config.isActive) {
      throw new BadRequestException('bKash is not currently available.');
    }

    const creds = (config.credentials || {}) as Record<string, any>;
    const appKey = creds.appKey || creds.app_key;
    const appSecretKey = creds.appSecretKey || creds.app_secret || creds.appSecret;
    const username = creds.username;
    const password = creds.password;

    if (!appKey || !appSecretKey || !username || !password) {
      throw new BadRequestException('bKash credentials are not fully configured in admin settings.');
    }

    const isLive = config.mode === 'Live';
    const baseUrl = isLive
      ? 'https://tokenized.pay.bka.sh/v2.0.0'
      : 'https://tokenized.sandbox.bka.sh/v2.0.0';

    return { appKey, appSecretKey, username, password, baseUrl, config };
  }

  private async grantToken(baseUrl: string, appKey: string, appSecretKey: string, username: string, password: string) {
    const res = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username,
        password,
      },
      body: JSON.stringify({
        app_key: appKey,
        app_secret: appSecretKey,
      }),
    });

    const data = await res.json();
    if (!data.id_token) {
      throw new BadRequestException(
        `Failed to grant bKash token: ${data.statusMessage || JSON.stringify(data)}`,
      );
    }
    return data.id_token as string;
  }

  async initiate(orderId: string, callbackBaseUrl?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException(`Order "${orderId}" not found.`);

    const { appKey, appSecretKey, username, password, baseUrl } = await this.getCredentials();

    const idToken = await this.grantToken(baseUrl, appKey, appSecretKey, username, password);

    const apiBase = callbackBaseUrl || process.env.API_URL || 'http://localhost:4000/api/v1';
    const callbackURL = `${apiBase}/payments/bkash/callback?orderId=${order.id}`;

    const createRes = await fetch(`${baseUrl}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: idToken,
        'X-APP-Key': appKey,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: order.customerId || 'GUEST',
        callbackURL,
        amount: Number(order.totalAmount).toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: order.orderCode,
      }),
    });

    const createData = await createRes.json();

    if (!createData.paymentID || !createData.bkashURL) {
      throw new BadRequestException(
        `bKash payment create failed: ${createData.statusMessage || JSON.stringify(createData)}`,
      );
    }

    // Save payment attempt
    await this.prisma.paymentAttempt.create({
      data: {
        orderId: order.id,
        gateway: PaymentGatewayName.BKASH,
        gatewayRef: createData.paymentID,
        status: 'INITIATED',
        rawResponse: createData,
      },
    });

    return {
      bkashURL: createData.bkashURL,
      paymentID: createData.paymentID,
    };
  }

  async handleCallback(query: { paymentID?: string; status?: string; orderId?: string }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const { paymentID, status, orderId } = query;

    if (!paymentID || status !== 'success') {
      if (orderId) {
        await this.prisma.paymentAttempt.updateMany({
          where: { orderId, gateway: PaymentGatewayName.BKASH, gatewayRef: paymentID },
          data: { status: 'FAILED' },
        });
      }
      return `${frontendUrl}/order/payment-failed?orderId=${orderId || ''}&reason=${status || 'cancel'}`;
    }

    try {
      const { appKey, appSecretKey, username, password, baseUrl } = await this.getCredentials();
      const idToken = await this.grantToken(baseUrl, appKey, appSecretKey, username, password);

      const executeRes = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: idToken,
          'X-APP-Key': appKey,
        },
        body: JSON.stringify({ paymentID }),
      });

      const executeData = await executeRes.json();

      if (executeData.statusCode === '0000' && executeData.trxID) {
        // Find order
        let targetOrderId = orderId;
        if (!targetOrderId) {
          const attempt = await this.prisma.paymentAttempt.findFirst({
            where: { gatewayRef: paymentID },
          });
          targetOrderId = attempt?.orderId;
        }

        if (!targetOrderId) {
          return `${frontendUrl}/order/payment-failed?reason=OrderNotFound`;
        }

        await this.prisma.$transaction(async (tx) => {
          const order = await tx.order.findUnique({
            where: { id: targetOrderId },
            include: { items: true },
          });
          if (!order) return;

          if (order.paymentStatus !== PaymentStatus.PAID) {
            // Deduct stock for all items
            for (const item of order.items) {
              if (item.variantId) {
                await tx.productVariant.update({
                  where: { id: item.variantId },
                  data: { stock: { decrement: item.quantity } },
                });
              }
            }

            // Update order
            await tx.order.update({
              where: { id: targetOrderId },
              data: {
                paymentStatus: PaymentStatus.PAID,
                paymentMethod: 'BKASH',
                paidAmount: order.totalAmount,
                dueAmount: 0,
                status: OrderStatus.CONFIRMED,
              },
            });

            // Status history
            await tx.orderStatusHistory.create({
              data: {
                orderId: targetOrderId,
                status: OrderStatus.CONFIRMED,
                note: `Payment confirmed via bKash (TrxID: ${executeData.trxID})`,
              },
            });

            // Update payment attempt
            await tx.paymentAttempt.updateMany({
              where: { orderId: targetOrderId, gatewayRef: paymentID },
              data: {
                status: 'SUCCESS',
                rawResponse: executeData,
              },
            });
          }
        });

        return `${frontendUrl}/order/confirmation/${targetOrderId}`;
      } else {
        return `${frontendUrl}/order/payment-failed?orderId=${orderId || ''}&reason=${executeData.statusMessage || 'PaymentExecutionFailed'}`;
      }
    } catch (err: any) {
      return `${frontendUrl}/order/payment-failed?orderId=${orderId || ''}&reason=${encodeURIComponent(err.message || 'Error')}`;
    }
  }
}
