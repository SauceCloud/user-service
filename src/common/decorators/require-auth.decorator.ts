import { applyDecorators, UseGuards } from '@nestjs/common'
import { UserRole } from 'prisma/generated'

import { AuthGuard } from '../guards/auth.guard'
import { RolesGuard } from '../guards/roles.guard'

import { Roles } from './roles.decorator'

export function RequireAuth(...roles: UserRole[]) {
  if (roles.length > 0)
    return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard))

  return UseGuards(AuthGuard)
}
