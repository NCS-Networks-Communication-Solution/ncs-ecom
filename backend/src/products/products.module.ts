import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service'; // Correct path for your setup

@Module({
  controllers: [ProductsController],
  providers: [ProductsService], // Add PrismaService here
})
export class ProductsModule {}
