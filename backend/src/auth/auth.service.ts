import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './dto/auth-response.dto';

interface UserWithCompany {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  companyId: string;
  companies: {
    id: string;
    name: string;
    tier: string;
  } | null;
}

@Injectable()
export class AuthService {
  private static readonly ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours
  private static readonly REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.prisma.users.create({
      data: {
        id: randomUUID(),
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'USER',
        companies: {
          connect: { id: dto.companyId },
        },
      },
    });

    const user = await this.findUserWithCompany(createdUser.id);

    if (!user) {
      throw new UnauthorizedException('Unable to load created user');
    }

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
      include: { companies: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user as UserWithCompany);
  }

  private async generateTokens(user: UserWithCompany): Promise<AuthResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: AuthService.ACCESS_TOKEN_TTL_SECONDS,
    });

    const { refreshToken } = await this.saveRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: AuthService.ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.companies
          ? {
              id: user.companies.id,
              name: user.companies.name,
              tier: user.companies.tier,
            }
          : null,
      },
    };
  }

  private async saveRefreshToken(userId: string) {
    await this.prisma.refresh_tokens.deleteMany({ where: { userId } });

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      { expiresIn: AuthService.REFRESH_TOKEN_TTL_SECONDS }
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + AuthService.REFRESH_TOKEN_TTL_SECONDS * 1000);

    await this.prisma.refresh_tokens.create({
      data: {
        id: randomUUID(),
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { refreshToken, expiresAt };
  }

  private findUserWithCompany(userId: string) {
    return this.prisma.users.findUnique({
      where: { id: userId },
      include: { companies: true },
    });
  }
}
