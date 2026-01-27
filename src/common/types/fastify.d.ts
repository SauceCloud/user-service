import { UserRole } from 'prisma/generated'

export type RequestUser = {
  id: string
  role: UserRole
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: RequestUser
  }
}
