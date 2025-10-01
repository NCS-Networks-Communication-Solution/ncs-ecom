import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  quantity!: number;
}
