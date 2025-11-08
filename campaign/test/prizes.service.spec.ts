import { Test, TestingModule } from '@nestjs/testing';
import { PrizesService } from '../src/prizes/prizes.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PrizesService', () => {
  let service: PrizesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      prize: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn()
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrizesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PrizesService>(PrizesService);
  });

  describe('getAllPrizes', () => {
    it('should return all prizes', async () => {
      const prizes = [{ id: '1', title: 'Prize1' }];
      prisma.prize.findMany.mockResolvedValue(prizes);

      const result = await service.getAllPrizes();
      expect(result).toEqual(prizes);
      expect(prisma.prize.findMany).toHaveBeenCalled();
    });
  });

  describe('addPrize', () => {
    it('should create and return a prize', async () => {
      const dto = { key: 'p1', title: 'Prize1', payload: {}, weight: 1, singleClaim: false };
      const createdPrize = { id: '1', ...dto };
      prisma.prize.create.mockResolvedValue(createdPrize);

      const result = await service.addPrize(dto);
      expect(result).toEqual(createdPrize);
      expect(prisma.prize.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('updatePrize', () => {
    it('should update and return the prize if found', async () => {
      const id = '1';
      const data = { title: 'Updated Prize' };
      const existingPrize = { id, title: 'Prize1' };
      const updatedPrize = { ...existingPrize, ...data };

      prisma.prize.findUnique.mockResolvedValue(existingPrize);
      prisma.prize.update.mockResolvedValue(updatedPrize);

      const result = await service.updatePrize(id, data);
      expect(result).toEqual(updatedPrize);
      expect(prisma.prize.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prisma.prize.update).toHaveBeenCalledWith({ where: { id }, data });
    });

    it('should throw NotFoundException if prize does not exist', async () => {
      const id = '1';
      prisma.prize.findUnique.mockResolvedValue(null);

      await expect(service.updatePrize(id, {})).rejects.toThrow(NotFoundException);
      expect(prisma.prize.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePrize', () => {
    it('should delete prize and return success message', async () => {
      const id = '1';
      const existingPrize = { id, title: 'Prize1' };

      prisma.prize.findUnique.mockResolvedValue(existingPrize);
      prisma.prize.delete.mockResolvedValue(existingPrize);

      const result = await service.deletePrize(id);
      expect(result).toEqual({ message: 'Prize Deleted Successfully' });
      expect(prisma.prize.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prisma.prize.delete).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw NotFoundException if prize does not exist', async () => {
      const id = '1';
      prisma.prize.findUnique.mockResolvedValue(null);

      await expect(service.deletePrize(id)).rejects.toThrow(NotFoundException);
      expect(prisma.prize.delete).not.toHaveBeenCalled();
    });
  });
});
