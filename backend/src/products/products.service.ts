import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, categoryId?: string) {
    const where: any = {};

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
      include: { categories: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.products.findUnique({
      where: { id },
      include: { categories: true },
    });
  }

  async create(data: any) {
    return this.prisma.products.create({
      data,
      include: { categories: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.products.update({
      where: { id },
      data,
      include: { categories: true },
    });
  }

  async remove(id: string) {
    return this.prisma.products.delete({
      where: { id },
    });
  }
}