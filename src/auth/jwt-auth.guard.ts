import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      console.log('Token d’authentification manquant')
      throw new UnauthorizedException('Token d’authentification manquant');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      console.log('Format de token invalide')
      throw new UnauthorizedException('Format de token invalide');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      request.user = payload;
    } catch {
      console.log('Token invalide ou expiré')
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    return true;
  }
}