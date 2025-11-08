import { Test, TestingModule } from '@nestjs/testing';
import { UsersService, UserParams } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      userPrize: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    const userParams: UserParams = { id: 'user-1', name: 'John', iat: '', exp: '' };

    it('should return user info if user exists', async () => {
      const mockUser = { id: 'user-1', name: 'John', phone: '123', email: 'a@b.com', score: 10, repCode: 'ABC' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUser(userParams);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, name: true, phone: true, email: true, score: true, repCode: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUser(userParams)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    const userParams: UserParams = { id: 'user-1', name: 'John', iat: '', exp: '' };

    it('should return user stats if user exists', async () => {
      const mockStats = {
        score: 10,
        repCode: 'ABC',
        representative: { name: 'Rep', phone: '999' },
        referrals: [{ id: 'r1', name: 'Ref', phone: '888' }],
      };
      prisma.user.findUnique.mockResolvedValue(mockStats);

      const result = await service.getStats(userParams);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          score: true,
          repCode: true,
          representative: { select: { name: true, phone: true } },
          referrals: { select: { id: true, name: true, phone: true } },
        },
      });
      expect(result).toEqual(mockStats);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getStats(userParams)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserById', () => {
    it('should return user scores if user exists', async () => {
      const mockUser = { id: 'user-1', score: 15 };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { id: true, score: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserById('user-2');
      expect(result).toBeNull();
    });
  });
});
