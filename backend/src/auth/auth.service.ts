import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { AdminCompanySummary, AdminRole, AdminUser } from '../types/admin.types';
import { Prisma } from '@prisma/client';

interface UserWithCompany {
  id: string;
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  companyId: string;
  isActive?: boolean | null;
  companies: AdminCompanySummary | null;
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
    try {
      const existingUser = await this.prisma.users.findUnique({ where: { email: dto.email } });
      if (existingUser) {
        throw new ConflictException('Email address is already registered');
      }

      const company = await this.prisma.companies.findUnique({ where: { id: dto.companyId } });
      if (!company) {
        throw new BadRequestException('Invalid company ID');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const createdUser = await this.prisma.users.create({
        data: {
          id: randomUUID(),
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          role: 'PURCHASER',
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
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target?.includes('email')) {
            throw new ConflictException('Email address is already registered');
          }
          throw new ConflictException('Registration failed due to duplicate data');
        }

        if (error.code === 'P2025') {
          throw new BadRequestException('Invalid company ID');
        }
      }

      if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new BadRequestException('Database connection failed');
      }

      console.error('Unexpected registration error:', error);
      throw new BadRequestException('Registration failed due to an unexpected error');
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
      include: { companies: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.generateTokens(user as UserWithCompany);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload?.sub || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const storedToken = await this.prisma.refresh_tokens.findFirst({
      where: {
        userId: payload.sub,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token expired or not found');
    }

    const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.findUserWithCompany(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('Account is deactivated');
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
      user: this.mapToAdminUser(user),
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

  private mapToAdminUser(user: UserWithCompany): AdminUser {
    return {
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
    };
  }
}
