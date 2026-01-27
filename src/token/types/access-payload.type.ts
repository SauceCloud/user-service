import { UserRole } from 'prisma/generated'

export type AccessPayload = {
  sub: string
  role: UserRole
  isActive: boolean
}
