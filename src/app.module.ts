import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from './auth/auth.module'
import authConfig from './config/auth.config'
import cookiesConfig from './config/cookies.config'
import { PrismaModule } from './prisma/prisma.module'
import { S3Module } from './s3/s3.module'
import { TokenModule } from './token/token.module'
import { AvatarModule } from './user/media/avatar/avatar.module'
import { UserModule } from './user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, cookiesConfig],
    }),
    PrismaModule,
    TokenModule,
    UserModule,
    AvatarModule,
    AuthModule,
    S3Module,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
