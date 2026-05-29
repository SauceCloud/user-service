import { Module } from '@nestjs/common'

import { S3Module } from '@/s3/s3.module'
import { TokenModule } from '@/token/token.module'

import { AvatarController } from './avatar.controller'
import { AvatarService } from './avatar.service'

@Module({
  imports: [S3Module, TokenModule],
  controllers: [AvatarController],
  providers: [AvatarService],
})
export class AvatarModule {}
