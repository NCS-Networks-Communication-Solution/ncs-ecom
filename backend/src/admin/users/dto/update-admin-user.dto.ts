import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ADMIN_ROLE_OPTIONS, AdminCreatableRole } from './create-admin-user.dto';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  @IsIn(ADMIN_ROLE_OPTIONS)
  role?: AdminCreatableRole;

  @IsOptional()
  @IsString()
  companyId?: string;
}
