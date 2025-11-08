import { Module } from '@nestjs/common';
import { SpinsController } from './spins.controller';
import { SpinsService } from './spins.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [SpinsController],
  providers: [SpinsService]
})
export class SpinsModule {}
