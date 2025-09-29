import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(email: string, password: string, name: string, company_id: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user without include first
    const user = await this.prisma.users.create({
      data: {
        id: randomUUID(),
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        companies: {
          connect: { id: company_id },
        },
      },
    });

    // Then fetch with company data
    return this.prisma.users.findUnique({
      where: { id: user.id },
      include: { companies: true },
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: { companies: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.companies?.name,
      },
    };
  }
}