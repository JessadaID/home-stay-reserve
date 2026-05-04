const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clear existing data
  // Delete in order to avoid foreign key constraints
  await prisma.login.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.customer.deleteMany({});

  const passwordHash = await bcrypt.hash('1234', 10);

  // 2. Seed Admin
  console.log('Seeding Admins...');
  await prisma.admin.createMany({
    data: [
      {
        username: 'admin',
        email: 'admin@gmail.com',
        password: passwordHash,
      },
      {
        username: 'jessada',
        email: 'jessada@gmail.com',
        password: passwordHash,
      },
    ],
  });

  // 3. Seed Customer
  console.log('Seeding Customers...');
  await prisma.customer.createMany({
    data: [
      {
        name: 'User One',
        email: 'user@gmail.com',
        password: passwordHash,
        phone: '0812345678',
      },
      {
        name: 'Customer Test',
        email: 'test@gmail.com',
        password: passwordHash,
        phone: '0987654321',
      },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
