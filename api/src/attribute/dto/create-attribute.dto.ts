import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];
}
