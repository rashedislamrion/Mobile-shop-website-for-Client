import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Prisma, StaffStatus } from '@prisma/client';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.branch.findMany({
      include: {
        manager: {
          select: { id: true, name: true, email: true, phone: true },
        },
        _count: {
          select: { staff: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublic() {
    return this.prisma.branch.findMany({
      where: {
        showInFooter: true,
        status: StaffStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, name: true, email: true, phone: true },
        },
        staff: {
          select: { id: true, name: true, email: true, phone: true, role: true },
        },
        _count: {
          select: { staff: true, orders: true },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" not found`);
    }

    return branch;
  }

  async create(dto: CreateBranchDto) {
    try {
      return await this.prisma.branch.create({
        data: {
          name: dto.name,
          code: dto.code.trim().toUpperCase(),
          type: dto.type,
          address: dto.address,
          city: dto.city,
          phone: dto.phone,
          altPhone: dto.altPhone || null,
          email: dto.email || null,
          managerId: dto.managerId || null,
          status: dto.status || StaffStatus.ACTIVE,
          operatingHours: dto.operatingHours || null,
          openingStockValue: dto.openingStockValue ? new Prisma.Decimal(dto.openingStockValue) : new Prisma.Decimal(0),
          taxRegNumber: dto.taxRegNumber || null,
          showInFooter: dto.showInFooter !== undefined ? dto.showInFooter : true,
        },
        include: {
          manager: {
            select: { id: true, name: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Branch code "${dto.code}" already exists.`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBranchDto) {
    await this.findOne(id);

    const data: Prisma.BranchUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.code !== undefined) data.code = dto.code.trim().toUpperCase();
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.altPhone !== undefined) data.altPhone = dto.altPhone || null;
    if (dto.email !== undefined) data.email = dto.email || null;
    if (dto.managerId !== undefined) {
      data.manager = dto.managerId ? { connect: { id: dto.managerId } } : { disconnect: true };
    }
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.operatingHours !== undefined) data.operatingHours = dto.operatingHours || null;
    if (dto.openingStockValue !== undefined) {
      data.openingStockValue = new Prisma.Decimal(dto.openingStockValue);
    }
    if (dto.taxRegNumber !== undefined) data.taxRegNumber = dto.taxRegNumber || null;
    if (dto.showInFooter !== undefined) data.showInFooter = dto.showInFooter;

    try {
      return await this.prisma.branch.update({
        where: { id },
        data,
        include: {
          manager: {
            select: { id: true, name: true },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Branch code already exists.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        _count: {
          select: { staff: true, orders: true },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID "${id}" not found`);
    }

    if (branch._count.staff > 0) {
      throw new ConflictException(
        `Cannot delete branch "${branch.name}" because it has ${branch._count.staff} assigned staff member(s). Please reassign staff before deleting.`,
      );
    }

    if (branch._count.orders > 0) {
      throw new ConflictException(
        `Cannot delete branch "${branch.name}" because it has linked orders.`,
      );
    }

    return this.prisma.branch.delete({
      where: { id },
    });
  }
}
