import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateCompanyTierDto } from './dto/update-company-tier.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  @Roles('ADMIN', 'SALES')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('companies')
  @Roles('ADMIN', 'SALES')
  listCompanies(@Query('tier') tier?: string) {
    return this.adminService.listCompanies(tier);
  }

  @Put('companies/:id/tier')
  @Roles('ADMIN')
  updateCompanyTier(@Param('id') id: string, @Body() dto: UpdateCompanyTierDto) {
    return this.adminService.updateCompanyTier(id, dto.tier);
  }
}
