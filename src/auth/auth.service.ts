import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash, verify } from 'argon2'

import { UserPrivateDto } from '@/common/dtos/user-private.dto'
import { AppException } from '@/common/exceptions/api.exceptions'
import { isP2002 } from '@/common/utils/prisma.utils'
import { isEqualIgnoreCase } from '@/common/utils/string.utils'
import { PrismaService } from '@/prisma/prisma.service'
import { TokenService } from '@/token/token.service'

import { LoginDto } from './dtos/login.dto'
import { RegisterDto } from './dtos/register.dto'
import { AuthMetadata } from './types/auth-metadata.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService
  ) {}

  async register(data: RegisterDto, meta: AuthMetadata) {
    const { username, birthDate, email, password } = data
    const hashPassword = await hash(password)

    return this.prisma.$transaction(async tx => {
      try {
        const user = await tx.user.create({
          data: {
            username,
            birthDate: new Date(birthDate),
            email,
            password: hashPassword,
          },
        })

        const accessToken = this.tokenService.generateAccessToken({
          sub: user.id,
          role: user.role,
          isActive: user.isActive,
        })

        const refreshToken = this.tokenService.generateRefreshToken({
          sub: user.id,
          deviceId: meta.deviceId,
        })

        await this.tokenService.saveTokenTx(
          tx,
          user.id,
          refreshToken,
          meta.deviceId,
          meta.userAgent,
          meta.ipAddress
        )

        return {
          accessToken,
          refreshToken,
          user: new UserPrivateDto(user),
        }
      } catch (err) {
        if (isP2002(err)) {
          const existing = await this.prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
            select: { email: true, username: true },
          })

          if (isEqualIgnoreCase(existing?.email, email))
            throw AppException.authEmailTaken()
          if (isEqualIgnoreCase(existing?.username, username))
            throw AppException.usernameTaken()

          throw AppException.conflict('User already exists')
        }
        throw err
      }
    })
  }

  async login(data: LoginDto, meta: AuthMetadata) {
    const { email, password } = data

    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) throw AppException.authInvalidCredentials()
    if (!user.isActive) throw AppException.userInactive()

    const isPassEquals = await verify(user.password, password)
    if (!isPassEquals) throw AppException.authInvalidCredentials()

    return this.prisma.$transaction(async tx => {
      const accessToken = this.tokenService.generateAccessToken({
        sub: user.id,
        role: user.role,
        isActive: user.isActive,
      })

      const refreshToken = this.tokenService.generateRefreshToken({
        sub: user.id,
        deviceId: meta.deviceId,
      })

      await this.tokenService.saveTokenTx(
        tx,
        user.id,
        refreshToken,
        meta.deviceId,
        meta.userAgent,
        meta.ipAddress
      )

      return { accessToken, refreshToken, user: new UserPrivateDto(user) }
    })
  }

  async logout(refreshToken: string) {
    const payload = this.tokenService.validateRefreshToken(refreshToken)
    if (!payload) return

    await this.tokenService.removeTokenByDevice(payload.sub, payload.deviceId)
    return { message: 'Logged out from device successfully' }
  }

  async logoutFromDevice(userId: string, deviceId: string) {
    await this.tokenService.removeTokenByDevice(userId, deviceId)
    return { message: 'Logged out from device successfully' }
  }

  async refresh(expiredRefreshToken: string, ipAddress: string) {
    const payload = this.tokenService.validateRefreshToken(expiredRefreshToken)
    if (!payload) throw AppException.authRefreshTokenInvalid()

    return this.prisma.$transaction(async tx => {
      const session = await tx.token.findUnique({
        where: {
          userId_deviceId: { userId: payload.sub, deviceId: payload.deviceId },
        },
      })

      if (!session) throw AppException.authRefreshTokenInvalid()

      const isValid = await verify(session.refreshHash, expiredRefreshToken)
      if (!isValid) {
        await tx.token.delete({
          where: {
            userId_deviceId: {
              userId: payload.sub,
              deviceId: payload.deviceId,
            },
          },
        })
        throw AppException.authRefreshTokenInvalid()
      }

      const user = await tx.user.findUnique({
        where: { id: payload.sub },
        select: { role: true, isActive: true },
      })

      if (!user) throw AppException.userNotFound()

      const accessToken = this.tokenService.generateAccessToken({
        sub: payload.sub,
        role: user.role,
        isActive: user.isActive,
      })

      const refreshToken = this.tokenService.generateRefreshToken({
        sub: payload.sub,
        deviceId: payload.deviceId,
      })

      await this.tokenService.saveTokenTx(
        tx,
        payload.sub,
        refreshToken,
        session.deviceId,
        session.userAgent,
        ipAddress
      )

      return { accessToken, refreshToken }
    })
  }

  async getMySessions(id: string) {
    const sessions = await this.tokenService.getUserSessions(id)
    return {
      activeSessions: sessions.length,
      maxSessions: this.configService.getOrThrow<number>('MAX_SESSIONS'),
      sessions: sessions.map(token => ({
        deviceId: token.deviceId,
        userAgent: token.userAgent,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
      })),
    }
  }
}
