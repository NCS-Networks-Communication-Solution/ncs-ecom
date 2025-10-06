import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameEn!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameTh!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku!: string;

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
  @Min(0)
  @Transform(({ value }) => (value === null || value === undefined ? value : Number(value)))
  price!: number;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => (value === null || value === undefined ? value : Number.parseInt(value, 10)))
  stock!: number;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}
