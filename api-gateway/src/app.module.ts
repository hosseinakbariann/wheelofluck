import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthGatewayController } from './user/auth.gateway.controller';
import { UsersGatewayController } from './user/users.gateway.controller';
import { GoodsGatewayController } from './shopping/goods.gateway.controller';
import { PurchasesGatewayController } from './shopping/purchases.gateway.controller';
import { PrizesGatewayController } from './campaign/prizes.gateway.controller';
import { SpinsGatewayController } from './campaign/spins.gateway.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    })
  ],
  controllers: [
    AuthGatewayController,
    UsersGatewayController,
    GoodsGatewayController,
    PurchasesGatewayController,
    PrizesGatewayController,
    SpinsGatewayController,
  ]
})
export class AppModule {}
