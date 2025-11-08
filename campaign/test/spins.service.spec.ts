import { Test, TestingModule } from '@nestjs/testing';
import { SpinsService } from '../src/spins/spins.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { RabbitMQService } from '../src/rabbitmq/rabbitmq.service';
import { BadRequestException } from '@nestjs/common';

describe('SpinsService', () => {
  let service: SpinsService;
  let prisma: PrismaService;
  let rabbit: RabbitMQService;

  const mockPrisma: any = {
    prize: {
      findMany: jest.fn(),
    },
    spin: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockRabbit: any = {
    send: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpinsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RabbitMQService, useValue: mockRabbit },
      ],
    }).compile();

    service = module.get<SpinsService>(SpinsService);
    prisma = module.get<PrismaService>(PrismaService);
    rabbit = module.get<RabbitMQService>(RabbitMQService);

    jest.clearAllMocks();
  });

  it('should throw if user has insufficient score', async () => {
    mockRabbit.send.mockResolvedValue({ score: 0 });

    await expect(service.turnTheWheel('user1')).rejects.toThrow(
      BadRequestException,
    );

    expect(mockRabbit.send).toHaveBeenCalledWith('user.getScore', 'user1');
  });

  it('should throw if no prizes available', async () => {
    mockRabbit.send.mockResolvedValue({ score: 5 });
    mockPrisma.prize.findMany.mockResolvedValue([]);

    await expect(service.turnTheWheel('user1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should pick a prize and record spin', async () => {
    mockRabbit.send.mockResolvedValue({ score: 5 });
    const prizes = [
      { id: 'p1', title: 'Prize 1', key: 'key1', payload: {}, weight: 1, singleClaim: false },
      { id: 'p2', title: 'Prize 2', key: 'key2', payload: {}, weight: 1, singleClaim: false },
    ];
    mockPrisma.prize.findMany.mockResolvedValue(prizes);
    mockPrisma.spin.findMany.mockResolvedValue([]); // no previous spins

    const spinRecord = {
      id: 'spin1',
      prizeId: 'p1',
      title: 'Prize 1',
      userId: 'user1',
      prize: prizes[0],
      createdAt: new Date(),
    };
    mockPrisma.spin.create.mockResolvedValue(spinRecord);

    const result = await service.turnTheWheel('user1');

    expect(result).toEqual({
      message: '🎉 You won a prizes!',
      prize: {
        title: spinRecord.prize.title,
        key: spinRecord.prize.key,
        payload: spinRecord.prize.payload,
      },
    });

    expect(mockPrisma.prize.findMany).toHaveBeenCalled();
    expect(mockPrisma.spin.create).toHaveBeenCalledWith({
      data: {
        title: spinRecord.title,
        userId: 'user1',
        prizeId: spinRecord.prizeId,
      },
      include: { prize: true },
    });

    expect(mockRabbit.emit).toHaveBeenCalledWith('spin.finished', {
      id: spinRecord.id,
      prizeId: spinRecord.prizeId,
      userId: 'user1',
      date: spinRecord.createdAt,
    });
  });

  it('should pick a prize and record spin', async () => {
    mockRabbit.send.mockResolvedValue({ score: 5 });
    const prizes = [
      { id: 'p1', title: 'Prize 1', key: 'key1', payload: {}, weight: 1, singleClaim: false },
      { id: 'p2', title: 'Prize 2', key: 'key2', payload: {}, weight: 1, singleClaim: false },
    ];
    mockPrisma.prize.findMany.mockResolvedValue(prizes);
    mockPrisma.spin.findMany.mockResolvedValue([]); // no previous spins

    const spinRecord = {
      id: 'spin1',
      prizeId: 'p1',
      title: 'Prize 1',
      userId: 'user1',
      prize: prizes[0],
      createdAt: new Date(),
    };
    mockPrisma.spin.create.mockResolvedValue(spinRecord);

    // ✅ make prize selection deterministic
    jest.spyOn(Math, 'random').mockReturnValue(0); // selects first prize

    const result = await service.turnTheWheel('user1');

    expect(mockPrisma.spin.create).toHaveBeenCalledWith({
      data: {
        title: 'Prize 1',
        userId: 'user1',
        prizeId: 'p1',
      },
      include: { prize: true },
    });

    expect(mockRabbit.emit).toHaveBeenCalledWith('spin.finished', {
      id: spinRecord.id,
      prizeId: spinRecord.prizeId,
      userId: 'user1',
      date: spinRecord.createdAt,
    });

    expect(result.prize.title).toBe('Prize 1');

    // restore Math.random
    jest.spyOn(Math, 'random').mockRestore();
  });
});
