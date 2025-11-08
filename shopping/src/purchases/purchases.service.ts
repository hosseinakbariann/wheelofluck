import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbit: RabbitMQService,
  ) {}

  async createPurchase(userId: string, goodId: string, amount: number) {
    const good = await this.prisma.good.findUnique({ where: { id: goodId } });
    if (!good) throw new BadRequestException('Invalid good selected');

    // Mock payment always succeeds
    const purchase = await this.prisma.purchase.create({
      data: {
        goodId,
        userId,
        amount,
        status: 'SUCCESS',
      },
    });

    const score = this.calculateScore(good.price);

    if (score > 0) this.rabbit.emit('user.score.added', { userId, score });
    return { message: 'Purchase completed successfully', purchase };
  }

  calculateScore(price){
    let score = 0;
    if (price >= 200000) score = 2;
    else if (price >= 100000) score = 1;
    return score;
  }
}
