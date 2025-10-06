import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { AdminModule } from './admin/admin.module';
import { CartModule } from './cart/cart.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [AuthModule, UsersModule, ProductsModule, AdminModule, CartModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
