import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateServiceJobDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsNotEmpty()
  device: string;

  @IsString()
  @IsNotEmpty()
  issueDescription: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @Transform(({ value }) => (value !== undefined && value !== '' ? Number(value) : 0))
  @IsNumber()
  serviceCharge: number;
}

export class AssignTechnicianDto {
  @IsString()
  @IsNotEmpty()
  technicianId: string;
}
