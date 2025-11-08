import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.prize.createMany({
    data: [
      { key: 'discount_20', title: '20% Discount Code (Hablolmatin)', payload: { type: 'discount', value: 20, brand: 'Hablolmatin' }, weight: 1.0 },
      { key: 'discount_50', title: '50% Discount Code (Hablolmatin)', payload: { type: 'discount', value: 50, brand: 'Hablolmatin' }, weight: 0.8 },
      { key: 'lottery_1',   title: '1x Lottery Entry',                 payload: { type: 'lottery', count: 1 }, weight: 2.5, singleClaim: false },
      { key: 'lottery_3',   title: '3x Lottery Entries',               payload: { type: 'lottery', count: 3 }, weight: 1.5, singleClaim: false },
      { key: 'cash_2m',     title: '2M Toman Cash Prize',              payload: { type: 'cash', value: 2000000 }, weight: 0.2 },
      { key: 'discount_digikala', title: '30% Discount (Digikala)',   payload: { type: 'discount', value: 30, brand: 'Digikala' }, weight: 1.5 },
      { key: 'discount_talasi',   title: '30% Discount (TALASI)',     payload: { type: 'discount', value: 30, brand: 'TALASI' }, weight: 1.5 },
    ]
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

