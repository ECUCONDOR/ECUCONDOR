const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
  const hashedPassword = await bcrypt.hash('ecucondor0812', 10);
  
  await prisma.user.upsert({
    where: { email: 'ecucondor@gmail.com' },
    update: {},
    create: {
      email: 'ecucondor@gmail.com',
      password: hashedPassword,
      name: 'Eduardo',
      role: 'admin'
    }
  });

  console.log('Usuario creado exitosamente');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
