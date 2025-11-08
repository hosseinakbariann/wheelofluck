import { Controller, Post, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SERVICE_URLS } from '../common/http.config';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthGatewayController {
  constructor(private readonly http: HttpService) {}

  @Post('signup')
  async signup(@Body() dto: any) {
    const res = await firstValueFrom(
      this.http.post(`${SERVICE_URLS.USER}/auth/signup`, dto),
    );
    return res.data;
  }

  @Post('login')
  async login(@Body() dto: any) {
    const res = await firstValueFrom(
      this.http.post(`${SERVICE_URLS.USER}/auth/login`, dto),
    );
    return res.data;
  }
}
