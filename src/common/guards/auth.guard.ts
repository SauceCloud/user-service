import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'

import { TokenService } from '@/token/token.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>()

    const token = this.extractTokenFromHeader(request)
    if (!token) throw new UnauthorizedException()

    const payload = this.tokenService.validateAccessToken(token)
    if (!payload || !payload.isActive) throw new UnauthorizedException()

    request.user = {
      id: payload.sub,
      role: payload.role,
    }

    return true
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
