import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = this.parsePositiveInteger(page, 1, 'page');
    const parsedLimit = Math.min(this.parsePositiveInteger(limit, 20, 'limit'), 100);

    const parsedMinPrice = this.parseNumber(minPrice, 'minPrice');
    const parsedMaxPrice = this.parseNumber(maxPrice, 'maxPrice');

    return this.productsService.findAll({
      search,
      categoryId,
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      page: parsedPage,
      limit: parsedLimit,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  private parsePositiveInteger(value: string | undefined, fallback: number, field: string) {
    if (value === undefined) {
      return fallback;
    }

    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      throw new BadRequestException(`${field} must be a positive integer`);
    }

    return parsed;
  }

  private parseNumber(value: string | undefined, field: string) {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new BadRequestException(`${field} must be a number`);
    }

    return parsed;
  }
}
