import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';
import { UpdateAdminProductDto } from './dto/update-admin-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(search?: string, categoryId?: string) {
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

    return this.prisma.products.findMany({
      where,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameTh: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProduct(id: string) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameTh: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async createProduct(dto: CreateAdminProductDto) {
    await this.ensureCategoryExists(dto.categoryId);

    try {
      const descriptionEn = dto.descriptionEn ?? dto.description ?? null;
      const descriptionTh = dto.descriptionTh ?? dto.description ?? null;
      const fallbackDescription = dto.description ?? descriptionEn ?? descriptionTh ?? null;

      return await this.prisma.products.create({
        data: {
          id: randomUUID(),
          sku: dto.sku,
          nameEn: dto.nameEn,
          nameTh: dto.nameTh,
          description: fallbackDescription,
          descriptionEn: descriptionEn ?? undefined,
          descriptionTh: descriptionTh ?? undefined,
          specifications: (dto.specifications ?? {}) as Prisma.JsonValue,
          images: dto.images ?? [],
          price: new Prisma.Decimal(dto.price),
          stock: dto.stock,
          categoryId: dto.categoryId,
          updatedAt: new Date(),
        },
        include: {
          categories: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('SKU must be unique');
      }

      throw new BadRequestException('Unable to create product');
    }
  }

  async updateProduct(id: string, dto: UpdateAdminProductDto) {
    const data: Prisma.productsUpdateInput = {};

    if (dto.sku) {
      data.sku = dto.sku;
    }

    if (dto.nameEn) {
      data.nameEn = dto.nameEn;
    }

    if (dto.nameTh) {
      data.nameTh = dto.nameTh;
    }

    if (dto.descriptionEn !== undefined) {
      data.descriptionEn = dto.descriptionEn;
    }

    if (dto.descriptionTh !== undefined) {
      data.descriptionTh = dto.descriptionTh;
    }

    if (dto.description !== undefined) {
      data.description = dto.description;
      if (dto.descriptionEn === undefined) {
        data.descriptionEn = dto.description;
      }
      if (dto.descriptionTh === undefined) {
        data.descriptionTh = dto.description;
      }
    }

    if (dto.price !== undefined) {
      data.price = new Prisma.Decimal(dto.price);
    }

    if (dto.stock !== undefined) {
      data.stock = dto.stock;
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
      data.categories = { connect: { id: dto.categoryId } };
    }

    if (dto.specifications !== undefined) {
      data.specifications = dto.specifications as Prisma.JsonValue;
    }

    if (dto.images !== undefined) {
      data.images = { set: dto.images };
    }

    data.updatedAt = new Date();

    try {
      return await this.prisma.products.update({
        where: { id },
        data,
        include: {
          categories: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Product ${id} not found`);
      }

      throw new BadRequestException('Unable to update product');
    }
  }

  async removeProduct(id: string) {
    try {
      await this.prisma.products.delete({ where: { id } });
      return { id };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Product ${id} not found`);
      }

      throw new BadRequestException('Unable to delete product');
    }
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.categories.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new BadRequestException(`Category ${categoryId} not found`);
    }
  }
}
