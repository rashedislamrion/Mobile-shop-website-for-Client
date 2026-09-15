import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceJobDto, AssignTechnicianDto, CreateRepairJobDto } from './dto/create-service-job.dto';
import { UpdateServiceJobStatusDto } from './dto/update-service-job-status.dto';
import { Prisma, ServiceJobStatus, SaleType, OrderStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ServiceJobService {
  constructor(private prisma: PrismaService) {}

  async getNextInvoiceNo(): Promise<{ invoiceNo: string }> {
    const count = await this.prisma.serviceJob.count();
    const nextNum = count + 1;
    const padded = String(nextNum).padStart(4, '0');
    return { invoiceNo: `INV-${padded}` };
  }

  async findAll(query: {
    status?: ServiceJobStatus;
    branch?: string;
    technicianId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceJobWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.technicianId) where.technicianId = query.technicianId;
    if (query.branch) {
      where.OR = [
        { order: { branchId: query.branch } },
        { technician: { branchId: query.branch } },
      ];
    }

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { invoiceNo: { contains: s, mode: 'insensitive' } },
        { customerPhone: { contains: s, mode: 'insensitive' } },
        { customerName: { contains: s, mode: 'insensitive' } },
        { device: { contains: s, mode: 'insensitive' } },
        { model: { contains: s, mode: 'insensitive' } },
        { issueDescription: { contains: s, mode: 'insensitive' } },
        { order: { orderCode: { contains: s, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.serviceJob.count({ where }),
      this.prisma.serviceJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          technician: { select: { id: true, name: true, phone: true, profitSharePercentage: true } },
          customer: { select: { id: true, name: true, phone: true } },
          deviceType: true,
          brand: { select: { id: true, name: true } },
          materials: {
            include: {
              supplier: { select: { id: true, name: true, phone: true } },
              product: { select: { id: true, name: true } },
            },
          },
          order: {
            include: {
              customer: { select: { id: true, name: true, phone: true } },
              branch: { select: { id: true, name: true } },
            },
          },
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

  async findMy(technicianId: string) {
    return this.prisma.serviceJob.findMany({
      where: { technicianId },
      orderBy: { createdAt: 'desc' },
      include: {
        technician: { select: { id: true, name: true, phone: true, profitSharePercentage: true } },
        customer: true,
        deviceType: true,
        brand: true,
        materials: {
          include: {
            supplier: true,
            product: true,
          },
        },
        order: {
          include: {
            customer: true,
            branch: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.serviceJob.findUnique({
      where: { id },
      include: {
        technician: true,
        customer: true,
        deviceType: true,
        brand: true,
        materials: {
          include: {
            supplier: true,
            product: true,
          },
        },
        order: {
          include: {
            customer: true,
            branch: true,
            items: true,
            payments: true,
          },
        },
      },
    });
    if (!job) throw new NotFoundException(`Service job "${id}" not found.`);
    return job;
  }

  async create(dto: CreateServiceJobDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException(`Order "${dto.orderId}" not found.`);

    return this.prisma.serviceJob.create({
      data: {
        orderId: dto.orderId,
        technicianId: dto.technicianId || null,
        device: dto.device,
        issueDescription: dto.issueDescription,
        specialization: dto.specialization || null,
        serviceCharge: dto.serviceCharge,
        laborCost: dto.serviceCharge,
        totalBill: dto.serviceCharge,
        finalAmount: dto.serviceCharge,
      },
      include: {
        technician: true,
        order: true,
      },
    });
  }

  async createRepairJob(dto: CreateRepairJobDto, currentUser?: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Resolve Customer
      let customer: any = null;
      if (dto.customerId) {
        customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
      }
      if (!customer && dto.customerPhone) {
        const cleanPhone = dto.customerPhone.trim();
        customer = await tx.customer.findUnique({ where: { phone: cleanPhone } });
        if (!customer) {
          const tempPassword = await bcrypt.hash('Customer@12345', 10);
          customer = await tx.customer.create({
            data: {
              name: dto.customerName || 'Walk-in Customer',
              phone: cleanPhone,
              passwordHash: tempPassword,
              source: 'SERVICE_WALKIN',
            },
          });
        }
      }

      // 2. Resolve Invoice Number
      let invoiceNo = dto.invoiceNo?.trim();
      if (!invoiceNo) {
        const next = await this.getNextInvoiceNo();
        invoiceNo = next.invoiceNo;
      }

      // Check if invoice number already used
      const existing = await tx.serviceJob.findUnique({ where: { invoiceNo } });
      if (existing) {
        // Append timestamp suffix to guarantee uniqueness if user supplied duplicate
        invoiceNo = `${invoiceNo}-${Date.now().toString().slice(-4)}`;
      }

      // 3. Resolve Branch
      let branchId = dto.branchId;
      if (!branchId && currentUser?.branchId) {
        branchId = currentUser.branchId;
      }
      if (!branchId) {
        const defaultBranch = await tx.branch.findFirst({ orderBy: { createdAt: 'asc' } });
        branchId = defaultBranch ? defaultBranch.id : '';
      }

      // 4. Resolve Pricing & Profit Share
      const laborCost = Number(dto.laborCost || 0);
      const materialCost = Number(dto.materialCost || 0);
      const totalBill = Number(dto.totalBill || (laborCost + materialCost));
      const discount = Number(dto.discount || 0);
      const finalAmount = Number(dto.finalAmount || (totalBill - discount));
      const paidAmount = Number(dto.paidAmount || 0);
      const dueAmount = Math.max(0, finalAmount - paidAmount);

      let technicianProfitShare = 0;
      if (dto.technicianId) {
        const technician = await tx.staff.findUnique({ where: { id: dto.technicianId } });
        if (technician) {
          const rate = Number(technician.profitSharePercentage ?? technician.commissionRate ?? 0);
          // Profit share = profitSharePercentage * (finalAmount - materialCost)
          const laborProfit = Math.max(0, finalAmount - materialCost);
          technicianProfitShare = (laborProfit * rate) / 100;
        }
      }

      // 5. Create underlying Order for unified accounting, customer activities, and payment history
      let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
      if (dueAmount <= 0) {
        paymentStatus = PaymentStatus.PAID;
      } else if (paidAmount > 0) {
        paymentStatus = PaymentStatus.DUE;
      }

      const orderCode = `SRV-${invoiceNo.replace(/[^A-Za-z0-9]/g, '')}`;

      const order = await tx.order.create({
        data: {
          orderCode,
          branchId,
          customerId: customer?.id || null,
          saleType: SaleType.DIAGNOSING,
          status: OrderStatus.CONFIRMED,
          paymentStatus,
          paymentMethod: dto.payments && dto.payments.length > 0 ? (dto.payments[0].method as any) : null,
          subtotal: totalBill,
          discountAmount: discount,
          deliveryCharge: 0,
          totalAmount: finalAmount,
          paidAmount,
          dueAmount,
          staffId: currentUser?.sub || null,
          saleDate: new Date(),
        },
      });

      // 6. Create ServiceJob record
      const jobStatus: ServiceJobStatus = (dto.status as ServiceJobStatus) || ServiceJobStatus.PENDING;

      const serviceJob = await tx.serviceJob.create({
        data: {
          invoiceNo,
          orderId: order.id,
          customerId: customer?.id || null,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          referralNumber: dto.referralNumber || null,
          technicianId: dto.technicianId || null,
          device: dto.device || 'Mobile Device',
          deviceTypeId: dto.deviceTypeId || null,
          brandId: dto.brandId || null,
          model: dto.model || null,
          issueDescription: dto.issueDescription || 'Repair Service',
          problems: dto.problems || null,
          warrantyPeriod: dto.warrantyPeriod || null,
          warrantyStartDate: dto.warrantyStartDate ? new Date(dto.warrantyStartDate) : null,
          warrantyEndDate: dto.warrantyEndDate ? new Date(dto.warrantyEndDate) : null,
          laborCost,
          materialCost,
          totalBill,
          discount,
          finalAmount,
          paidAmount,
          dueAmount,
          serviceCharge: laborCost,
          paymentDetails: dto.payments ? (dto.payments as any) : undefined,
          technicianProfitShare,
          status: jobStatus,
        },
      });

      // 7. Create Material History rows (supplier-linked parts)
      if (dto.materials && Array.isArray(dto.materials)) {
        for (const mat of dto.materials) {
          if (!mat.partName?.trim()) continue;
          const cost = Number(mat.cost || 0);
          const qty = Number(mat.quantity || 1);
          const total = Number(mat.total || (cost * qty));

          await tx.serviceJobMaterial.create({
            data: {
              serviceJobId: serviceJob.id,
              partName: mat.partName.trim(),
              productId: mat.productId || null,
              supplierId: mat.supplierId || null,
              cost,
              quantity: qty,
              total,
            },
          });
        }
      }

      // 8. Create Split Payments & Customer Activity
      if (customer && dto.payments && Array.isArray(dto.payments)) {
        for (const p of dto.payments) {
          const amt = Number(p.amount || 0);
          if (amt > 0) {
            await tx.payment.create({
              data: {
                customerId: customer.id,
                orderId: order.id,
                amount: amt,
                discount: 0,
                paymentMethod: p.method || 'CASH',
              },
            });
          }
        }

        // Log Customer Activity
        await tx.customerActivity.create({
          data: {
            customerId: customer.id,
            type: 'ORDER_PLACED',
            description: `Created repair service ticket #${invoiceNo} for ৳${finalAmount.toLocaleString()}`,
            metadata: {
              serviceJobId: serviceJob.id,
              invoiceNo,
              totalBill,
              finalAmount,
              device: dto.device,
            },
          },
        });
      }

      return tx.serviceJob.findUnique({
        where: { id: serviceJob.id },
        include: {
          technician: true,
          customer: true,
          deviceType: true,
          brand: true,
          materials: {
            include: {
              supplier: true,
              product: true,
            },
          },
          order: {
            include: {
              customer: true,
              branch: true,
              items: true,
              payments: true,
            },
          },
        },
      });
    });
  }

  async assignTechnician(id: string, dto: AssignTechnicianDto) {
    const job = await this.prisma.serviceJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Service job "${id}" not found.`);

    // Recompute profit share if technician changed
    let technicianProfitShare = 0;
    if (dto.technicianId) {
      const technician = await this.prisma.staff.findUnique({ where: { id: dto.technicianId } });
      if (technician) {
        const rate = Number(technician.profitSharePercentage ?? technician.commissionRate ?? 0);
        const laborProfit = Math.max(0, Number(job.finalAmount) - Number(job.materialCost));
        technicianProfitShare = (laborProfit * rate) / 100;
      }
    }

    return this.prisma.serviceJob.update({
      where: { id },
      data: {
        technicianId: dto.technicianId,
        technicianProfitShare,
      },
      include: {
        technician: true,
        order: true,
        materials: true,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateServiceJobStatusDto) {
    const job = await this.prisma.serviceJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Service job "${id}" not found.`);

    const updatedJob = await this.prisma.serviceJob.update({
      where: { id },
      data: { status: dto.status },
      include: { technician: true, order: true },
    });

    if (dto.status === ServiceJobStatus.DELIVERED && job.orderId) {
      await this.prisma.order.update({
        where: { id: job.orderId },
        data: { status: OrderStatus.COMPLETED },
      });
    }

    return updatedJob;
  }
}
