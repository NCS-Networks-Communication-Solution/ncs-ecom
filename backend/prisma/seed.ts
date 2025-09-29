import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // First, create a default company if it doesn't exist
  const company = await prisma.company.upsert({
    where: { id: 'ncs-company-001' },
    update: {},
    create: {
      id: 'ncs-company-001',
      name: 'NCS Network Communications',
    },
  });

  console.log('Created/Found company:', company);

  // Hash the admin password
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ncs.co.th' },
    update: {
      password: hashedAdminPassword, // Update password in case it exists
    },
    create: {
      email: 'admin@ncs.co.th',
      password: hashedAdminPassword,
      name: 'NCS Admin',
      companyId: company.id,
      role: 'ADMIN',
    },
  });

  console.log('Created/Updated admin user:', adminUser.email);

  // Create a test user
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'user@ncs.co.th' },
    update: {
      password: hashedUserPassword,
    },
    create: {
      email: 'user@ncs.co.th',
      password: hashedUserPassword,
      name: 'Test User',
      companyId: company.id,
      role: 'USER',
    },
  });

  console.log('Created/Updated test user:', testUser.email);

  console.log('✅ Database seeding completed successfully!');
  console.log('🔐 Admin credentials: admin@ncs.co.th / admin123');
  console.log('👤 Test user credentials: user@ncs.co.th / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });