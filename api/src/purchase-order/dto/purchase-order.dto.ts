import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PurchaseOrderStatus } from '@prisma/client';

export class PurchaseOrderItemDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantityOrdered: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitCost: number;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsString()
  @IsOptional()
  orderDate?: string;

  @IsString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus = PurchaseOrderStatus.ORDERED;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  discount?: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  shippingCost?: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  tax?: number = 0;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  amountPaid?: number = 0;

  @IsString()
  @IsOptional()
  walletTypeId?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class ReceiveItemDto {
  @IsString()
  @IsOptional()
  purchaseOrderItemId?: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantityReceived: number;
}

export class ReceivePurchaseOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];
}
