import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import {ConfigModule} from "@nestjs/config";
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserInterceptor } from './users/interceptor/user.interceptor';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    })
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService,PrismaService
    ,{
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor
    }],
})
export class AppModule {}
