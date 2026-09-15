import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class ProductFlagsDto {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isNewest?: boolean;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isHomepage?: boolean;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isBestDeal?: boolean;
}

export class ProductVariantDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  quality?: string;

  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : 0))
  @IsNumber()
  price: number;

  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  buyingPrice?: number;

  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  wholesalePrice?: number;

  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  discountedPrice?: number;

  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  offerPrice?: number;

  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : 0))
  @IsNumber()
  stock: number;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsOptional()
  attributes?: Record<string, any>;
}

export class ProductSpecificationDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isNewest?: boolean;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isHomepage?: boolean;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  isBestDeal?: boolean;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsString()
  @IsOptional()
  seriesId?: string;

  @IsString()
  @IsOptional()
  unitId?: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  regularPrice: number;

  @Transform(({ value }) => (value !== undefined && value !== '' && value !== null ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @Transform(({ value }) => (value !== undefined && value !== '' && value !== null ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  costPrice?: number;

  @Transform(({ value }) => (value !== undefined && value !== '' && value !== null ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  buyingPrice?: number;

  @Transform(({ value }) => (value !== undefined && value !== '' && value !== null ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  wholesalePrice?: number;

  @Transform(({ value }) => (value !== undefined && value !== '' && value !== null ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  minOrderQty?: number = 1;

  @IsString()
  @IsOptional()
  warranty?: string;

  @IsString()
  @IsOptional()
  productType?: string = 'Spare Parts';

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  ogImageUrl?: string;

  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @Transform(({ value }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        parsed = [];
      }
    }
    if (Array.isArray(parsed)) {
      return parsed.map((item) => plainToInstance(ProductVariantDto, item));
    }
    return parsed;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];

  @Transform(({ value }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        parsed = [];
      }
    }
    if (Array.isArray(parsed)) {
      return parsed.map((item) => plainToInstance(ProductSpecificationDto, item));
    }
    return parsed;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  @IsOptional()
  specifications?: ProductSpecificationDto[];
}
