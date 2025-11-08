import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesService } from '../src/purchases/purchases.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RabbitMQService } from '../src/rabbitmq/rabbitmq.service';
import { BadRequestException } from '@nestjs/common';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let prisma: {
    good: {
      findUnique: jest.Mock;
    };
    purchase: {
      create: jest.Mock;
    };
  };
  let rabbit: {
    emit: jest.Mock;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        {
          provide: PrismaService,
          useValue: {
            good: { findUnique: jest.fn() },
            purchase: { create: jest.fn() },
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
    prisma = module.get(PrismaService);
    rabbit = module.get(RabbitMQService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma.good.findUnique).toBeDefined();
    expect(prisma.purchase.create).toBeDefined();
    expect(rabbit.emit).toBeDefined();
  });

  describe('createPurchase', () => {
    const userId = 'user1';
    const goodId = 'good1';

    it('should throw BadRequestException if good not found', async () => {
      prisma.good.findUnique.mockResolvedValue(null);

      await expect(service.createPurchase(userId, goodId, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.good.findUnique).toHaveBeenCalledWith({ where: { id: goodId } });
    });

    it('should create purchase and not emit score if price < 100000', async () => {
      prisma.good.findUnique.mockResolvedValue({ id: goodId, price: 50000 });
      prisma.purchase.create.mockResolvedValue({ id: 'purchase1', amount: 1 });

      const result = await service.createPurchase(userId, goodId, 1);

      expect(result.message).toBe('Purchase completed successfully');
      expect(prisma.purchase.create).toHaveBeenCalled();
      expect(rabbit.emit).not.toHaveBeenCalled();
    });

    it('should emit score 1 if price >= 100000', async () => {
      prisma.good.findUnique.mockResolvedValue({ id: goodId, price: 150000 });
      prisma.purchase.create.mockResolvedValue({ id: 'purchase1', amount: 1 });

      await service.createPurchase(userId, goodId, 1);

      expect(rabbit.emit).toHaveBeenCalledWith('user.score.added', { userId, score: 1 });
    });

    it('should emit score 2 if price >= 200000', async () => {
      prisma.good.findUnique.mockResolvedValue({ id: goodId, price: 250000 });
      prisma.purchase.create.mockResolvedValue({ id: 'purchase1', amount: 1 });

      await service.createPurchase(userId, goodId, 1);

      expect(rabbit.emit).toHaveBeenCalledWith('user.score.added', { userId, score: 2 });
    });
  });

  describe('calculateScore', () => {
    it('should return 0 for price < 100000', () => {
      expect(service.calculateScore(50000)).toBe(0);
    });

    it('should return 1 for price between 100000 and 199999', () => {
      expect(service.calculateScore(150000)).toBe(1);
    });

    it('should return 2 for price >= 200000', () => {
      expect(service.calculateScore(250000)).toBe(2);
    });
  });
});
