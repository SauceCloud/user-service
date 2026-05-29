import { S3Client } from '@aws-sdk/client-s3'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { S3Service } from './s3.service'

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3Client,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new S3Client({
          region: config.getOrThrow<string>('S3_REGION'),
          endpoint: config.getOrThrow<string>('S3_ENDPOINT'),
          credentials: {
            accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY_ID'),
            secretAccessKey: config.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
          },
        })
      },
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
