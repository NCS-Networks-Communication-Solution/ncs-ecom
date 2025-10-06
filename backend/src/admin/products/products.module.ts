import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminProductsController } from './products.controller';
import { AdminProductsService } from './products.service';

@Module({
  controllers: [AdminProductsController],
  providers: [AdminProductsService, PrismaService, RolesGuard],
})
export class AdminProductsModule {}
