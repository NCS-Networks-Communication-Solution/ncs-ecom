import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Clean existing data in dependency order
    console.log('🧹 Cleaning existing data...');
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

    console.log('🏢 Creating companies...');
    // Create companies
    const ncsCompany = await prisma.companies.create({
      data: {
        id: 'ncs-company-id',
        name: 'NCS Networks',
        taxId: '0105558123456',
        tier: 'ADMIN',
        updatedAt: new Date(),
      },
    });

    const testCompany = await prisma.companies.create({
      data: {
        id: 'test-company-id',
        name: 'Test Corporation',
        taxId: '0105558654321',
        tier: 'STANDARD',
        updatedAt: new Date(),
      },
    });

    console.log('👥 Creating users...');
    // Create users with bcrypt hashed passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const adminUser = await prisma.users.create({
      data: {
        id: 'admin-user-id',
        email: 'admin@ncs.co.th',
        password: adminPassword,
        name: 'System Admin',
        role: 'ADMIN',
        companyId: ncsCompany.id,
        isActive: true,
      },
    });

    const salesUser = await prisma.users.create({
      data: {
        id: 'sales-user-id',
        email: 'sales@ncs.co.th',
        password: userPassword,
        name: 'Sales User',
        role: 'USER',
        companyId: ncsCompany.id,
        isActive: true,
      },
    });

    const buyerUser = await prisma.users.create({
      data: {
        id: 'buyer-user-id',
        email: 'buyer@test.com',
        password: userPassword,
        name: 'Test Buyer',
        role: 'PURCHASER',
        companyId: testCompany.id,
        isActive: true,
      },
    });

    console.log('📂 Creating categories...');
    // Create categories
    const networkingCategory = await prisma.categories.create({
      data: {
        id: 'networking-category-id',
        name: 'networking',
        nameEn: 'Networking Equipment',
        nameTh: 'อุปกรณ์เครือข่าย',
        description: 'Switches, Routers, and Network Infrastructure',
      },
    });

    const securityCategory = await prisma.categories.create({
      data: {
        id: 'security-category-id',
        name: 'security',
        nameEn: 'Security Solutions',
        nameTh: 'ระบบความปลอดภัย',
        description: 'Firewalls, VPN, and Security Appliances',
      },
    });

    const wirelessCategory = await prisma.categories.create({
      data: {
        id: 'wireless-category-id',
        name: 'wireless',
        nameEn: 'Wireless Solutions',
        nameTh: 'อุปกรณ์ไร้สาย',
        description: 'Access Points, Controllers, and Wireless Infrastructure',
      },
    });

    console.log('📦 Creating products...');
    // Create products
    const products = [
      // Networking products
      {
        id: 'sw-24p-1g-id',
        sku: 'SW-24P-1G',
        nameEn: '24-Port Gigabit Managed Switch',
        nameTh: 'สวิตช์ 24 พอร์ต กิกะบิต แบบจัดการได้',
        description: 'Enterprise-grade 24-port gigabit managed switch with PoE+',
        price: 15000,
        stock: 25,
        categoryId: networkingCategory.id,
        updatedAt: new Date(),
      },
      {
        id: 'sw-48p-10g-id',
        sku: 'SW-48P-10G',
        nameEn: '48-Port 10G Switch',
        nameTh: 'สวิตช์ 48 พอร์ต 10 กิกะบิต',
        description: 'High-performance 48-port 10G switch for data centers',
        price: 85000,
        stock: 8,
        categoryId: networkingCategory.id,
        updatedAt: new Date(),
      },
      {
        id: 'rt-ent-5g-id',
        sku: 'RT-ENT-5G',
        nameEn: 'Enterprise 5G Router',
        nameTh: 'เราเตอร์องค์กร 5G',
        description: 'Multi-WAN router with 5G support and failover',
        price: 32000,
        stock: 15,
        categoryId: networkingCategory.id,
        updatedAt: new Date(),
      },
      // Security products
      {
        id: 'fw-utm-500-id',
        sku: 'FW-UTM-500',
        nameEn: 'UTM Firewall 500',
        nameTh: 'ไฟร์วอลล์ UTM 500',
        description: 'Unified Threat Management firewall for medium businesses',
        price: 45000,
        stock: 12,
        categoryId: securityCategory.id,
        updatedAt: new Date(),
      },
      {
        id: 'vpn-gw-100-id',
        sku: 'VPN-GW-100',
        nameEn: 'VPN Gateway 100 Users',
        nameTh: 'เกตเวย์ VPN 100 ผู้ใช้',
        description: 'Secure VPN gateway supporting up to 100 concurrent users',
        price: 28000,
        stock: 20,
        categoryId: securityCategory.id,
        updatedAt: new Date(),
      },
      // Wireless products
      {
        id: 'ap-ac-pro-id',
        sku: 'AP-AC-PRO',
        nameEn: 'WiFi 6 Access Point Pro',
        nameTh: 'จุดกระจายสัญญาณ WiFi 6 โปร',
        description: 'High-density WiFi 6 access point for enterprise',
        price: 8500,
        stock: 50,
        categoryId: wirelessCategory.id,
        updatedAt: new Date(),
      },
      {
        id: 'wlc-500-id',
        sku: 'WLC-500',
        nameEn: 'Wireless Controller 500 APs',
        nameTh: 'ตัวควบคุมไร้สาย 500 จุด',
        description: 'Centralized wireless controller for up to 500 access points',
        price: 120000,
        stock: 5,
        categoryId: wirelessCategory.id,
        updatedAt: new Date(),
      },
    ];

    for (const product of products) {
      await prisma.products.create({ data: product });
    }

    console.log('✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log('  Companies:', 2);
    console.log('  Users:', 3);
    console.log('  Categories:', 3);
    console.log('  Products:', 7);
    console.log('');
    console.log('🔐 Test Login Credentials:');
    console.log('  Admin: admin@ncs.co.th / admin123');
    console.log('  Sales: sales@ncs.co.th / user123');
    console.log('  Buyer: buyer@test.com / user123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
