import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<Record<keyof AuthService, jest.Mock>>;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 86400,
        user: { id: '1', email: 'test@ncs.co.th', name: 'Test User', role: 'USER', company: null },
      }),
      login: jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 86400,
        user: { id: '1', email: 'test@ncs.co.th', name: 'Test User', role: 'USER', company: null },
      }),
    } as unknown as Partial<Record<keyof AuthService, jest.Mock>>;

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

  it('should delegate register to service', async () => {
    const dto: RegisterDto = {
      email: 'new@ncs.co.th',
      password: 'password123',
      name: 'New User',
      companyId: 'company-1',
    };

    await controller.register(dto);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should delegate login to service', async () => {
    const dto: LoginDto = { email: 'new@ncs.co.th', password: 'password123' };

    await controller.login(dto);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });
});
