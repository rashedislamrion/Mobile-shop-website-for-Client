import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSeriesDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brandId: string;
}
