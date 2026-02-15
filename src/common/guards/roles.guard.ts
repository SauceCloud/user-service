import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { FastifyRequest } from 'fastify'
import { UserRole } from 'prisma/generated'

import { ROLES_KEY } from '../decorators/roles.decorator'
import { AppException } from '../exceptions/api.exceptions'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!roles || roles.length === 0) return true

    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const user = request.user

    if (!user || !user.role || !roles.includes(user.role))
      throw AppException.authForbidden()

    return true
  }
}
