import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.carts.findMany({
      where: { userId },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            nameEn: true,
            nameTh: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mapped = items.map((item) => ({
      product: {
        id: item.products.id,
        sku: item.products.sku,
        nameEn: item.products.nameEn,
        nameTh: item.products.nameTh,
        price: Number(item.products.price),
      },
      quantity: item.quantity,
    }));

    const totals = mapped.reduce(
      (acc, item) => {
        acc.totalItems += 1;
        acc.totalQuantity += item.quantity;
        acc.subtotal += item.quantity * item.product.price;
        return acc;
      },
      { totalItems: 0, totalQuantity: 0, subtotal: 0 },
    );

    return {
      items: mapped,
      totals,
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.products.findUnique({ where: { id: dto.productId } });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const existing = await tx.carts.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: dto.productId,
          },
        },
      });

      if (existing) {
        await tx.carts.update({
          where: { userId_productId: { userId, productId: dto.productId } },
          data: { quantity: existing.quantity + dto.quantity, updatedAt: new Date() },
        });
      } else {
        await tx.carts.create({
          data: {
            id: randomUUID(),
            userId,
            productId: dto.productId,
            quantity: dto.quantity,
            updatedAt: new Date(),
          },
        });
      }

      return this.getCartWithinTransaction(tx, userId);
    });
  }

  async updateCartItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    try {
      await this.prisma.carts.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity, updatedAt: new Date() },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Cart item not found');
      }
      throw error;
    }

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string) {
    try {
      await this.prisma.carts.delete({ where: { userId_productId: { userId, productId } } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Cart item not found');
      }
      throw error;
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.prisma.carts.deleteMany({ where: { userId } });
    return this.getCart(userId);
  }

  private async getCartWithinTransaction(tx: Prisma.TransactionClient, userId: string) {
    const items = await tx.carts.findMany({
      where: { userId },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            nameEn: true,
            nameTh: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const mapped = items.map((item) => ({
      product: {
        id: item.products.id,
        sku: item.products.sku,
        nameEn: item.products.nameEn,
        nameTh: item.products.nameTh,
        price: Number(item.products.price),
      },
      quantity: item.quantity,
    }));

    const totals = mapped.reduce(
      (acc, item) => {
        acc.totalItems += 1;
        acc.totalQuantity += item.quantity;
        acc.subtotal += item.quantity * item.product.price;
        return acc;
      },
      { totalItems: 0, totalQuantity: 0, subtotal: 0 },
    );

    return {
      items: mapped,
      totals,
    };
  }
}
