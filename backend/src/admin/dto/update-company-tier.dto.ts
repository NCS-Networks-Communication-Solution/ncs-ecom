import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCompanyTierDto {
  @IsString()
  @IsNotEmpty()
  tier!: string;
}
