import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_SPINS') private readonly spinsClient: ClientProxy,
    @Inject('RABBITMQ_SCORES') private readonly scoresClient: ClientProxy,
  ) {}


  // async onModuleInit() {
  //   const ch = this.rabbit.ch;
  //   const q = 'campaign.user.registered'; // queue for registration events
  //   await ch.assertQueue(q, { durable: true });
  //   await ch.bindQueue(q, this.rabbit.exchange, 'user.registered');
  //
  //   ch.consume(q, async (msg) => {
  //     if (!msg) return;
  //     try {
  //       const content = JSON.parse(msg.content.toString());
  //       // content: { eventId, userId, phone, repCodeUsed }
  //       const { eventId, userId, repCodeUsed } = content;
  //       await this.campaign.awardReferralIfApplicable(userId, repCodeUsed, eventId);
  //       ch.ack(msg);
  //     } catch (err) {
  //       console.error('Error processing registration event', err);
  //       // optionally send to dead-letter or nack with requeue false
  //       ch.nack(msg, false, false);
  //     }
  //   }, { noAck: false });
  // }
  /**
   * Send a message and wait for a response (RPC pattern)
   */
  async send<T = any, R = any>(pattern: string, data: T): Promise<R> {
    return await firstValueFrom(this.spinsClient.send<R, T>(pattern, data));
  }

  /**
   * Emit a message without waiting for a response (fire-and-forget)
   */
  emit<T = any>(pattern: string, data: T) {
    this.spinsClient.emit(pattern, data);
  }
}
