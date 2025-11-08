import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:true,
      transform:true,
      transformOptions:{
        enableImplicitConversion: false,
      }
    })
  )
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3002;
  await app.listen(port);
  console.log(`✅ Server running on http://localhost:${port}`);
}
bootstrap();