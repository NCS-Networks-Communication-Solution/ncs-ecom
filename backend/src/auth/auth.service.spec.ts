import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrismaService: any;
  let mockJwtService: Pick<JwtService, 'sign'>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPrismaService = {
      users: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      refresh_tokens: {
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
    };

    mockJwtService = {
      sign: jest.fn(),
    } as unknown as Pick<JwtService, 'sign'>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should register and return auth response', async () => {
    const dto: RegisterDto = {
      email: 'new@ncs.co.th',
      password: 'password123',
      name: 'New User',
      companyId: 'company-1',
    };

    mockPrismaService.users.create.mockResolvedValue({ id: 'user-1' });
    mockPrismaService.users.findUnique.mockResolvedValue({
      id: 'user-1',
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      name: dto.name,
      role: 'USER',
      companyId: dto.companyId,
      companies: { id: dto.companyId, name: 'Company 1', tier: 'STANDARD' },
    });

    (mockJwtService.sign as jest.Mock)
      .mockReturnValueOnce('mock-access-token')
      .mockReturnValueOnce('mock-refresh-token');

    const result = await service.register(dto);

    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
    expect(result.user.company?.name).toBe('Company 1');
    expect(mockPrismaService.refresh_tokens.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(mockPrismaService.refresh_tokens.create).toHaveBeenCalled();
  });

  it('should login and return auth response', async () => {
    const dto: LoginDto = {
      email: 'admin@ncs.co.th',
      password: 'password123',
    };

    mockPrismaService.users.findUnique.mockResolvedValue({
      id: 'user-2',
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      name: 'Admin User',
      role: 'ADMIN',
      companyId: 'company-2',
      companies: { id: 'company-2', name: 'Company 2', tier: 'ADMIN' },
    });

    (mockJwtService.sign as jest.Mock)
      .mockReturnValueOnce('mock-access-token')
      .mockReturnValueOnce('mock-refresh-token');

    const result = await service.login(dto);

    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
    expect(mockPrismaService.refresh_tokens.create).toHaveBeenCalled();
  });
});
