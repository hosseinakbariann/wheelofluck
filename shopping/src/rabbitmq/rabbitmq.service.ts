import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_USERS') private readonly client: ClientProxy,
  ) {}

  /**
   * Send a message and wait for a response (RPC pattern)
   */
  async send<T = any, R = any>(pattern: string, data: T): Promise<R> {
    return firstValueFrom(this.client.send<R, T>(pattern, data));
  }

  /**
   * Emit a message without waiting for a response (fire-and-forget)
   */
  emit<T = any>(pattern: string, data: T) {
    this.client.emit(pattern, data);
  }
}
