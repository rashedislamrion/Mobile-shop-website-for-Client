import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { slugify } from '../common/utils/slug.util';
import { Prisma, StaffStatus } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getTree() {
    const categories = await this.prisma.category.findMany({
      where: { status: StaffStatus.ACTIVE },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const categoryMap = new Map<string, any>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const tree: any[] = [];
    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).children.push(node);
      } else {
        tree.push(node);
      }
    });

    return tree;
  }

  async findAll(parentId?: string) {
    const where: Prisma.CategoryWhereInput = {};
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' || parentId === '' ? null : parentId;
    }

    return this.prisma.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true, children: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID or slug "${id}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto, file?: Express.Multer.File) {
    let slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    if (!slug) {
      slug = `category-${Date.now()}`;
    }

    const imagePath = file ? `/uploads/categories/${file.filename}` : dto.image || null;
    const parentId = dto.parentId && dto.parentId !== 'null' && dto.parentId !== '' ? dto.parentId : null;

    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          slug,
          parentId,
          icon: dto.icon || null,
          image: imagePath,
          status: dto.status || StaffStatus.ACTIVE,
        },
        include: {
          parent: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Category slug "${slug}" already exists. Please choose a different name or slug.`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    await this.findOne(id);

    const data: Prisma.CategoryUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = slugify(dto.slug);
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.status !== undefined) data.status = dto.status;

    if (file) {
      data.image = `/uploads/categories/${file.filename}`;
    } else if (dto.image !== undefined) {
      data.image = dto.image;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === 'null' || dto.parentId === '' || dto.parentId === null) {
        data.parent = { disconnect: true };
      } else {
        if (dto.parentId === id) {
          throw new ConflictException('A category cannot be its own parent.');
        }
        data.parent = { connect: { id: dto.parentId } };
      }
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data,
        include: {
          parent: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Category slug already exists.`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: { take: 1 },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    if (category.children.length > 0) {
      throw new ConflictException(
        `Cannot delete category "${category.name}" because it has ${category.children.length} subcategory/subcategories. Please delete or reassign subcategories first.`,
      );
    }

    if (category.products.length > 0) {
      throw new ConflictException(
        `Cannot delete category "${category.name}" because it has linked products. Please reassign or delete the products first.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
