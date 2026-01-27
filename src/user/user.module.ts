import { Module } from '@nestjs/common'

import { TokenModule } from '@/token/token.module'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [TokenModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
