// test/mocks/prisma.mock.ts
import { PrismaService } from '../../src/prisma/prisma.service';

export const prismaMock: { user: { create: jest.Mock<any, any, any>; update: jest.Mock<any, any, any>; findFirst: jest.Mock<any, any, any>; findUnique: jest.Mock<any, any, any> } } = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};
