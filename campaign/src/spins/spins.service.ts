import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class SpinsService {
  constructor(
    private readonly prisma: PrismaService,
    private rabbit: RabbitMQService
  ) {}

  /**
   * Turn the wheel for a user
   * - Only allows one-time prizes to be won once
   * - Selects a prizes based on normalized weight probabilities
   * - Records the result in Spin table
   */
  async turnTheWheel(userId: string) {

    const { score } = await this.rabbit.send('user.getScore', userId);

    if (score < 1) {
      throw new BadRequestException('Not enough score to spin the wheel.');
    }

    // 1️⃣ Get all prizes
    const prizes = await this.prisma.prize.findMany();

    if (!prizes.length) {
      throw new BadRequestException('No prizes available.');
    }

    // 2️⃣ Get user’s previous spins results
    const previousSpins = await this.prisma.spin.findMany({
      where: { userId },
      include: { prize: true },
    });

    const alreadyWonIds = new Set(
      previousSpins
        .filter((s) => s.prize.singleClaim)
        .map((s) => s.prizeId),
    );

    // 3️⃣ Filter available prizes based on `singleClaim`
    const availablePrizes = prizes.filter((p) => {
      if (p.singleClaim && alreadyWonIds.has(p.id)) return false;
      return true;
    });

    if (!availablePrizes.length) {
      throw new BadRequestException(
        'You have already claimed all one-time prizes.',
      );
    }

    // 4️⃣ Compute total weight and normalize
    const totalWeight = availablePrizes.reduce(
      (sum, prize) => sum + prize.weight,
      0,
    );

    // 5️⃣ Pick a random prizes based on weight
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedPrize = availablePrizes[0];

    for (const prize of availablePrizes) {
      cumulative += prize.weight;
      if (random <= cumulative) {
        selectedPrize = prize;
        break;
      }
    }

    // 6️⃣ Record the spins
    const spinRecord = await this.prisma.spin.create({
      data: {
        title: selectedPrize.title,
        userId,
        prizeId: selectedPrize.id,
      },
      include: { prize: true },
    });


    this.rabbit.emit('spin.finished', {
      id: spinRecord.id,
      prizeId: selectedPrize.id,
      userId,
      date:spinRecord.createdAt
    });

    // 7️⃣ Return result
    return {
      message: '🎉 You won a prizes!',
      prize: {
        title: spinRecord.prize.title,
        key: spinRecord.prize.key,
        payload: spinRecord.prize.payload,
      },
    };
  }

}


