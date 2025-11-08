import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SERVICE_URLS } from '../common/http.config';
import { firstValueFrom } from 'rxjs';
import { AuthGuards } from '../auth/auth.guard';

@Controller('users')
export class UsersGatewayController {
  constructor(private readonly http: HttpService) {}

  private authHeader(req) {
    return { Authorization: req.headers['authorization'] };
  }

  @UseGuards(AuthGuards)
  @Get('me')
  async getUser(@Req() req) {
    const res = await firstValueFrom(
      this.http.get(`${SERVICE_URLS.USER}/users/me`, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }

  @UseGuards(AuthGuards)
  @Get('stats')
  async getStats(@Req() req) {
    const res = await firstValueFrom(
      this.http.get(`${SERVICE_URLS.USER}/users/stats`, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }

  @UseGuards(AuthGuards)
  @Get('prizes')
  async getUserPrizes(@Req() req) {
    const res = await firstValueFrom(
      this.http.get(`${SERVICE_URLS.USER}/users/userPrizes`, {
        headers: this.authHeader(req),
      }),
    );
    return res.data;
  }
}
