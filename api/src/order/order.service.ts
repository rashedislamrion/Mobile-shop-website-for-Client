import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddOrderNoteDto } from './dto/add-order-note.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrderPaymentMethod, OrderStatus, PaymentStatus, Prisma, SaleType } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.DIAGNOSING],
  CONFIRMED: [OrderStatus.PARCEL_BOOKED, OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  PARCEL_BOOKED: [OrderStatus.DELIVERED, OrderStatus.RETURNED, OrderStatus.CANCELLED],
  DIAGNOSING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.COMPLETED],
  DELIVERED: [OrderStatus.RETURNED, OrderStatus.COMPLETED],
  COMPLETED: [OrderStatus.RETURNED],
  RETURNED: [],
  CANCELLED: [],
};

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  private async checkBranchScope(user: JwtPayload, targetBranchId?: string) {
    if (!user || user.userType !== 'STAFF' || !user.roleId) return;
    const role = await this.prisma.role.findUnique({ where: { id: user.roleId } });
    if (role?.scope === 'OWN_BRANCH') {
      if (targetBranchId && user.branchId && targetBranchId !== user.branchId) {
        throw new ForbiddenException('You can only access or modify data belonging to your own branch.');
      }
    }
  }

  async findAll(
    query: {
      status?: OrderStatus;
      saleType?: SaleType;
      branch?: string;
      branchId?: string;
      paymentStatus?: PaymentStatus;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    },
    user?: JwtPayload,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    // Branch scoping
    if (user?.userType === 'STAFF' && user.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: user.roleId } });
      if (role?.scope === 'OWN_BRANCH' && user.branchId) {
        where.branchId = user.branchId;
      } else if (query.branchId || query.branch) {
        where.branchId = query.branchId || query.branch;
      }
    } else if (query.branchId || query.branch) {
      where.branchId = query.branchId || query.branch;
    }

    if (query.status) where.status = query.status;
    if (query.saleType) where.saleType = query.saleType;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { orderCode: { contains: s, mode: 'insensitive' } },
        { customer: { name: { contains: s, mode: 'insensitive' } } },
        { customer: { phone: { contains: s, mode: 'insensitive' } } },
      ];
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } },
          branch: { select: { id: true, name: true, code: true } },
          staff: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
              variant: { select: { id: true, color: true, quality: true, sku: true } },
            },
          },
          _count: { select: { items: true, notes: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyOrders(customerId: string, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = { customerId };
    if (status) where.status = status;

    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { take: 1, select: { url: true } },
              },
            },
            variant: { select: { id: true, color: true, quality: true } },
          },
        },
        shippingAddress: true,
        branch: { select: { id: true, name: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async findOne(id: string, user?: JwtPayload) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        branch: true,
        staff: { select: { id: true, name: true, employeeId: true } },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { select: { id: true, url: true } },
              },
            },
            variant: true,
            phoneUnits: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedBy: { select: { id: true, name: true, employeeId: true } },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            staff: { select: { id: true, name: true, photo: true } },
          },
        },
        serviceJob: {
          include: {
            technician: { select: { id: true, name: true, phone: true } },
          },
        },
        shipment: true,
        salesReturn: {
          include: { items: { include: { orderItem: true } } },
        },
        exchange: {
          include: { oldOrderItem: true },
        },
      },
    });

    if (!order) throw new NotFoundException(`Order with ID "${id}" not found.`);

    // Customer OWN_DATA check
    if (user?.userType === 'CUSTOMER') {
      if (order.customerId !== user.sub) {
        throw new ForbiddenException('You do not have permission to view this order.');
      }
    } else if (user?.userType === 'STAFF') {
      await this.checkBranchScope(user, order.branchId);
    }

    return order;
  }

  async create(dto: CreateOrderDto, user?: JwtPayload) {
    if (user?.userType === 'STAFF') {
      await this.checkBranchScope(user, dto.branchId);
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    // Generate unique order code
    const orderCode = `EM${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch products & variants for name snapshots and stock verification
      let subtotal = 0;
      const orderItemsData: any[] = [];
      const phoneUnitAssignments: Array<{
        index: number;
        phoneUnitId: string;
        warrantyType?: string;
        warrantyPeriod?: string;
        warrantyStartDate?: string;
        warrantyEndDate?: string;
      }> = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true },
        });
        if (!product) throw new NotFoundException(`Product with ID "${item.productId}" not found.`);

        let variant: any = null;
        if (item.variantId) {
          variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) throw new NotFoundException(`Variant "${item.variantId}" not found for product "${product.name}".`);
        } else if (product.variants.length > 0) {
          variant = product.variants[0];
        }

        // Validate stock if POS immediate sale
        const isPos = dto.saleType === SaleType.POS;
        if (isPos && variant) {
          if (item.phoneUnitId) {
            const phoneUnit = await tx.phoneUnit.findUnique({
              where: { id: item.phoneUnitId },
            });
            if (!phoneUnit) {
              throw new NotFoundException(`Phone unit not found.`);
            }
            if (phoneUnit.status !== 'IN_STOCK') {
              throw new ConflictException(
                `Phone unit (IMEI: ${phoneUnit.imei1}) is no longer in stock. Current status: ${phoneUnit.status}`,
              );
            }

            // Decrement variant stock if positive
            if (variant.stock > 0) {
              await tx.productVariant.update({
                where: { id: variant.id },
                data: { stock: { decrement: 1 } },
              });
            }

            // Decrement branch inventory if present
            if (dto.branchId) {
              const branchInv = await tx.branchInventory.findUnique({
                where: {
                  branchId_productVariantId: {
                    branchId: dto.branchId,
                    productVariantId: variant.id,
                  },
                },
              });
              if (branchInv && branchInv.quantity > 0) {
                await tx.branchInventory.update({
                  where: {
                    branchId_productVariantId: {
                      branchId: dto.branchId,
                      productVariantId: variant.id,
                    },
                  },
                  data: { quantity: { decrement: 1 } },
                });
              }
            }

            phoneUnitAssignments.push({
              index: orderItemsData.length,
              phoneUnitId: item.phoneUnitId,
              warrantyType: item.warrantyType || (item as any).serviceWarranty,
              warrantyPeriod: item.warrantyPeriod,
              warrantyStartDate: item.warrantyStartDate,
              warrantyEndDate: item.warrantyEndDate,
            });
          } else {
            let branchStock = variant.stock;

            if (dto.branchId) {
              const branchInv = await tx.branchInventory.findUnique({
                where: {
                  branchId_productVariantId: {
                    branchId: dto.branchId,
                    productVariantId: variant.id,
                  },
                },
              });
              branchStock = branchInv ? branchInv.quantity : 0;
            }

            if (branchStock < item.quantity) {
              throw new ConflictException(
                `Insufficient stock for "${product.name}" (${variant.color || ''} ${variant.quality || ''}). Available: ${branchStock}, Requested: ${item.quantity}`,
              );
            }

            // Deduct from branch inventory
            if (dto.branchId) {
              await tx.branchInventory.update({
                where: {
                  branchId_productVariantId: {
                    branchId: dto.branchId,
                    productVariantId: variant.id,
                  },
                },
                data: { quantity: { decrement: item.quantity } },
              });
            }

            // Deduct stock
            await tx.productVariant.update({
              where: { id: variant.id },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        const unitPrice = Number(item.unitPrice ?? variant?.price ?? product.regularPrice);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        orderItemsData.push({
          productId: product.id,
          variantId: variant?.id ?? null,
          productNameSnapshot: product.name,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        });
      }

      const discountAmount = Number(dto.discountAmount || 0);
      const deliveryCharge = Number(dto.deliveryCharge || 0);
      const totalAmount = subtotal - discountAmount + deliveryCharge;
      const paidAmount = Number(dto.paidAmount || 0);
      const dueAmount = Math.max(0, totalAmount - paidAmount);

      let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
      if (dueAmount <= 0) {
        paymentStatus = PaymentStatus.PAID;
      } else if (paidAmount > 0) {
        paymentStatus = PaymentStatus.DUE;
      }

      let initialStatus: OrderStatus = OrderStatus.CONFIRMED;
      let effectiveSaleType: SaleType = dto.saleType || SaleType.POS;

      if (dto.status === OrderStatus.DIAGNOSING || dto.saleType === SaleType.DIAGNOSING) {
        initialStatus = OrderStatus.DIAGNOSING;
        effectiveSaleType = SaleType.DIAGNOSING;
      } else if (dto.saleType === SaleType.COURIER) {
        initialStatus = OrderStatus.PENDING;
        effectiveSaleType = SaleType.COURIER;
      } else if (dto.saleType === SaleType.WEBSITE) {
        initialStatus = OrderStatus.PENDING;
        effectiveSaleType = SaleType.WEBSITE;
      } else if (dto.status) {
        initialStatus = dto.status;
      }

      const order = await tx.order.create({
        data: {
          orderCode,
          branchId: dto.branchId,
          customerId: dto.customerId || null,
          saleType: effectiveSaleType,
          status: initialStatus,
          paymentStatus,
          paymentMethod: dto.paymentMethod || null,
          subtotal,
          discountAmount,
          deliveryCharge,
          totalAmount,
          paidAmount,
          dueAmount,
          staffId: user?.userType === 'STAFF' ? user.sub : null,
          shippingAddressId: dto.shippingAddressId || null,
          saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: initialStatus,
              note: dto.note || 'Order created',
              changedById: user?.userType === 'STAFF' ? user.sub : null,
            },
          },
          ...(dto.note && user?.userType === 'STAFF'
            ? {
                notes: {
                  create: {
                    note: dto.note,
                    staffId: user.sub,
                  },
                },
              }
            : {}),
          ...((effectiveSaleType === SaleType.DIAGNOSING || initialStatus === OrderStatus.DIAGNOSING) && (dto.device || dto.issueDescription)
            ? {
                serviceJob: {
                  create: {
                    device: dto.device || 'Mobile Device',
                    issueDescription: dto.issueDescription || 'Repair inspection and diagnostic service',
                    serviceCharge: dto.serviceCharge !== undefined ? dto.serviceCharge : subtotal,
                    technicianId: dto.technicianId || null,
                    status: 'PENDING',
                  },
                },
              }
            : {}),
          ...(effectiveSaleType === SaleType.COURIER && dto.courierPartner
            ? {
                shipment: {
                  create: {
                    courierPartner: dto.courierPartner,
                    trackingNo: `TRK-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`,
                    status: 'PENDING_PICKUP',
                    address: dto.shippingAddress || 'Customer Address',
                  },
                },
              }
            : {}),
        },
        include: {
          items: {
            include: {
              phoneUnits: true,
              product: true,
              variant: true,
            },
          },
          customer: true,
          branch: true,
          serviceJob: true,
          shipment: true,
        },
      });

      // Update phone units to SOLD and link to order & order item
      for (const assignment of phoneUnitAssignments) {
        const matchingItem = order.items[assignment.index];
        await tx.phoneUnit.update({
          where: { id: assignment.phoneUnitId },
          data: {
            status: 'SOLD',
            saleId: order.id,
            orderItemId: matchingItem ? matchingItem.id : null,
            warrantyType: assignment.warrantyType || null,
            warrantyPeriod: assignment.warrantyPeriod || null,
            warrantyStartDate: assignment.warrantyStartDate ? new Date(assignment.warrantyStartDate) : new Date(),
            warrantyEndDate: assignment.warrantyEndDate ? new Date(assignment.warrantyEndDate) : null,
          },
        });
      }

      // Synchronize with Customer module (Fix Pass 18 stats and payment ledger)
      if (dto.customerId) {
        await tx.customerActivity.create({
          data: {
            customerId: dto.customerId,
            type: 'ORDER_PLACED' as any,
            description: `Placed order #${orderCode} for ৳${totalAmount.toLocaleString()}`,
            metadata: { orderId: order.id, orderCode, totalAmount, saleType: effectiveSaleType },
          },
        });

        if (paidAmount > 0) {
          await tx.payment.create({
            data: {
              customerId: dto.customerId,
              orderId: order.id,
              amount: new Prisma.Decimal(paidAmount),
              discount: new Prisma.Decimal(discountAmount),
              paymentMethod: dto.paymentMethod || 'CASH',
              paymentChannel: 'POS',
              note: dto.note || `POS Payment for order #${orderCode}`,
            },
          });

          await tx.customerActivity.create({
            data: {
              customerId: dto.customerId,
              type: 'PAYMENT_RECEIVED' as any,
              description: `Received payment of ৳${paidAmount.toLocaleString()} for order #${orderCode}`,
              metadata: { orderId: order.id, orderCode, paidAmount },
            },
          });
        }
      }

      return order;
    });
  }

  async searchCustomers(query?: string) {
    const q = query?.trim() || '';
    const where: Prisma.CustomerWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const customers = await this.prisma.customer.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        status: true,
        addresses: {
          take: 1,
          select: { id: true, fullAddress: true },
        },
      },
    });

    return customers;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user?: JwtPayload) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException(`Order with ID "${id}" not found.`);

    if (user?.userType === 'STAFF') {
      await this.checkBranchScope(user, order.branchId);
    }

    const currentStatus = order.status;
    const targetStatus = dto.status;

    if (currentStatus === targetStatus) {
      return order;
    }

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Transition from ${currentStatus} to ${targetStatus} is not allowed. Allowed transitions: ${allowed.join(', ') || 'None (Terminal state)'}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Stock management logic:
      // Case 1: Transitioning to CONFIRMED (and order was not POS which already deducted on creation)
      if (targetStatus === OrderStatus.CONFIRMED && order.saleType !== SaleType.POS) {
        for (const item of order.items) {
          if (item.variantId) {
            const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
            if (!variant || variant.stock < item.quantity) {
              throw new ConflictException(
                `Insufficient stock for "${item.productNameSnapshot}". Available: ${variant?.stock ?? 0}, Requested: ${item.quantity}`,
              );
            }
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }
      }

      // Case 2: Transitioning to CANCELLED or RETURNED
      // Only restore stock if stock was previously deducted (i.e. was POS OR reached CONFIRMED/PARCEL_BOOKED/DELIVERED/COMPLETED)
      const stockWasDeducted =
        order.saleType === SaleType.POS ||
        ([OrderStatus.CONFIRMED, OrderStatus.PARCEL_BOOKED, OrderStatus.DELIVERED, OrderStatus.COMPLETED] as OrderStatus[]).includes(
          currentStatus,
        );

      if ((targetStatus === OrderStatus.CANCELLED || targetStatus === OrderStatus.RETURNED) && stockWasDeducted) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status: targetStatus,
          statusHistory: {
            create: {
              status: targetStatus,
              note: dto.note || `Status changed from ${currentStatus} to ${targetStatus}`,
              changedById: user?.userType === 'STAFF' ? user.sub : null,
            },
          },
        },
        include: {
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            include: { changedBy: { select: { id: true, name: true } } },
          },
          items: true,
          customer: true,
          branch: true,
        },
      });

      return updated;
    });
  }

  async addNote(id: string, dto: AddOrderNoteDto, user: JwtPayload) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order with ID "${id}" not found.`);

    if (user.userType === 'STAFF') {
      await this.checkBranchScope(user, order.branchId);
    }

    return this.prisma.orderNote.create({
      data: {
        orderId: id,
        staffId: user.sub,
        note: dto.note,
      },
      include: {
        staff: { select: { id: true, name: true, photo: true } },
      },
    });
  }

  async update(id: string, dto: UpdateOrderDto, user?: JwtPayload) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order with ID "${id}" not found.`);

    if (user?.userType === 'STAFF') {
      await this.checkBranchScope(user, order.branchId);
    }

    const discountAmount = dto.discountAmount !== undefined ? dto.discountAmount : Number(order.discountAmount);
    const deliveryCharge = dto.deliveryCharge !== undefined ? dto.deliveryCharge : Number(order.deliveryCharge);
    const subtotal = Number(order.subtotal);
    const totalAmount = subtotal - discountAmount + deliveryCharge;
    const paidAmount = dto.paidAmount !== undefined ? dto.paidAmount : Number(order.paidAmount);
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    let paymentStatus = dto.paymentStatus || order.paymentStatus;
    if (!dto.paymentStatus) {
      if (dueAmount <= 0) paymentStatus = PaymentStatus.PAID;
      else if (paidAmount > 0) paymentStatus = PaymentStatus.DUE;
      else paymentStatus = PaymentStatus.PENDING;
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        discountAmount,
        deliveryCharge,
        totalAmount,
        paidAmount,
        dueAmount,
        paymentStatus,
        paymentMethod: dto.paymentMethod !== undefined ? dto.paymentMethod : order.paymentMethod,
        shippingAddressId: dto.shippingAddressId !== undefined ? dto.shippingAddressId : order.shippingAddressId,
      },
      include: {
        customer: true,
        branch: true,
        items: true,
      },
    });
  }

  async checkout(dto: CheckoutOrderDto, user?: JwtPayload) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Checkout must contain at least one item.');
    }

    let customerId: string | null = null;
    let shippingAddressId: string | null = dto.shippingAddressId || null;

    if (user?.userType === 'CUSTOMER') {
      customerId = user.sub;
    } else if (dto.guestInfo) {
      const guestPhone = dto.guestInfo.phone.trim();
      const guestEmail = dto.guestInfo.email?.trim() || `${guestPhone}@guest.novamobile.com`;

      let customer = await this.prisma.customer.findFirst({
        where: {
          OR: [{ phone: guestPhone }, { email: guestEmail }],
        },
      });

      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            name: dto.guestInfo.name.trim(),
            phone: guestPhone,
            email: guestEmail,
            passwordHash: 'GUEST_ACCOUNT',
          },
        });
      }
      customerId = customer.id;

      if (!shippingAddressId) {
        const addr = await this.prisma.address.create({
          data: {
            customerId: customer.id,
            fullName: dto.guestInfo.name.trim(),
            phone: guestPhone,
            email: dto.guestInfo.email || null,
            fullAddress: dto.guestInfo.address,
            tag: 'HOME',
            isDefault: false,
          },
        });
        shippingAddressId = addr.id;
      }
    } else if (!user) {
      throw new BadRequestException('Please login or provide guest contact information.');
    }

    const branch = await this.prisma.branch.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });
    if (!branch) throw new BadRequestException('No active branch available for order fulfillment.');

    const branchId = branch.id;
    const orderCode = `EM${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: any[] = [];
      const categoryIds: string[] = [];
      const productIds: string[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true },
        });
        if (!product) throw new NotFoundException(`Product with ID "${item.productId}" not found.`);

        let variant: any = null;
        if (item.variantId) {
          variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) throw new NotFoundException(`Variant "${item.variantId}" not found for product "${product.name}".`);
        } else if (product.variants.length > 0) {
          variant = product.variants[0];
        }

        if (!variant) throw new BadRequestException(`No variant available for product "${product.name}".`);

        if (variant.stock < item.quantity) {
          throw new ConflictException(
            `Item "${product.name}" (${variant.color || ''} ${variant.quality || ''}) is out of stock. Available: ${variant.stock}, Requested: ${item.quantity}`,
          );
        }

        if (dto.paymentMethod === OrderPaymentMethod.COD) {
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const unitPrice = Number(variant.price || product.regularPrice);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;

        if (product.categoryId) categoryIds.push(product.categoryId);
        productIds.push(product.id);

        orderItemsData.push({
          productId: product.id,
          variantId: variant.id,
          productNameSnapshot: product.name,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        });
      }

      let discountAmount = 0;
      if (dto.promoCode?.trim()) {
        const pCode = dto.promoCode.trim().toUpperCase();
        const promo = await tx.promoCode.findUnique({
          where: { code: pCode },
        });

        if (promo && promo.status === 'ACTIVE') {
          const now = new Date();
          if (now >= promo.validFrom && now <= promo.validUntil) {
            const meetsLimit = promo.usageLimit === null || promo.usedCount < promo.usageLimit;
            const meetsMin = promo.minOrderAmount === null || subtotal >= Number(promo.minOrderAmount);
            if (meetsLimit && meetsMin) {
              if (promo.discountType === 'PERCENTAGE') {
                discountAmount = (subtotal * Number(promo.discountValue)) / 100;
                if (promo.maxDiscountCap && Number(promo.maxDiscountCap) > 0) {
                  discountAmount = Math.min(discountAmount, Number(promo.maxDiscountCap));
                }
              } else {
                discountAmount = Math.min(subtotal, Number(promo.discountValue));
              }
              discountAmount = Math.round(discountAmount * 100) / 100;

              await tx.promoCode.update({
                where: { id: promo.id },
                data: { usedCount: { increment: 1 } },
              });
            }
          }
        }
      }

      let deliveryCharge = 60;
      if (dto.deliveryType === 'EXPRESS') {
        deliveryCharge = 120;
      }
      if (subtotal >= 5000) {
        deliveryCharge = 0;
      }

      const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);
      const paidAmount = 0;
      const dueAmount = totalAmount;
      const paymentStatus = PaymentStatus.PENDING;
      const initialStatus = OrderStatus.PENDING;

      const order = await tx.order.create({
        data: {
          orderCode,
          branchId,
          customerId,
          saleType: SaleType.WEBSITE,
          status: initialStatus,
          paymentStatus,
          paymentMethod: dto.paymentMethod,
          subtotal,
          discountAmount,
          deliveryCharge,
          totalAmount,
          paidAmount,
          dueAmount,
          shippingAddressId,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              status: initialStatus,
              note: `Website checkout via ${dto.paymentMethod}${dto.orderNotes ? ` (${dto.orderNotes})` : ''}`,
            },
          },
        },
        include: {
          items: true,
          customer: true,
          branch: true,
        },
      });

      return {
        orderId: order.id,
        orderCode: order.orderCode,
        totalAmount: Number(order.totalAmount),
        paymentMethod: order.paymentMethod,
        status: order.status,
        paymentStatus: order.paymentStatus,
      };
    });
  }
}
