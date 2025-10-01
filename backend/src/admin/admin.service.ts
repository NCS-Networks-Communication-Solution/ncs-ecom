import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalUsers,
      activeUsers,
      totalProducts,
      totalOrders,
      totalQuotes,
      totalCompanies,
    ] = await Promise.all([
      this.prisma.users.count(),
      this.prisma.users.count({ where: { isActive: true } }),
      this.prisma.products.count(),
      this.prisma.orders.count(),
      this.prisma.quotes.count(),
      this.prisma.companies.count(),
    ]);

    return {
      totals: {
        users: totalUsers,
        activeUsers,
        products: totalProducts,
        orders: totalOrders,
        quotes: totalQuotes,
        companies: totalCompanies,
      },
    };
  }

  async listCompanies(tier?: string) {
    return this.prisma.companies.findMany({
      where: tier ? { tier } : undefined,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateCompanyTier(id: string, tier: string) {
    return this.prisma.companies.update({
      where: { id },
      data: { tier, updatedAt: new Date() },
    });
  }
}
