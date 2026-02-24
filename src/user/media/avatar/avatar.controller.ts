import { Body, Controller, Post } from '@nestjs/common'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireAuth } from '@/common/decorators/require-auth.decorator'

import { AvatarService } from './avatar.service'
import { ConfirmAvatarDto } from './dtos/confirm-avatar.dto'
import { GetUploadUrlDto } from './dtos/get-upload-url.dto'

@Controller('users/me/avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @RequireAuth()
  @Post('upload-url')
  async getUploadUrl(
    @CurrentUser('id') id: string,
    @Body() dto: GetUploadUrlDto
  ) {
    return this.avatarService.getUploadUrl(id, dto.contentType)
  }

  @RequireAuth()
  @Post('confirm')
  async confirm(@CurrentUser('id') id: string, @Body() body: ConfirmAvatarDto) {
    return this.avatarService.confirm(id, body.key)
  }
}
