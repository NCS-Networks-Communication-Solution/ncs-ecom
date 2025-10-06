import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';

interface FindAllOptions {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(options: FindAllOptions = {}) {
    const { search, categoryId, minPrice, maxPrice, page = 1, limit = 20 } = options;
    const where: Prisma.productsWhereInput = {};

    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameTh: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.price.lte = new Prisma.Decimal(maxPrice);
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.products.findMany({
        where,
        include: { categories: true },
        skip,
        take: limit,
        orderBy: { nameEn: 'asc' },
      }),
      this.prisma.products.count({ where }),
    ]);

    const hasMore = skip + items.length < total;

    return {
      items,
      total,
      page,
      limit,
      hasMore,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: { categories: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    await this.ensureCategoryExists(dto.categoryId);

    const existingSku = await this.prisma.products.findUnique({ where: { sku: dto.sku } });
    if (existingSku) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
    }

    const descriptionEn = dto.descriptionEn ?? dto.description ?? null;
    const descriptionTh = dto.descriptionTh ?? dto.description ?? null;
    const fallbackDescription = dto.description ?? descriptionEn ?? descriptionTh ?? null;

    const productData: Prisma.productsCreateInput = {
      id: randomUUID(),
      sku: dto.sku,
      nameEn: dto.nameEn,
      nameTh: dto.nameTh,
      description: fallbackDescription ?? undefined,
      descriptionEn: descriptionEn ?? undefined,
      descriptionTh: descriptionTh ?? undefined,
      specifications: (dto.specifications ?? {}) as Prisma.JsonValue,
      images: dto.images ?? [],
      price: new Prisma.Decimal(dto.price),
      stock: dto.stock,
      createdAt: new Date(),
      updatedAt: new Date(),
      categories: {
        connect: { id: dto.categoryId },
      },
    };

    try {
      return await this.prisma.products.create({
        data: productData,
        include: { categories: true },
      });
    } catch (error) {
      throw new ConflictException('Failed to create product. Check SKU and category.');
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const productData: Prisma.productsUpdateInput = {
      updatedAt: new Date(),
    };

    if (dto.nameEn !== undefined) {
      productData.nameEn = dto.nameEn;
    }

    if (dto.nameTh !== undefined) {
      productData.nameTh = dto.nameTh;
    }

    if (dto.descriptionEn !== undefined) {
      productData.descriptionEn = dto.descriptionEn;
    }

    if (dto.descriptionTh !== undefined) {
      productData.descriptionTh = dto.descriptionTh;
    }

    if (dto.description !== undefined) {
      productData.description = dto.description;
      if (dto.descriptionEn === undefined) {
        productData.descriptionEn = dto.description;
      }
      if (dto.descriptionTh === undefined) {
        productData.descriptionTh = dto.description;
      }
    }

    if (dto.price !== undefined) {
      productData.price = new Prisma.Decimal(dto.price);
    }

    if (dto.stock !== undefined) {
      productData.stock = dto.stock;
    }

    if (dto.categoryId) {
      productData.categories = { connect: { id: dto.categoryId } };
    }

    if (dto.specifications !== undefined) {
      productData.specifications = dto.specifications as Prisma.JsonValue;
    }

    if (dto.images !== undefined) {
      productData.images = { set: dto.images };
    }

    try {
      return await this.prisma.products.update({
        where: { id },
        data: productData,
        include: { categories: true },
      });
    } catch (error) {
      throw new ConflictException('Failed to update product.');
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.products.delete({
      where: { id },
      include: { categories: true },
    });
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.categories.findUnique({ where: { id: categoryId } });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }
  }
}
