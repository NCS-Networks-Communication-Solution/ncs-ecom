import { IsInt, IsPositive, IsString } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}
