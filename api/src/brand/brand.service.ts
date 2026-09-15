import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { slugify } from '../common/utils/slug.util';
import { Prisma, StaffStatus } from '@prisma/client';
import { resolveUploadedFile } from '../common/upload/multer.config';

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
    const logoPath = file ? ((await resolveUploadedFile(file, 'brands')) || `/uploads/brands/${file.filename}`) : dto.logo || null;
    const finalSlug = dto.slug?.trim() ? slugify(dto.slug) : slugify(dto.name);

    try {
      return await this.prisma.brand.create({
        data: {
          name: dto.name,
          slug: finalSlug,
          description: dto.description || null,
          logo: logoPath,
          featured: dto.featured ?? false,
          metaTitle: dto.metaTitle || null,
          metaDescription: dto.metaDescription || null,
          status: dto.status || StaffStatus.ACTIVE,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Brand with name "${dto.name}" or slug "${finalSlug}" already exists.`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBrandDto, file?: Express.Multer.File) {
    await this.findOne(id);

    const data: Prisma.BrandUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
    }
    if (dto.slug !== undefined) {
      data.slug = dto.slug.trim() ? slugify(dto.slug) : (dto.name ? slugify(dto.name) : undefined);
    } else if (dto.name !== undefined) {
      // If name changed but slug wasn't provided, optionally check if brand currently has a slug
      const existing = await this.prisma.brand.findUnique({ where: { id } });
      if (!existing?.slug) {
        data.slug = slugify(dto.name);
      }
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined) data.metaDescription = dto.metaDescription;
    if (dto.status !== undefined) data.status = dto.status;
    if (file) {
      data.logo = (await resolveUploadedFile(file, 'brands')) || `/uploads/brands/${file.filename}`;
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
        throw new ConflictException(`Brand with name "${dto.name || id}" or slug already exists.`);
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
