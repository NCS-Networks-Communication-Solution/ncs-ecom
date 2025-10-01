import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

interface ListUsersFilters {
  companyId?: string;
  role?: string;
  isActive?: boolean;
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(filters: ListUsersFilters = {}) {
    const users = await this.prisma.users.findMany({
      where: {
        companyId: filters.companyId,
        role: filters.role as Role | undefined,
        isActive: filters.isActive,
      },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            tier: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(AdminUsersService.sanitizeUser);
  }

  async getUserById(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      include: {
        companies: {
          select: {
            id: true,
            name: true,
            tier: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return AdminUsersService.sanitizeUser(user);
  }

  async createUser(dto: CreateAdminUserDto) {
    try {
      const user = await this.prisma.users.create({
        data: {
          id: randomUUID(),
          email: dto.email,
          name: dto.name,
          password: await bcrypt.hash(dto.password, 10),
          role: dto.role,
          companyId: dto.companyId,
        },
        include: {
          companies: {
            select: {
              id: true,
              name: true,
              tier: true,
            },
          },
        },
      });

      return AdminUsersService.sanitizeUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }

        if (error.code === 'P2003') {
          throw new BadRequestException('Company does not exist');
        }
      }

      throw new BadRequestException('Unable to create user');
    }
  }

  async updateUser(id: string, dto: UpdateAdminUserDto) {
    const data: Prisma.usersUpdateInput = {};

    if (dto.email) {
      data.email = dto.email;
    }

    if (dto.name) {
      data.name = dto.name;
    }

    if (dto.role) {
      data.role = dto.role;
    }

    if (dto.companyId) {
      data.companies = { connect: { id: dto.companyId } };
    }

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      const user = await this.prisma.users.update({
        where: { id },
        data,
        include: {
          companies: {
            select: {
              id: true,
              name: true,
              tier: true,
            },
          },
        },
      });

      return AdminUsersService.sanitizeUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User ${id} not found`);
        }

        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }

      throw new BadRequestException('Unable to update user');
    }
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    try {
      const user = await this.prisma.users.update({
        where: { id },
        data: { isActive: dto.isActive },
        include: {
          companies: {
            select: {
              id: true,
              name: true,
              tier: true,
            },
          },
        },
      });

      if (!dto.isActive) {
        await this.prisma.refresh_tokens.deleteMany({ where: { userId: id } });
      }

      return AdminUsersService.sanitizeUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`User ${id} not found`);
      }

      throw new BadRequestException('Unable to update user status');
    }
  }

  private static sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
