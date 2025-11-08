import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import {ConfigModule} from "@nestjs/config";
import { GoodsModule } from './goods/goods.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [PrismaModule,
    RabbitMQModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    GoodsModule,
    PurchasesModule
  ],
})
export class AppModule {}