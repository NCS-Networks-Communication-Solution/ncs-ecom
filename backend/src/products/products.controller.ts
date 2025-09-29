import { Controller, Get, Post, Put, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(search, categoryId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() data: any) {
    return this.productsService.create(data);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(id, data);
  }
}
