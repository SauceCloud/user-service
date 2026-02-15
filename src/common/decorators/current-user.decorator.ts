import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { FastifyRequest } from 'fastify'

import { AppException } from '../exceptions/api.exceptions'
import { RequestUser } from '../types/fastify'

export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()
    const user = request.user

    if (!user) throw AppException.authUnauthorized()

    return data ? user[data] : user
  }
)
