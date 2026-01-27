import { PrismaService } from './prisma.service'

export type PrismaTx = Parameters<PrismaService['$transaction']>[0] extends (
  tx: infer T
) => any
  ? T
  : never
