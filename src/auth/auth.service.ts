import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { hash, verify } from 'argon2'

import { UserPrivateDto } from '@/common/dtos/user-private.dto'
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

    const existedUser = await this.prisma.user.findUnique({ where: { email } })

    if (existedUser)
      throw new BadRequestException(
        'A user with this email address already exists.'
      )

    const hashPassword = await hash(password)

    return this.prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          username,
          birthDate: new Date(birthDate),
          email,
          password: hashPassword,
        },
      })

      const access = this.tokenService.generateAccessToken({
        sub: user.id,
        role: user.role,
        isActive: user.isActive,
      })

      const refresh = this.tokenService.generateRefreshToken({
        sub: user.id,
        deviceId: meta.deviceId,
      })

      await this.tokenService.saveTokenTx(
        tx,
        user.id,
        refresh,
        meta.deviceId,
        meta.userAgent,
        meta.ipAddress
      )

      return {
        access,
        refresh,
        user: new UserPrivateDto(user),
      }
    })
  }

  async login(data: LoginDto, meta: AuthMetadata) {
    const { email, password } = data

    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user || !user.isActive)
      throw new BadRequestException('Incorrect email or password')

    const isPassEquals = await verify(user.password, password)

    if (!isPassEquals)
      throw new BadRequestException('Incorrect email or password')

    return this.prisma.$transaction(async tx => {
      const access = this.tokenService.generateAccessToken({
        sub: user.id,
        role: user.role,
        isActive: user.isActive,
      })

      const refresh = this.tokenService.generateRefreshToken({
        sub: user.id,
        deviceId: meta.deviceId,
      })

      await this.tokenService.saveTokenTx(
        tx,
        user.id,
        refresh,
        meta.deviceId,
        meta.userAgent,
        meta.ipAddress
      )

      return { access, refresh, user: new UserPrivateDto(user) }
    })
  }

  async logout(refreshToken: string) {
    const payload = this.tokenService.validateRefreshToken(refreshToken)
    if (!payload) return

    await this.tokenService.removeTokenByDevice(payload.sub, payload.deviceId)
  }

  async logoutFromDevice(userId: string, deviceId: string) {
    await this.tokenService.removeTokenByDevice(userId, deviceId)
    return { message: 'Logged out from device successfully' }
  }

  async refresh(refreshToken: string, ipAddress: string) {
    const payload = this.tokenService.validateRefreshToken(refreshToken)
    if (!payload) throw new UnauthorizedException()

    return this.prisma.$transaction(async tx => {
      const session = await tx.token.findUnique({
        where: {
          userId_deviceId: { userId: payload.sub, deviceId: payload.deviceId },
        },
      })

      if (!session) throw new UnauthorizedException()

      const isValid = await verify(session.refreshHash, refreshToken)
      if (!isValid) {
        await tx.token.delete({
          where: {
            userId_deviceId: {
              userId: payload.sub,
              deviceId: payload.deviceId,
            },
          },
        })
        throw new UnauthorizedException()
      }

      const user = await tx.user.findUnique({
        where: { id: payload.sub },
        select: { role: true, isActive: true },
      })

      if (!user) throw new UnauthorizedException()

      const access = this.tokenService.generateAccessToken({
        sub: payload.sub,
        role: user.role,
        isActive: user.isActive,
      })

      const refresh = this.tokenService.generateRefreshToken({
        sub: payload.sub,
        deviceId: payload.deviceId,
      })

      await this.tokenService.saveTokenTx(
        tx,
        payload.sub,
        refresh,
        session.deviceId,
        session.userAgent,
        ipAddress
      )

      return { access, refresh }
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
