import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireAuth } from '@/common/decorators/require-auth.decorator'
import { isProd } from '@/common/utils/env.util'
import { RefreshCookieConfig } from '@/config/cookies.config'

import { AuthService } from './auth.service'
import { LoginDto } from './dtos/login.dto'
import { RegisterDto } from './dtos/register.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const userAgent = req.headers['user-agent'] ?? null
    const deviceId = req.headers['x-device-id']

    if (typeof deviceId !== 'string' || !deviceId.trim())
      throw new BadRequestException('x-device-id header is required')

    const data = await this.authService.register(dto, {
      userAgent,
      deviceId,
      ipAddress: req.ip,
    })

    const refreshCookie =
      this.configService.getOrThrow<RefreshCookieConfig>('cookies.refresh')
    res.setCookie(refreshCookie.name, data.refresh, {
      ...refreshCookie,
      maxAge:
        this.configService.getOrThrow<number>('REFRESH_TTL_DAYS') * 86_400,
      secure: isProd,
    })

    return data
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const userAgent = req.headers['user-agent'] ?? null
    const deviceId = req.headers['x-device-id']

    if (typeof deviceId !== 'string' || !deviceId.trim())
      throw new BadRequestException('x-device-id header is required')

    const data = await this.authService.login(dto, {
      userAgent,
      deviceId,
      ipAddress: req.ip,
    })

    const refreshCookie =
      this.configService.getOrThrow<RefreshCookieConfig>('cookies.refresh')
    res.setCookie(refreshCookie.name, data.refresh, {
      ...refreshCookie,
      maxAge:
        this.configService.getOrThrow<number>('REFRESH_TTL_DAYS') * 86_400,
      secure: isProd,
    })

    return data
  }

  @Post('logout')
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) await this.authService.logout(refreshToken)

    const refreshCookie =
      this.configService.getOrThrow<RefreshCookieConfig>('cookies.refresh')
    res.clearCookie(refreshCookie.name, refreshCookie)

    return { message: 'Logged out successfully' }
  }

  @RequireAuth()
  @Post('logout/:deviceId')
  async logoutFromDevice(
    @CurrentUser('id') userId: string,
    @Param('deviceId') deviceId: string
  ) {
    return this.authService.logoutFromDevice(userId, deviceId)
  }

  @Post('refresh')
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const refreshToken = req.cookies['refreshToken']
    if (!refreshToken) throw new UnauthorizedException()

    const data = await this.authService.refresh(refreshToken, req.ip)

    const refreshCookie =
      this.configService.getOrThrow<RefreshCookieConfig>('cookies.refresh')
    res.setCookie(refreshCookie.name, data.refresh, {
      ...refreshCookie,
      maxAge:
        this.configService.getOrThrow<number>('REFRESH_TTL_DAYS') * 86_400,
      secure: isProd,
    })

    return data
  }

  @RequireAuth()
  @Get('sessions')
  async getMySessions(@CurrentUser('id') userId: string) {
    return this.authService.getMySessions(userId)
  }
}
