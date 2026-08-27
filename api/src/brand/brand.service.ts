import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Prisma, StaffStatus } from '@prisma/client';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true, series: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        series: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID "${id}" not found`);
    }

    return brand;
  }

  async create(dto: CreateBrandDto, file?: Express.Multer.File) {
    const logoPath = file ? `/uploads/brands/${file.filename}` : dto.logo || null;

    try {
      return await this.prisma.brand.create({
        data: {
          name: dto.name,
          logo: logoPath,
          status: dto.status || StaffStatus.ACTIVE,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Brand with name "${dto.name}" already exists.`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBrandDto, file?: Express.Multer.File) {
    await this.findOne(id);

    const data: Prisma.BrandUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.status !== undefined) data.status = dto.status;
    if (file) {
      data.logo = `/uploads/brands/${file.filename}`;
    } else if (dto.logo !== undefined) {
      data.logo = dto.logo;
    }

    try {
      return await this.prisma.brand.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Brand with name "${dto.name}" already exists.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: { take: 1 },
        series: { take: 1 },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID "${id}" not found`);
    }

    if (brand.products.length > 0) {
      throw new ConflictException(`Cannot delete brand "${brand.name}" because it is linked to products.`);
    }

    if (brand.series.length > 0) {
      throw new ConflictException(`Cannot delete brand "${brand.name}" because it has linked series.`);
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
