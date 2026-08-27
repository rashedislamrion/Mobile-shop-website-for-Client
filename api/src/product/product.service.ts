import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { slugify } from '../common/utils/slug.util';
import { Prisma, ProductStatus } from '@prisma/client';
import * as fs from 'fs';
import { join } from 'path';
import { getUploadRoot } from '../common/upload/multer.config';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private async generateUniqueSlug(baseName: string, existingId?: string): Promise<string> {
    const baseSlug = slugify(baseName) || `product-${Date.now()}`;
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findFirst({
        where: {
          slug,
          ...(existingId ? { id: { not: existingId } } : {}),
        },
        select: { id: true },
      });

      if (!existing) {
        return slug;
      }

      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  async findAllPublic(query: {
    category?: string;
    brand?: string;
    color?: string;
    quality?: string;
    guarantee?: string;
    frame?: string;
    type?: string;
    service?: string;
    sort?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    if (query.category) {
      where.OR = [
        { categoryId: query.category },
        { category: { slug: query.category } },
        { category: { parent: { slug: query.category } } },
      ];
    }

    if (query.brand) {
      const brands = query.brand.split(',').map((s) => s.trim()).filter(Boolean);
      if (brands.length > 0) {
        where.brand = {
          OR: [
            { id: { in: brands } },
            ...brands.map((b) => ({ name: { equals: b, mode: 'insensitive' as const } })),
          ],
        };
      }
    }

    const variantFilters: Prisma.ProductVariantWhereInput[] = [];
    if (query.color) {
      const colors = query.color.split(',').map((s) => s.trim()).filter(Boolean);
      if (colors.length > 0) {
        variantFilters.push({
          OR: colors.map((c) => ({ color: { equals: c, mode: 'insensitive' as const } })),
        });
      }
    }
    if (query.quality) {
      const qualities = query.quality.split(',').map((s) => s.trim()).filter(Boolean);
      if (qualities.length > 0) {
        variantFilters.push({
          OR: qualities.map((q) => ({ quality: { equals: q, mode: 'insensitive' as const } })),
        });
      }
    }
    if (variantFilters.length > 0) {
      where.variants = { some: { AND: variantFilters } };
    }

    const specFilters: Prisma.ProductSpecificationWhereInput[] = [];
    ['guarantee', 'frame', 'type', 'service'].forEach((specKey) => {
      const val = query[specKey as keyof typeof query];
      if (val && typeof val === 'string') {
        const vals = val.split(',').map((s) => s.trim()).filter(Boolean);
        vals.forEach((v) => {
          specFilters.push({
            OR: [
              { label: { contains: specKey, mode: 'insensitive' }, value: { contains: v, mode: 'insensitive' } },
              { value: { contains: v, mode: 'insensitive' } },
            ],
          });
        });
      }
    });

    if (specFilters.length > 0) {
      where.specifications = { some: { OR: specFilters } };
    }

    if (query.search) {
      const search = query.search.trim();
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { shortDescription: { contains: search, mode: 'insensitive' } },
            { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
          ],
        },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: 'desc' };
    if (query.sort === 'price_asc') {
      orderBy = { regularPrice: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { regularPrice: 'desc' };
    } else if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (query.sort === 'popular') {
      orderBy = [{ orderItems: { _count: 'desc' } }, { createdAt: 'desc' }];
    }

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          specifications: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, logo: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findBySlug(slugOrId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        specifications: true,
        category: true,
        brand: true,
        unit: true,
        reviews: {
          include: {
            customer: { select: { id: true, name: true, photo: true } },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with identifier "${slugOrId}" not found`);
    }

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: ProductStatus.ACTIVE,
      },
      take: 8,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...product,
      relatedProducts,
    };
  }

  async findAllAdmin(query: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: ProductStatus;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.status) where.status = query.status;

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, shortCode: true } },
          _count: { select: { orderItems: true } },
        },
      }),
    ]);

    const data = products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        ...p,
        totalStock,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(dto: CreateProductDto, files?: Express.Multer.File[]) {
    const slug = await this.generateUniqueSlug(dto.slug || dto.name);

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          shortDescription: dto.shortDescription || null,
          description: dto.description || null,
          categoryId: dto.categoryId,
          brandId: dto.brandId || null,
          seriesId: dto.seriesId || null,
          unitId: dto.unitId || null,
          regularPrice: new Prisma.Decimal(dto.regularPrice),
          salePrice: dto.salePrice ? new Prisma.Decimal(dto.salePrice) : null,
          costPrice: dto.costPrice ? new Prisma.Decimal(dto.costPrice) : null,
          status: dto.status || ProductStatus.DRAFT,
          metaTitle: dto.metaTitle || null,
          metaDescription: dto.metaDescription || null,
          metaKeywords: dto.metaKeywords || null,
        },
      });

      if (files && files.length > 0) {
        await tx.productImage.createMany({
          data: files.map((file, idx) => ({
            productId: product.id,
            url: `/uploads/products/${file.filename}`,
            sortOrder: idx,
          })),
        });
      }

      if (dto.variants && dto.variants.length > 0) {
        await tx.productVariant.createMany({
          data: dto.variants.map((v, idx) => ({
            productId: product.id,
            color: v.color || null,
            quality: v.quality || null,
            price: new Prisma.Decimal(v.price || dto.regularPrice),
            stock: Number(v.stock) || 0,
            sku: v.sku?.trim() || `${slug.toUpperCase()}-V${idx + 1}`,
          })),
        });
      } else {
        await tx.productVariant.create({
          data: {
            productId: product.id,
            price: new Prisma.Decimal(dto.regularPrice),
            stock: 0,
            sku: `${slug.toUpperCase()}-DEFAULT`,
          },
        });
      }

      if (dto.specifications && dto.specifications.length > 0) {
        await tx.productSpecification.createMany({
          data: dto.specifications.map((s) => ({
            productId: product.id,
            label: s.label,
            value: s.value,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          specifications: true,
          category: true,
          brand: true,
        },
      });
    });
  }

  async update(id: string, dto: UpdateProductDto, files?: Express.Multer.File[]) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    let slug = existing.slug;
    if (dto.slug && dto.slug !== existing.slug) {
      slug = await this.generateUniqueSlug(dto.slug, id);
    } else if (dto.name && dto.name !== existing.name && !dto.slug) {
      slug = await this.generateUniqueSlug(dto.name, id);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Remove requested images
      if (dto.removedImageIds && dto.removedImageIds.length > 0) {
        const toDelete = existing.images.filter((img) => dto.removedImageIds!.includes(img.id));
        for (const img of toDelete) {
          try {
            const filePath = join(process.cwd(), img.url.startsWith('/') ? img.url.slice(1) : img.url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            // Ignore file deletion errors
          }
        }
        await tx.productImage.deleteMany({
          where: { id: { in: dto.removedImageIds } },
        });
      }

      // 2. Add newly uploaded files
      if (files && files.length > 0) {
        const currentCount = await tx.productImage.count({ where: { productId: id } });
        await tx.productImage.createMany({
          data: files.map((file, idx) => ({
            productId: id,
            url: `/uploads/products/${file.filename}`,
            sortOrder: currentCount + idx,
          })),
        });
      }

      // 3. Update variants if provided
      if (dto.variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (dto.variants.length > 0) {
          await tx.productVariant.createMany({
            data: dto.variants.map((v, idx) => ({
              productId: id,
              color: v.color || null,
              quality: v.quality || null,
              price: new Prisma.Decimal(v.price ?? dto.regularPrice ?? existing.regularPrice),
              stock: Number(v.stock) || 0,
              sku: v.sku?.trim() || `${slug.toUpperCase()}-V${idx + 1}`,
            })),
          });
        }
      }

      // 4. Update specifications if provided
      if (dto.specifications !== undefined) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
        if (dto.specifications.length > 0) {
          await tx.productSpecification.createMany({
            data: dto.specifications.map((s) => ({
              productId: id,
              label: s.label,
              value: s.value,
            })),
          });
        }
      }

      // 5. Update base fields
      const updateData: Prisma.ProductUpdateInput = {
        slug,
      };
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.shortDescription !== undefined) updateData.shortDescription = dto.shortDescription || null;
      if (dto.description !== undefined) updateData.description = dto.description || null;
      if (dto.categoryId !== undefined) updateData.category = { connect: { id: dto.categoryId } };
      if (dto.brandId !== undefined) {
        updateData.brand = dto.brandId ? { connect: { id: dto.brandId } } : { disconnect: true };
      }
      if (dto.seriesId !== undefined) {
        updateData.series = dto.seriesId ? { connect: { id: dto.seriesId } } : { disconnect: true };
      }
      if (dto.unitId !== undefined) {
        updateData.unit = dto.unitId ? { connect: { id: dto.unitId } } : { disconnect: true };
      }
      if (dto.regularPrice !== undefined) updateData.regularPrice = new Prisma.Decimal(dto.regularPrice);
      if (dto.salePrice !== undefined) {
        updateData.salePrice = dto.salePrice ? new Prisma.Decimal(dto.salePrice) : null;
      }
      if (dto.costPrice !== undefined) {
        updateData.costPrice = dto.costPrice ? new Prisma.Decimal(dto.costPrice) : null;
      }
      if (dto.status !== undefined) updateData.status = dto.status;
      if (dto.metaTitle !== undefined) updateData.metaTitle = dto.metaTitle || null;
      if (dto.metaDescription !== undefined) updateData.metaDescription = dto.metaDescription || null;
      if (dto.metaKeywords !== undefined) updateData.metaKeywords = dto.metaKeywords || null;

      return tx.product.update({
        where: { id },
        data: updateData,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          specifications: true,
          category: true,
          brand: true,
        },
      });
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: { take: 1 },
        purchaseOrderItems: { take: 1 },
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (product.orderItems.length > 0 || product.purchaseOrderItems.length > 0) {
      throw new ConflictException(
        `Cannot delete product "${product.name}" with existing order history. Please set its status to Draft or Discontinued instead.`,
      );
    }

    for (const img of product.images) {
      try {
        const filePath = join(process.cwd(), img.url.startsWith('/') ? img.url.slice(1) : img.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        // Ignore file deletion errors
      }
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async posSearch(query: {
    search?: string;
    category?: string;
    branch?: string;
    limit?: number;
  }) {
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 60));

    const productWhere: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    if (query.category && query.category !== 'all') {
      productWhere.OR = [
        { categoryId: query.category },
        { category: { slug: query.category } },
        { category: { name: { contains: query.category, mode: 'insensitive' } } },
      ];
    }

    if (query.search?.trim()) {
      const s = query.search.trim();
      productWhere.AND = [
        {
          OR: [
            { name: { contains: s, mode: 'insensitive' } },
            { slug: { contains: s, mode: 'insensitive' } },
            { variants: { some: { sku: { contains: s, mode: 'insensitive' } } } },
            { specifications: { some: { value: { contains: s, mode: 'insensitive' } } } },
          ],
        },
      ];
    }

    const products = await this.prisma.product.findMany({
      where: productWhere,
      take: limit,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
        variants: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Flatten to list of variants
    const flatVariants: any[] = [];

    for (const product of products) {
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          flatVariants.push({
            id: variant.id,
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            productImage: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop',
            color: variant.color || null,
            quality: variant.quality || null,
            sku: variant.sku,
            stock: Number(variant.stock || 0),
            price: Number(variant.price || product.salePrice || product.regularPrice),
            regularPrice: Number(product.regularPrice),
            salePrice: product.salePrice ? Number(product.salePrice) : null,
            categoryName: product.category?.name || 'General',
            categoryId: product.categoryId,
            categorySlug: product.category?.slug || '',
            brandName: product.brand?.name || null,
            allVariants: product.variants.map((v) => ({
              id: v.id,
              color: v.color,
              quality: v.quality,
              sku: v.sku,
              stock: Number(v.stock || 0),
              price: Number(v.price || product.salePrice || product.regularPrice),
            })),
          });
        }
      } else {
        flatVariants.push({
          id: `pv-${product.id}`,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop',
          color: null,
          quality: null,
          sku: product.slug.toUpperCase(),
          stock: 99,
          price: Number(product.salePrice || product.regularPrice),
          regularPrice: Number(product.regularPrice),
          salePrice: product.salePrice ? Number(product.salePrice) : null,
          categoryName: product.category?.name || 'General',
          categoryId: product.categoryId,
          categorySlug: product.category?.slug || '',
          brandName: product.brand?.name || null,
          allVariants: [],
        });
      }
    }

    return flatVariants;
  }
}
