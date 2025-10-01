import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminUsersController } from './users.controller';
import { AdminUsersService } from './users.service';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService, PrismaService, RolesGuard],
})
export class AdminUsersModule {}
