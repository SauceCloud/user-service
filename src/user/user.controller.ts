import { Body, Controller, Get, Param, Patch, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { FastifyReply } from 'fastify'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireAuth } from '@/common/decorators/require-auth.decorator'
import { RefreshCookieConfig } from '@/config/cookies.config'

import { UpdateUserDto } from './dtos/update-user.dto'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  @RequireAuth()
  @Get('me')
  async getMe(@CurrentUser('id') id: string) {
    return this.userService.getMe(id)
  }

  @Get('by-username/:username')
  async getByUsername(@Param('username') username: string) {
    return this.userService.getByUsername(username)
  }

  @RequireAuth('admin')
  @Patch('me/deactivate')
  async deactivateSelf(
    @CurrentUser('id') id: string,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    await this.userService.deactivateUser(id)

    const refreshCookie =
      this.configService.getOrThrow<RefreshCookieConfig>('cookies.refresh')
    res.clearCookie(refreshCookie.name, refreshCookie)

    return { message: 'Account deactivated successfully' }
  }

  @RequireAuth()
  @Patch('me')
  async updateProfile(
    @CurrentUser('id') id: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.userService.updateProfile(id, dto)
  }

  @RequireAuth()
  @Get('username-available/:username')
  async isUsernameAvailable(@Param('username') username: string) {
    return this.userService.isUsernameAvailable(username)
  }
}
