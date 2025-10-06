import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { randomUUID } from 'node:crypto';
import { execSync } from 'node:child_process';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { AllExceptionsFilter } from '../src/filters/http-exception.filter';
import type { AuthResponse } from '../src/auth/dto/auth-response.dto';

const fallbackDatabaseUrl =
  process.env.E2E_DATABASE_URL ??
  process.env.DATABASE_URL ??
  'postgresql://ncsadmin:ncs2025secure@localhost:5432/ncsdb?schema=playthrough_e2e';

process.env.DATABASE_URL = fallbackDatabaseUrl;
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'ncs-jwt-secret-dev-2025';
process.env.PORT = process.env.PORT ?? '3000';

const SHOULD_SKIP_MIGRATIONS = process.env.SKIP_E2E_MIGRATIONS === 'true';

async function purgeDatabase(prisma: PrismaService) {
  await prisma.order_items.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.quote_items.deleteMany();
  await prisma.quotes.deleteMany();
  await prisma.carts.deleteMany();
  await prisma.products.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.refresh_tokens.deleteMany();
  await prisma.users.deleteMany();
  await prisma.companies.deleteMany();
}

async function seedDatabase(prisma: PrismaService) {
  const companyId = 'company-' + randomUUID();
  const adminUserId = 'admin-user-' + randomUUID();
  const categoryId = 'category-' + randomUUID();
  const productId = 'product-' + randomUUID();

  const company = await prisma.companies.create({
    data: {
      id: companyId,
      name: 'NCS Networks QA',
      taxId: '0105558000000',
      tier: 'GOLD',
      updatedAt: new Date(),
    },
  });

  const category = await prisma.categories.create({
    data: {
      id: categoryId,
      name: 'networking',
      nameEn: 'Networking Equipment',
      nameTh: 'อุปกรณ์เครือข่าย',
      description: 'Integration test category',
      level: 1,
    },
  });

  const product = await prisma.products.create({
    data: {
      id: productId,
      sku: 'SW-24P-1G',
      nameEn: '24-Port Gigabit Managed Switch',
      nameTh: 'สวิตช์จัดการ 24 พอร์ต',
      description: 'Enterprise managed switch',
      descriptionEn: 'Enterprise managed switch',
      descriptionTh: 'สวิตช์สำหรับองค์กร',
      specifications: { ports: 24 },
      images: ['https://example.com/switch.jpg'],
      price: 15000,
      stock: 50,
      categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.users.create({
    data: {
      id: adminUserId,
      email: 'admin@ncs.co.th',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
      companyId: company.id,
      isActive: true,
    },
  });

  return { company, adminUser, product, category };
}

describe('Playthrough checklist (e2e with live services)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let productId: string;
  let loginResponse: AuthResponse;
  let categoryId: string;

  beforeAll(async () => {
    if (!SHOULD_SKIP_MIGRATIONS) {
      execSync('npx prisma migrate deploy', { stdio: 'inherit', cwd: __dirname + '/..' });
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.$connect();
    await purgeDatabase(prisma);
    const seed = await seedDatabase(prisma);
    productId = seed.product.id;
    categoryId = seed.category.id;
  });

  afterAll(async () => {
    if (prisma) {
      await purgeDatabase(prisma);
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  it('GET /api/health returns an OK payload', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'NCS Backend API is running' });
  });

  it('GET /api/products honours pagination and filters', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/products?search=SW&categoryId=${categoryId}&minPrice=10000&maxPrice=20000&page=1&limit=10`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items[0].id).toBe(productId);
    expect(response.body.items[0].sku).toBe('SW-24P-1G');
  });

  it('GET /api/categories returns the category tree', async () => {
    const response = await request(app.getHttpServer()).get('/api/categories');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toMatchObject({ name: 'networking', level: 1 });
  });

  it('POST /api/auth/login issues access and refresh tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@ncs.co.th', password: 'admin123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    loginResponse = response.body;
  });

  it('POST /api/auth/refresh responds with a renewed access token', async () => {
    expect(loginResponse).toBeDefined();
    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: loginResponse.refreshToken });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe('string');
    expect(response.body.accessToken.length).toBeGreaterThan(0);
    expect(typeof response.body.refreshToken).toBe('string');
    loginResponse = response.body;
  });

  it('POST /api/cart/items adds products and returns totals', async () => {
    expect(loginResponse).toBeDefined();
    const response = await request(app.getHttpServer())
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${loginResponse.accessToken}`)
      .send({ productId, quantity: 2 });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('subtotal');
    expect(response.body.items[0]).toMatchObject({ productId, quantity: 2 });
  });
});
