import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create company first
  const company = await prisma.companies.upsert({
    where: { name: 'Default Company' },
    create: {
      id: 'default-company-id',
      name: 'Default Company',
      updated_at: new Date(),
    },
    update: {},
  });

  // Create admin user using UncheckedCreateInput (with company_id)
  const adminUser = await prisma.users.upsert({
    where: { email: 'admin@ncs.co.th' },
    update: {},
    create: {
      id: 'admin-user-id',
      email: 'admin@ncs.co.th',
      password: hashedPassword,
      name: 'Admin User',
      company_id: company.id,
      role: 'ADMIN',
    },
  });

  // Create test user using UncheckedCreateInput (with company_id)
  const testUser = await prisma.users.upsert({
    where: { email: 'test@ncs.co.th' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'test@ncs.co.th',
      password: hashedPassword,
      name: 'Test User',
      company_id: company.id,
      role: 'USER',
    },
  });

  console.log('Seed data created:');
  console.log('Company:', company);
  console.log('Admin User:', adminUser);
  console.log('Test User:', testUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });