import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { AdminProductsService } from './products.service';
import { PrismaService } from '../../prisma.service';
import { CreateAdminProductDto } from './dto/create-admin-product.dto';

const baseProduct: CreateAdminProductDto = {
  sku: 'SW-24P-1G',
  nameEn: '24-Port Switch',
  nameTh: 'สวิตช์ 24 พอร์ต',
  price: 15000,
  stock: 10,
  categoryId: 'category-1',
};

describe('AdminProductsService', () => {
  let service: AdminProductsService;
  let prisma: {
    products: any;
    categories: any;
  };

  beforeEach(async () => {
    prisma = {
      products: {
        create: jest.fn().mockResolvedValue({ id: 'product-1' }),
        update: jest.fn().mockResolvedValue({ id: 'product-1' }),
      },
      categories: {
        findUnique: jest.fn().mockResolvedValue({ id: 'category-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AdminProductsService);
  });

  it('creates product when category exists', async () => {
    await expect(service.createProduct(baseProduct)).resolves.toMatchObject({ id: 'product-1' });
    expect(prisma.categories.findUnique).toHaveBeenCalledWith({ where: { id: baseProduct.categoryId } });
    expect(prisma.products.create).toHaveBeenCalled();
  });

  it('throws when creating product with missing category', async () => {
    prisma.categories.findUnique.mockResolvedValueOnce(null);

    await expect(service.createProduct(baseProduct)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.products.create).not.toHaveBeenCalled();
  });

  it('validates category before update', async () => {
    prisma.categories.findUnique.mockResolvedValueOnce({ id: 'category-1' });

    await expect(service.updateProduct('product-1', { categoryId: 'category-1' })).resolves.toMatchObject({
      id: 'product-1',
    });

    expect(prisma.categories.findUnique).toHaveBeenCalledWith({ where: { id: 'category-1' } });
    expect(prisma.products.update).toHaveBeenCalled();
  });

  it('throws when updating product to missing category', async () => {
    prisma.categories.findUnique.mockResolvedValueOnce(null);

    await expect(service.updateProduct('product-1', { categoryId: 'missing' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.products.update).not.toHaveBeenCalled();
  });
});
