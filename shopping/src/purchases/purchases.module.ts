import { Module } from '@nestjs/common';
import { PurchaseController } from './purchases.controller';
import { PurchaseService } from './purchases.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [PurchaseController],
  providers: [PurchaseService]
})
export class PurchasesModule {}
