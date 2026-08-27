import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceJobDto, AssignTechnicianDto } from './dto/create-service-job.dto';
import { UpdateServiceJobStatusDto } from './dto/update-service-job-status.dto';
import { Prisma, ServiceJobStatus } from '@prisma/client';

@Injectable()
export class ServiceJobService {
  constructor(private prisma: PrismaService) {}

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
    if (query.branch) where.order = { branchId: query.branch };

    if (query.search?.trim()) {
      const s = query.search.trim();
      where.OR = [
        { device: { contains: s, mode: 'insensitive' } },
        { issueDescription: { contains: s, mode: 'insensitive' } },
        { order: { orderCode: { contains: s, mode: 'insensitive' } } },
        { order: { customer: { name: { contains: s, mode: 'insensitive' } } } },
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
          technician: { select: { id: true, name: true, phone: true } },
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
        order: {
          include: {
            customer: true,
            branch: true,
            items: true,
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
      },
      include: {
        technician: true,
        order: true,
      },
    });
  }

  async assignTechnician(id: string, dto: AssignTechnicianDto) {
    const job = await this.prisma.serviceJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Service job "${id}" not found.`);

    return this.prisma.serviceJob.update({
      where: { id },
      data: { technicianId: dto.technicianId },
      include: { technician: true, order: true },
    });
  }

  async updateStatus(id: string, dto: UpdateServiceJobStatusDto) {
    const job = await this.prisma.serviceJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException(`Service job "${id}" not found.`);

    return this.prisma.serviceJob.update({
      where: { id },
      data: { status: dto.status },
      include: { technician: true, order: true },
    });
  }
}
