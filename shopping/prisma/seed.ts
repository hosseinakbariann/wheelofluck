import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.good.createMany({
    data: [
      { name: 'Wireless Headphones', description: 'Bluetooth noise cancelling', price: 350000 },
      { name: 'Smartwatch', description: 'Fitness and health tracking', price: 220000 },
      { name: 'Phone Case', description: 'Protective silicone case', price: 75000 },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
