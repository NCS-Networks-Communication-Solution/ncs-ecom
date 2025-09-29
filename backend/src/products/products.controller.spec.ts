import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const mockProductsService = {
    findAll: jest.fn(() => []),
    findOne: jest.fn(() => ({ id: '1', nameEn: 'Test Product' })),
    create: jest.fn(() => ({ id: '1', nameEn: 'New Product' })),
    update: jest.fn(() => ({ id: '1', nameEn: 'Updated Product' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all products', async () => {
    expect(await controller.findAll()).toEqual([]);
    expect(mockProductsService.findAll).toHaveBeenCalled();
  });
});
