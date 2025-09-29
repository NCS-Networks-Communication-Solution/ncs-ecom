import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn().mockResolvedValue({
        access_token: 'mock-jwt-token',
        user: { id: '1', email: 'test@ncs.co.th', name: 'Test User' }
      }),
      login: jest.fn().mockResolvedValue({
        access_token: 'mock-jwt-token',
        user: { id: '1', email: 'test@ncs.co.th', name: 'Test User' }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
