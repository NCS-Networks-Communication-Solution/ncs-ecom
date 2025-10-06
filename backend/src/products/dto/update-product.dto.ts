import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nameEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nameTh?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descriptionEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descriptionTh?: string;

  @IsObject()
  @IsOptional()
  specifications?: Record<string, unknown>;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => (value === null || value === undefined ? value : Number(value)))
  price?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => (value === null || value === undefined ? value : Number.parseInt(value, 10)))
  stock?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  categoryId?: string;
}
