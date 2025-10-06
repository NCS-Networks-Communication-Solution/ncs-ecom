import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type CategoryResponse = {
  id: string;
  name: string;
  nameEn: string;
  nameTh: string;
  description: string | null;
  parentId: string | null;
  level: number;
  productCount: number;
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(parentId?: string): Promise<CategoryResponse[]> {
    const where: Prisma.categoriesWhereInput = {};

    if (typeof parentId === 'string') {
      const normalised = parentId.trim().toLowerCase();
      if (normalised === '' || normalised === 'root' || normalised === 'null') {
        where.parentId = null;
      } else if (normalised !== 'all') {
        where.parentId = parentId;
      }
    }

    const categories = await this.prisma.categories.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ level: 'asc' }, { nameEn: 'asc' }],
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      nameEn: category.nameEn,
      nameTh: category.nameTh,
      description: category.description ?? null,
      parentId: category.parentId ?? null,
      level: category.level,
      productCount: category._count.products,
    }));
  }
}
