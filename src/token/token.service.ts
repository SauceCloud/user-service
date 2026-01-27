import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash } from 'argon2'
import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import jwt from 'jsonwebtoken'

import { PrismaService } from '@/prisma/prisma.service'
import { PrismaTx } from '@/prisma/prisma.types'

import { AccessPayloadDto } from './dtos/access-payload.dto'
import { RefreshPayloadDto } from './dtos/refresh-payload.dto'
import { AccessPayload } from './types/access-payload.type'
import { RefreshPayload } from './types/refresh-payload.type'

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  generateAccessToken(payload: AccessPayload) {
    return jwt.sign(
      payload,
      this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      {
        expiresIn: `${this.configService.getOrThrow('ACCESS_TTL_MIN')}m`,
      }
    )
  }

  generateRefreshToken(payload: RefreshPayload) {
    return jwt.sign(
      payload,
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      {
        expiresIn: `${this.configService.getOrThrow('REFRESH_TTL_DAYS')}d`,
      }
    )
  }

  validateAccessToken(token: string): AccessPayloadDto | null {
    try {
      const payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')
      )

      const dto = plainToInstance(AccessPayloadDto, payload)
      const errors = validateSync(dto, { whitelist: true })

      if (errors.length) return null

      return dto
    } catch (e) {
      return null
    }
  }

  validateRefreshToken(token: string): RefreshPayloadDto | null {
    try {
      const payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
      )

      const dto = plainToInstance(RefreshPayloadDto, payload)
      const errors = validateSync(dto, { whitelist: true })

      if (errors.length) return null

      return dto
    } catch (e) {
      return null
    }
  }

  async saveTokenTx(
    tx: PrismaTx,
    userId: string,
    refreshToken: string,
    deviceId: string,
    userAgent: string | null,
    ipAddress: string | null
  ) {
    const refreshHash = await hash(refreshToken)

    const expiresAt = new Date(
      Date.now() +
        this.configService.getOrThrow('REFRESH_TTL_DAYS') * 86_400_000
    )

    const sessions: { userId: string; deviceId: string }[] =
      await tx.token.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { userId: true, deviceId: true },
      })

    if (
      sessions.filter(s => s.deviceId != deviceId).length >=
      this.configService.getOrThrow<number>('MAX_SESSIONS')
    ) {
      await tx.token.delete({
        where: {
          userId_deviceId: {
            userId: sessions[0].userId,
            deviceId: sessions[0].deviceId,
          },
        },
      })
    }

    return tx.token.upsert({
      where: { userId_deviceId: { userId, deviceId } },
      update: { refreshHash, userAgent, ipAddress, expiresAt },
      create: {
        userId,
        deviceId,
        refreshHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    })
  }

  async removeTokenByDevice(userId: string, deviceId: string) {
    return await this.prisma.token.deleteMany({
      where: { userId, deviceId },
    })
  }

  async removeAllUserSessions(userId: string) {
    return this.prisma.token.deleteMany({ where: { userId } })
  }

  async getUserSessions(userId: string) {
    const tokens = await this.prisma.token.findMany({
      where: { userId },
      select: {
        deviceId: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return tokens
  }
}
