import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';
import { AdminProductsService } from './products.service';

@Controller('admin/products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminProductsController {
  constructor(private readonly adminProductsService: AdminProductsService) {}

  @Get()
  @Roles('ADMIN', 'SALES')
  listProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.adminProductsService.listProducts(search, categoryId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES')
  getProduct(@Param('id') id: string) {
    return this.adminProductsService.getProduct(id);
  }

  @Post()
  @Roles('ADMIN')
  createProduct(@Body() dto: CreateAdminProductDto) {
    return this.adminProductsService.createProduct(dto);
  }

  @Put(':id')
  @Roles('ADMIN')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateAdminProductDto) {
    return this.adminProductsService.updateProduct(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  removeProduct(@Param('id') id: string) {
    return this.adminProductsService.removeProduct(id);
  }
}
