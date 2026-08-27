import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePurchaseOrderDto,
  ReceivePurchaseOrderDto,
} from './dto/purchase-order.dto';
import { Prisma, PurchaseOrderStatus, WalletTxnType } from '@prisma/client';

@Injectable()
export class PurchaseOrderService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: {
    branch?: string;
    supplier?: string;
    status?: PurchaseOrderStatus;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseOrderWhereInput = {};

    if (query?.branch) where.branchId = query.branch;
    if (query?.supplier) where.supplierId = query.supplier;
    if (query?.status) where.status = query.status;

    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (query?.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { poNumber: { contains: term, mode: 'insensitive' } },
        { supplier: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [total, data, thisMonthOrders, pendingDeliveryCount] = await Promise.all([
      this.prisma.purchaseOrder.count({ where }),
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          supplier: { select: { id: true, name: true, phone: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
              variant: { select: { id: true, sku: true, color: true, quality: true } },
            },
          },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.purchaseOrder.findMany({
        where: {
          createdAt: { gte: startOfMonth },
          ...(query?.branch ? { branchId: query.branch } : {}),
        },
        select: { grandTotal: true, amountPaid: true, dueAmount: true },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          status: { in: [PurchaseOrderStatus.ORDERED, PurchaseOrderStatus.PARTIALLY_RECEIVED] },
          ...(query?.branch ? { branchId: query.branch } : {}),
        },
      }),
    ]);

    let thisMonthTotal = 0;
    let thisMonthPaid = 0;
    let thisMonthUnpaid = 0;

    for (const po of thisMonthOrders) {
      thisMonthTotal += Number(po.grandTotal);
      thisMonthPaid += Number(po.amountPaid);
      thisMonthUnpaid += Number(po.dueAmount);
    }

    return {
      data,
      summary: {
        thisMonthTotal,
        thisMonthPaid,
        thisMonthUnpaid,
        pendingDeliveryCount,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        branch: true,
        supplier: true,
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
            variant: true,
          },
        },
        payments: {
          include: {
            walletType: { select: { id: true, name: true } },
            recordedBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!po) throw new NotFoundException(`Purchase Order "${id}" not found.`);
    return po;
  }

  async create(dto: CreatePurchaseOrderDto, recordedById: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier) throw new NotFoundException('Supplier not found.');

    let branchId = dto.branchId;
    if (!branchId) {
      const defaultBranch = await this.prisma.branch.findFirst();
      if (!defaultBranch) throw new NotFoundException('No branch available.');
      branchId = defaultBranch.id;
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Purchase order must contain at least one item.');
    }

    const discount = Number(dto.discount || 0);
    const shippingCost = Number(dto.shippingCost || 0);
    const tax = Number(dto.tax || 0);

    let subtotal = 0;
    const itemsData = await Promise.all(
      dto.items.map(async (item) => {
        let productId = item.productId;
        if (!productId && item.variantId) {
          const variant = await this.prisma.productVariant.findUnique({
            where: { id: item.variantId },
            select: { productId: true },
          });
          productId = variant?.productId || '';
        }
        if (!productId) {
          const fallbackProduct = await this.prisma.product.findFirst();
          productId = fallbackProduct?.id || '';
        }

        const lineTotal = Number(item.quantityOrdered) * Number(item.unitCost);
        subtotal += lineTotal;
        return {
          productId,
          variantId: item.variantId || null,
          quantityOrdered: item.quantityOrdered,
          unitCost: item.unitCost,
          lineTotal,
        };
      }),
    );

    const grandTotal = Math.max(0, subtotal - discount + shippingCost + tax);
    const amountPaid = Math.min(grandTotal, Number(dto.amountPaid || 0));
    const dueAmount = grandTotal - amountPaid;

    const poNumber = `PO-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.$transaction(async (tx) => {
      let walletTxn: any = null;
      let paymentRecord: any = null;

      if (amountPaid > 0) {
        if (!dto.walletTypeId) {
          throw new BadRequestException(
            'Wallet selection is required when making an advance/initial payment on a purchase order.',
          );
        }

        const wallet = await tx.walletType.findUnique({
          where: { id: dto.walletTypeId },
        });
        if (!wallet) throw new NotFoundException('Selected payment wallet not found.');

        const currentBal = Number(wallet.currentBalance);
        if (currentBal < amountPaid) {
          throw new BadRequestException(
            `Insufficient balance in wallet "${wallet.name}". Required: ৳${amountPaid.toLocaleString()}, Available: ৳${currentBal.toLocaleString()}.`,
          );
        }

        const newBal = currentBal - amountPaid;
        await tx.walletType.update({
          where: { id: dto.walletTypeId },
          data: { currentBalance: newBal },
        });

        const payRef = `SPAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

        walletTxn = await tx.walletTransaction.create({
          data: {
            walletTypeId: dto.walletTypeId,
            type: WalletTxnType.WITHDRAWAL,
            amount: amountPaid,
            referenceNo: `TXN-${payRef}`,
            note: `Advance payment for Purchase Order ${poNumber}`,
            recordedById,
            balanceAfter: newBal,
          },
        });
      }

      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          branchId,
          supplierId: dto.supplierId,
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          status: dto.status || PurchaseOrderStatus.ORDERED,
          subtotal,
          discount,
          shippingCost,
          tax,
          grandTotal,
          amountPaid,
          dueAmount,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
          supplier: true,
          branch: true,
        },
      });

      if (amountPaid > 0) {
        paymentRecord = await tx.supplierPayment.create({
          data: {
            referenceNo: `SPAY-${po.poNumber}`,
            supplierId: dto.supplierId,
            amount: amountPaid,
            method: 'WALLET',
            walletTypeId: dto.walletTypeId!,
            purchaseOrderId: po.id,
            note: dto.note || 'Initial payment on order creation',
            recordedById,
          },
        });
      }

      // Increase supplier total due by the unpaid portion (dueAmount)
      const currentSupplierDue = Number(supplier.totalDue);
      await tx.supplier.update({
        where: { id: dto.supplierId },
        data: { totalDue: currentSupplierDue + dueAmount },
      });

      return {
        ...po,
        purchaseOrder: po,
        supplierPayment: paymentRecord,
        walletTransaction: walletTxn,
      };
    });
  }

  async receiveItems(id: string, dto: ReceivePurchaseOrderDto) {
    const po = await this.findOne(id);

    if (po.status === PurchaseOrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot receive items on a cancelled purchase order.');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const receivedItem of dto.items) {
        const poItem = po.items.find(
          (i) =>
            i.id === receivedItem.purchaseOrderItemId ||
            (receivedItem.variantId && i.variantId === receivedItem.variantId),
        );
        if (!poItem) {
          throw new NotFoundException(
            `Purchase order item "${receivedItem.purchaseOrderItemId || receivedItem.variantId}" not found in this order.`,
          );
        }

        const newReceivedQty =
          Number(poItem.quantityReceived) + Number(receivedItem.quantityReceived);

        await tx.purchaseOrderItem.update({
          where: { id: poItem.id },
          data: { quantityReceived: newReceivedQty },
        });

        // Increase product variant stock
        if (poItem.variantId) {
          await tx.productVariant.update({
            where: { id: poItem.variantId },
            data: {
              stock: { increment: Number(receivedItem.quantityReceived) },
            },
          });
        }
      }

      // Re-evaluate PO status
      const updatedPoItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: id },
      });

      const allFullyReceived = updatedPoItems.every(
        (i) => i.quantityReceived >= i.quantityOrdered,
      );
      const someReceived = updatedPoItems.some((i) => i.quantityReceived > 0);

      const nextStatus = allFullyReceived
        ? PurchaseOrderStatus.RECEIVED
        : someReceived
        ? PurchaseOrderStatus.PARTIALLY_RECEIVED
        : po.status;

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: nextStatus },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
          supplier: true,
          branch: true,
        },
      });
    });
  }

  async cancel(id: string) {
    const po = await this.findOne(id);

    if (
      po.status !== PurchaseOrderStatus.DRAFT &&
      po.status !== PurchaseOrderStatus.ORDERED
    ) {
      throw new BadRequestException(
        `Cannot cancel purchase order in "${po.status}" status. Only DRAFT or ORDERED purchase orders can be cancelled.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Revert the supplier's due amount that was added on creation
      const dueAmount = Number(po.dueAmount);
      if (dueAmount > 0) {
        const supplier = await tx.supplier.findUnique({
          where: { id: po.supplierId },
        });
        if (supplier) {
          const newSupplierDue = Math.max(0, Number(supplier.totalDue) - dueAmount);
          await tx.supplier.update({
            where: { id: po.supplierId },
            data: { totalDue: newSupplierDue },
          });
        }
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: { status: PurchaseOrderStatus.CANCELLED },
        include: {
          items: true,
          supplier: true,
          branch: true,
        },
      });
    });
  }
}
