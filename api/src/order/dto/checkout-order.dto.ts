import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderPaymentMethod } from '@prisma/client';

export class CheckoutOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class GuestInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  city?: string;
}

export class CheckoutOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutOrderItemDto)
  items: CheckoutOrderItemDto[];

  @IsString()
  @IsOptional()
  shippingAddressId?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GuestInfoDto)
  guestInfo?: GuestInfoDto;

  @IsString()
  @IsOptional()
  promoCode?: string;

  @IsEnum(OrderPaymentMethod)
  paymentMethod: OrderPaymentMethod;

  @IsString()
  @IsOptional()
  deliveryType?: 'STANDARD' | 'EXPRESS';

  @IsString()
  @IsOptional()
  orderNotes?: string;
}
