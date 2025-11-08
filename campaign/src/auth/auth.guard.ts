import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  phone: string;
  id: string;
}

@Injectable()
export class AuthGuards implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request?.headers?.authorization;
    if (!authHeader) throw new UnauthorizedException('Authorization header missing');

    const token = authHeader.split('Bearer ')[1];
    if (!token) throw new UnauthorizedException('Invalid Authorization header format');

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) throw new Error('JWT_SECRET missing in config');

      const decoded = jwt.verify(token, secret);
      if (typeof decoded === 'string' || !decoded)
        throw new UnauthorizedException('Invalid token payload');

      const user = decoded as JwtPayload;
      request.user = user; // attach user info for further logic
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
