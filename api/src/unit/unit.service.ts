import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.unit.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${id}" not found`);
    }

    return unit;
  }

  async create(dto: CreateUnitDto) {
    const derivedCode = dto.shortCode?.trim() || dto.name.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'UNIT';

    try {
      return await this.prisma.unit.create({
        data: {
          name: dto.name,
          shortCode: derivedCode,
          status: dto.status || 'ACTIVE',
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Unit with name "${dto.name}" already exists.`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateUnitDto) {
    await this.findOne(id);

    try {
      return await this.prisma.unit.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Unit with name "${dto.name}" already exists.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        products: { take: 1 },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID "${id}" not found`);
    }

    if (unit.products.length > 0) {
      throw new ConflictException(`Cannot delete unit "${unit.name}" because it is linked to products.`);
    }

    return this.prisma.unit.delete({
      where: { id },
    });
  }
}
