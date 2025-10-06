import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

const ROLE_OPTIONS = ['ADMIN', 'PURCHASER', 'VIEWER', 'SALES'] as const;
export type AdminCreatableRole = (typeof ROLE_OPTIONS)[number];

export class CreateAdminUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsIn(ROLE_OPTIONS)
  role!: AdminCreatableRole;

  @IsString()
  @IsNotEmpty()
  companyId!: string;
}

export { ROLE_OPTIONS as ADMIN_ROLE_OPTIONS };
