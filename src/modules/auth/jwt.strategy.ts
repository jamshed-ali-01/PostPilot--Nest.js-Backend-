import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret_change_me',
    });
  }

  async validate(payload: any) {
    const sysAdmin = await this.prisma.systemAdmin.findUnique({
      where: { email: payload.email }
    });
    
    const user = await this.usersService.findByEmail(payload.email);

    if (sysAdmin && user) {
      return { ...user, ...sysAdmin, isSystemAdmin: true };
    }
    
    if (sysAdmin) return { ...sysAdmin, isSystemAdmin: true };
    if (user) return { ...user, isSystemAdmin: false };

    throw new UnauthorizedException();
  }
}
