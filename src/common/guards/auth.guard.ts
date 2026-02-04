import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { FastifyRequest } from 'fastify'

import { TokenService } from '@/token/token.service'

import { AppException } from '../exceptions/api.exceptions'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>()

    const token = this.extractTokenFromHeader(request)
    if (!token) throw AppException.authInvalidToken()

    const payload = this.tokenService.validateAccessToken(token)
    if (!payload || !payload.isActive) throw AppException.authInvalidToken()

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
