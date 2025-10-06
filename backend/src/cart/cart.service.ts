import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

interface CartProductSummary {
  id: string;
  sku: string;
  nameEn: string;
  nameTh: string;
  price: number;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionTh?: string | null;
  specifications: Record<string, unknown>;
  images: string[];
  categoryId: string;
  category: {
    id: string;
    nameEn: string;
    nameTh: string;
  } | null;
}

interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: CartProductSummary;
}

export interface CartResponse {
  id: string;
  items: CartItemResponse[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

interface BulkImportRow {
  row: number;
  productId: string;
  quantity: number;
}

interface BulkImportError {
  row: number;
  error: string;
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: BulkImportError[];
  cart: CartResponse;
}

const cartInclude = Prisma.validator<Prisma.cartsInclude>()({
  products: {
    select: {
      id: true,
      sku: true,
      nameEn: true,
      nameTh: true,
      description: true,
      descriptionEn: true,
      descriptionTh: true,
      specifications: true,
      images: true,
      price: true,
      categoryId: true,
      categories: {
        select: {
          id: true,
          nameEn: true,
          nameTh: true,
        },
      },
    },
  },
});

type CartWithProduct = Prisma.cartsGetPayload<{ include: typeof cartInclude }>;

@Injectable()
export class CartService {
  private static readonly TAX_RATE = new Prisma.Decimal(0.07);

  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string): Promise<CartResponse> {
    const items = await this.prisma.carts.findMany({
      where: { userId },
      include: cartInclude,
      orderBy: { createdAt: 'asc' },
    });

    return this.mapCartResponse(userId, items);
  }

  async addToCart(userId: string, dto: AddToCartDto): Promise<CartResponse> {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureProductExists(tx, dto.productId);
      await this.upsertCartItem(tx, userId, dto.productId, dto.quantity);
      const items = await this.fetchCartItems(tx, userId);
      return this.mapCartResponse(userId, items);
    });
  }

  async updateCartItem(userId: string, cartItemId: string, quantity: number): Promise<CartResponse> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const cartItem = await this.prisma.carts.findUnique({ where: { id: cartItemId } });
    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.carts.update({
      where: { id: cartItemId },
      data: { quantity, updatedAt: new Date() },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    const cartItem = await this.prisma.carts.findUnique({ where: { id: cartItemId } });
    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.carts.delete({ where: { id: cartItemId } });
  }

  async clearCart(userId: string): Promise<void> {
    await this.prisma.carts.deleteMany({ where: { userId } });
  }

  async bulkImport(userId: string, fileBuffer: Buffer): Promise<BulkImportResult> {
    const { rows, errors: parsingErrors } = this.parseCsv(fileBuffer);
    if (rows.length === 0 && parsingErrors.length === 0) {
      throw new BadRequestException('CSV file contains no data rows');
    }

    const errors: BulkImportError[] = [...parsingErrors];
    let success = 0;

    const cart = await this.prisma.$transaction(async (tx) => {
      for (const row of rows) {
        try {
          await this.ensureProductExists(tx, row.productId);
          await this.upsertCartItem(tx, userId, row.productId, row.quantity);
          success += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ row: row.row, error: message });
        }
      }

      const items = await this.fetchCartItems(tx, userId);
      return this.mapCartResponse(userId, items);
    });

    return {
      success,
      failed: errors.length,
      errors,
      cart,
    };
  }

  private async fetchCartItems(tx: Prisma.TransactionClient, userId: string) {
    return tx.carts.findMany({
      where: { userId },
      include: cartInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  private async ensureProductExists(tx: Prisma.TransactionClient, productId: string) {
    const product = await tx.products.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private async upsertCartItem(
    tx: Prisma.TransactionClient,
    userId: string,
    productId: string,
    quantity: number,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const existing = await tx.carts.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      await tx.carts.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: existing.quantity + quantity, updatedAt: new Date() },
      });
    } else {
      await tx.carts.create({
        data: {
          id: randomUUID(),
          userId,
          productId,
          quantity,
          updatedAt: new Date(),
        },
      });
    }
  }

  private mapCartResponse(
    userId: string,
    items: CartWithProduct[],
  ): CartResponse {
    let subtotal = new Prisma.Decimal(0);

    const mappedItems: CartItemResponse[] = items.map((item) => {
      const unitPrice = new Prisma.Decimal(item.products.price);
      const lineTotal = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(lineTotal);

      const rawSpecifications = item.products.specifications;
      const specifications =
        rawSpecifications && typeof rawSpecifications === 'object' && !Array.isArray(rawSpecifications)
          ? (rawSpecifications as Record<string, unknown>)
          : {};

      const productSummary: CartProductSummary = {
        id: item.products.id,
        sku: item.products.sku,
        nameEn: item.products.nameEn,
        nameTh: item.products.nameTh,
        price: unitPrice.toNumber(),
        description: item.products.description,
        descriptionEn: item.products.descriptionEn ?? null,
        descriptionTh: item.products.descriptionTh ?? null,
        specifications,
        images: item.products.images ?? [],
        categoryId: item.products.categoryId,
        category: item.products.categories
          ? {
              id: item.products.categories.id,
              nameEn: item.products.categories.nameEn,
              nameTh: item.products.categories.nameTh,
            }
          : null,
      };

      return {
        id: item.id,
        productId: item.products.id,
        quantity: item.quantity,
        unitPrice: Number(unitPrice.toFixed(2)),
        total: Number(lineTotal.toFixed(2)),
        product: productSummary,
      };
    });

    const tax = subtotal.mul(CartService.TAX_RATE);
    const total = subtotal.add(tax);

    const subtotalNumber = Number(subtotal.toFixed(2));
    const taxNumber = Number(tax.toFixed(2));
    const totalNumber = Number(total.toFixed(2));

    return {
      id: userId,
      items: mappedItems,
      subtotal: subtotalNumber,
      tax: taxNumber,
      total: totalNumber,
      itemCount: mappedItems.length,
    };
  }

  private parseCsv(fileBuffer: Buffer): { rows: BulkImportRow[]; errors: BulkImportError[] } {
    const content = fileBuffer.toString('utf-8');
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return { rows: [], errors: [] };
    }

    const rows: BulkImportRow[] = [];
    const errors: BulkImportError[] = [];
    const hasHeader = lines[0].toLowerCase().includes('productid');

    for (let index = hasHeader ? 1 : 0; index < lines.length; index += 1) {
      const line = lines[index];
      const rowNumber = index + 1; // 1-based numbering to match CSV editors
      const [rawProductId, rawQuantity] = line.split(',').map((value) => value?.trim() ?? '');

      if (!rawProductId || !rawQuantity) {
        errors.push({ row: rowNumber, error: 'Row must include productId and quantity' });
        continue;
      }

      const quantity = Number.parseInt(rawQuantity, 10);
      if (Number.isNaN(quantity) || quantity <= 0) {
        errors.push({ row: rowNumber, error: 'Quantity must be a positive integer' });
        continue;
      }

      rows.push({ row: rowNumber, productId: rawProductId, quantity });
    }

    return { rows, errors };
  }
}
