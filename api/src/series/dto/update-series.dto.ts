import { IsOptional, IsString } from 'class-validator';

export class UpdateSeriesDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brandId?: string;
}
