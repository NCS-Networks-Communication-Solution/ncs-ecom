import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdminUsersService } from './users.service';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @Roles('ADMIN')
  listUsers(
    @Query('companyId') companyId?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const allowedRoles = new Set(['ADMIN', 'APPROVER', 'PURCHASER', 'USER']);
    const normalizedRole =
      typeof role === 'string' && allowedRoles.has(role.toUpperCase())
        ? role.toUpperCase()
        : undefined;

    let isActive: boolean | undefined;
    if (typeof status === 'string') {
      const lowered = status.toLowerCase();
      if (lowered === 'active') {
        isActive = true;
      } else if (lowered === 'inactive') {
        isActive = false;
      }
    }

    return this.adminUsersService.listUsers({ companyId, role: normalizedRole, isActive });
  }

  @Get(':id')
  @Roles('ADMIN')
  getUser(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Post()
  @Roles('ADMIN')
  createUser(@Body() dto: CreateAdminUserDto) {
    return this.adminUsersService.createUser(dto);
  }

  @Put(':id')
  @Roles('ADMIN')
  updateUser(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.adminUsersService.updateUser(id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.adminUsersService.updateUserStatus(id, dto);
  }
}
