import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockPrismaService = {
    products: {
      findMany: jest.fn(() => []),
      findUnique: jest.fn(() => ({ id: '1', nameEn: 'Test Product' })),
      create: jest.fn(() => ({ id: '1', nameEn: 'New Product' })),
      update: jest.fn(() => ({ id: '1', nameEn: 'Updated Product' })),
      delete: jest.fn(() => ({ id: '1' })),
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
    expect(await service.findAll()).toEqual([]);
    expect(mockPrismaService.products.findMany).toHaveBeenCalled();
  });
});
