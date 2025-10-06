import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, RolesGuard],
})
export class ProductsModule {}
