import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'

import { RequestUser } from '../types/fastify'

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()
    const user = request.user

    if (!user) throw new UnauthorizedException('User not authenticated')

    return data ? user[data] : user
  }
)
