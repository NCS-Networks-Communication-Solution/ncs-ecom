import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma.service';
import { AdminUsersModule } from './users/users.module';
import { AdminProductsModule } from './products/products.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [AdminUsersModule, AdminProductsModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, RolesGuard],
})
export class AdminModule {}
