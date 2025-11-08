import { Test, TestingModule } from '@nestjs/testing';
import { GoodsService } from '../src/goods/goods.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GoodsService', () => {
  let service: GoodsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      good: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoodsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GoodsService>(GoodsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllGoods', () => {
    it('should return all goods', async () => {
      const mockGoods = [
        { id: '1', name: 'Good1', price: 100 },
        { id: '2', name: 'Good2', price: 200 },
      ];
      prisma.good.findMany.mockResolvedValue(mockGoods);

      const result = await service.getAllGoods();

      expect(prisma.good.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockGoods);
    });
  });

  describe('createGood', () => {
    it('should create a new good', async () => {
      const goodData = { name: 'Good1', price: 100, description: 'Test' };
      prisma.good.create.mockResolvedValue({ id: '1', ...goodData });

      const result = await service.createGood(goodData);

      expect(prisma.good.create).toHaveBeenCalledWith({ data: goodData });
      expect(result).toEqual({ id: '1', ...goodData });
    });
  });

  describe('updateGood', () => {
    const goodId = '1';
    const updateData = { name: 'UpdatedGood', price: 150 };

    it('should update the good if it exists', async () => {
      prisma.good.findUnique.mockResolvedValue({ id: goodId, name: 'OldGood', price: 100 });
      prisma.good.update.mockResolvedValue({ id: goodId, ...updateData });

      const result = await service.updateGood(goodId, updateData);

      expect(prisma.good.findUnique).toHaveBeenCalledWith({ where: { id: goodId } });
      expect(prisma.good.update).toHaveBeenCalledWith({ where: { id: goodId }, data: updateData });
      expect(result).toEqual({ id: goodId, ...updateData });
    });

    it('should throw NotFoundException if good does not exist', async () => {
      prisma.good.findUnique.mockResolvedValue(null);

      await expect(service.updateGood(goodId, updateData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteGood', () => {
    const goodId = '1';

    it('should delete the good if it exists', async () => {
      prisma.good.findUnique.mockResolvedValue({ id: goodId, name: 'Good1', price: 100 });
      prisma.good.delete.mockResolvedValue({ id: goodId });

      const result = await service.deleteGood(goodId);

      expect(prisma.good.findUnique).toHaveBeenCalledWith({ where: { id: goodId } });
      expect(prisma.good.delete).toHaveBeenCalledWith({ where: { id: goodId } });
      expect(result).toEqual({ message: 'Good deleted successfully' });
    });

    it('should throw NotFoundException if good does not exist', async () => {
      prisma.good.findUnique.mockResolvedValue(null);

      await expect(service.deleteGood(goodId)).rejects.toThrow(NotFoundException);
    });
  });
});
