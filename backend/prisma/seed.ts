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
        tier: 'GOLD',
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
        role: 'SALES',
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
    // Create parent categories
    const networkingCategory = await prisma.categories.create({
      data: {
        id: 'networking-category-id',
        name: 'networking',
        nameEn: 'Networking Equipment',
        nameTh: 'อุปกรณ์เครือข่าย',
        description: 'Switches, Routers, and Network Infrastructure',
        level: 1,
      },
    });

    const securityCategory = await prisma.categories.create({
      data: {
        id: 'security-category-id',
        name: 'security',
        nameEn: 'Security Solutions',
        nameTh: 'ระบบความปลอดภัย',
        description: 'Firewalls, VPN, and Security Appliances',
        level: 1,
      },
    });

    const wirelessCategory = await prisma.categories.create({
      data: {
        id: 'wireless-category-id',
        name: 'wireless',
        nameEn: 'Wireless Solutions',
        nameTh: 'อุปกรณ์ไร้สาย',
        description: 'Access Points, Controllers, and Wireless Infrastructure',
        level: 1,
      },
    });

    // Create child categories for hierarchy
    const switchingCategory = await prisma.categories.create({
      data: {
        id: 'switching-category-id',
        name: 'networking-switches',
        nameEn: 'Managed Switches',
        nameTh: 'สวิตช์แบบจัดการ',
        description: 'Layer 2/3 managed switches for enterprise networks',
        parent: { connect: { id: networkingCategory.id } },
        level: 2,
      },
    });

    const routingCategory = await prisma.categories.create({
      data: {
        id: 'routing-category-id',
        name: 'networking-routers',
        nameEn: 'Enterprise Routers',
        nameTh: 'เราเตอร์สำหรับองค์กร',
        description: 'High-availability WAN and 5G edge routers',
        parent: { connect: { id: networkingCategory.id } },
        level: 2,
      },
    });

    const firewallCategory = await prisma.categories.create({
      data: {
        id: 'firewall-category-id',
        name: 'security-firewalls',
        nameEn: 'Next-Gen Firewalls',
        nameTh: 'ไฟร์วอลล์ยุคใหม่',
        description: 'Unified Threat Management and perimeter security appliances',
        parent: { connect: { id: securityCategory.id } },
        level: 2,
      },
    });

    const vpnCategory = await prisma.categories.create({
      data: {
        id: 'vpn-category-id',
        name: 'security-vpn',
        nameEn: 'VPN Gateways',
        nameTh: 'เกตเวย์ VPN',
        description: 'Secure remote access and site-to-site VPN gateways',
        parent: { connect: { id: securityCategory.id } },
        level: 2,
      },
    });

    const accessPointCategory = await prisma.categories.create({
      data: {
        id: 'access-point-category-id',
        name: 'wireless-access-points',
        nameEn: 'Wi-Fi Access Points',
        nameTh: 'จุดกระจายสัญญาณ Wi-Fi',
        description: 'Indoor and outdoor Wi-Fi 6/6E access points',
        parent: { connect: { id: wirelessCategory.id } },
        level: 2,
      },
    });

    const wirelessControllerCategory = await prisma.categories.create({
      data: {
        id: 'wireless-controller-category-id',
        name: 'wireless-controllers',
        nameEn: 'Wireless Controllers',
        nameTh: 'คอนโทรลเลอร์ระบบไร้สาย',
        description: 'Centralised management controllers for large wireless deployments',
        parent: { connect: { id: wirelessCategory.id } },
        level: 2,
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
        descriptionEn: 'Enterprise-grade 24-port gigabit managed switch with PoE+',
        descriptionTh: 'สวิตช์กิกะบิต 24 พอร์ตสำหรับงานองค์กร รองรับ PoE+',
        specifications: {
          ports: 24,
          poe: 'PoE+',
          uplink: '2 x SFP+',
        },
        images: ['https://cdn.example.com/products/sw-24p-1g/main.jpg'],
        price: 15000,
        stock: 25,
        categoryId: switchingCategory.id,
        updatedAt: new Date(),
      },
      {
        id: 'sw-48p-10g-id',
        sku: 'SW-48P-10G',
        nameEn: '48-Port 10G Switch',
        nameTh: 'สวิตช์ 48 พอร์ต 10 กิกะบิต',
        description: 'High-performance 48-port 10G switch for data centers',
        descriptionEn: 'High-performance 48-port 10G switch for data centers',
        descriptionTh: 'สวิตช์ประสิทธิภาพสูง 48 พอร์ต 10G สำหรับดาต้าเซ็นเตอร์',
        specifications: {
          ports: 48,
          uplink: '6 x QSFP+',
          stacking: true,
        },
        images: ['https://cdn.example.com/products/sw-48p-10g/main.jpg'],
        price: 85000,
        stock: 8,
        categoryId: switchingCategory.id,
        updatedAt: new Date(),
      },
      {
        id: 'rt-ent-5g-id',
        sku: 'RT-ENT-5G',
        nameEn: 'Enterprise 5G Router',
        nameTh: 'เราเตอร์องค์กร 5G',
        description: 'Multi-WAN router with 5G support and failover',
        descriptionEn: 'Multi-WAN enterprise router with 5G failover',
        descriptionTh: 'เราเตอร์องค์กร รองรับ Multi-WAN พร้อม 5G Failover',
        specifications: {
          wan: 4,
          fiveG: true,
          throughputMbps: 2500,
        },
        images: ['https://cdn.example.com/products/rt-ent-5g/main.jpg'],
        price: 32000,
        stock: 15,
        categoryId: routingCategory.id,
        updatedAt: new Date(),
      },
      // Security products
      {
        id: 'fw-utm-500-id',
        sku: 'FW-UTM-500',
        nameEn: 'UTM Firewall 500',
        nameTh: 'ไฟร์วอลล์ UTM 500',
        description: 'Unified Threat Management firewall for medium businesses',
        descriptionEn: 'UTM firewall designed for medium-sized businesses',
        descriptionTh: 'ไฟร์วอลล์ UTM สำหรับธุรกิจขนาดกลาง',
        specifications: {
          throughputMbps: 1800,
          vpn: 'IPSec/SSL',
          highAvailability: true,
        },
        images: ['https://cdn.example.com/products/fw-utm-500/main.jpg'],
        price: 45000,
        stock: 12,
        categoryId: firewallCategory.id,
        updatedAt: new Date(),
      },
      {
        id: 'vpn-gw-100-id',
        sku: 'VPN-GW-100',
        nameEn: 'VPN Gateway 100 Users',
        nameTh: 'เกตเวย์ VPN 100 ผู้ใช้',
        description: 'Secure VPN gateway supporting up to 100 concurrent users',
        descriptionEn: 'Secure VPN gateway supporting up to 100 concurrent users',
        descriptionTh: 'เกตเวย์ VPN ความปลอดภัยสูง รองรับผู้ใช้พร้อมกัน 100 คน',
        specifications: {
          concurrentUsers: 100,
          vpnProtocols: ['IPSec', 'SSL VPN'],
          formFactor: '1U',
        },
        images: ['https://cdn.example.com/products/vpn-gw-100/main.jpg'],
        price: 28000,
        stock: 20,
        categoryId: vpnCategory.id,
        updatedAt: new Date(),
      },
      // Wireless products
      {
        id: 'ap-ac-pro-id',
        sku: 'AP-AC-PRO',
        nameEn: 'WiFi 6 Access Point Pro',
        nameTh: 'จุดกระจายสัญญาณ WiFi 6 โปร',
        description: 'High-density WiFi 6 access point for enterprise',
        descriptionEn: 'High-density Wi-Fi 6 access point for enterprise deployments',
        descriptionTh: 'จุดกระจายสัญญาณ Wi-Fi 6 สำหรับองค์กรความหนาแน่นสูง',
        specifications: {
          wifiStandard: '802.11ax',
          spatialStreams: 4,
          poe: '802.3at',
        },
        images: ['https://cdn.example.com/products/ap-ac-pro/main.jpg'],
        price: 8500,
        stock: 50,
        categoryId: accessPointCategory.id,
        updatedAt: new Date(),
      },
      {
        id: 'wlc-500-id',
        sku: 'WLC-500',
        nameEn: 'Wireless Controller 500 APs',
        nameTh: 'ตัวควบคุมไร้สาย 500 จุด',
        description: 'Centralized wireless controller for up to 500 access points',
        descriptionEn: 'Centralised wireless controller supporting up to 500 APs',
        descriptionTh: 'คอนโทรลเลอร์ไร้สายแบบศูนย์กลาง รองรับ AP สูงสุด 500 ตัว',
        specifications: {
          managedAps: 500,
          redundancy: 'N+1',
          uplink: '4 x 10G',
        },
        images: ['https://cdn.example.com/products/wlc-500/main.jpg'],
        price: 120000,
        stock: 5,
        categoryId: wirelessControllerCategory.id,
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
