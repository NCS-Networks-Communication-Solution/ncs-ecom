import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    $transaction: jest.fn(async (actions: any[]) => Promise.all(actions)),
    products: {
      findMany: jest.fn(() => []),
      findUnique: jest.fn(() => ({ id: '1', nameEn: 'Test Product' })),
      create: jest.fn(() => ({ id: '1', nameEn: 'New Product' })),
      update: jest.fn(() => ({ id: '1', nameEn: 'Updated Product' })),
      delete: jest.fn(() => ({ id: '1' })),
      count: jest.fn(() => 0),
    },
    categories: {
      findUnique: jest.fn(() => ({ id: '1', name: 'Category' })),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all products', async () => {
    await expect(service.findAll()).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    });
    expect(mockPrismaService.products.findMany).toHaveBeenCalled();
  });
});
