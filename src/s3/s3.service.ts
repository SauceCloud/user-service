import {
  DeleteObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class S3Service {
  private readonly bucket: string

  constructor(
    private readonly s3: S3Client,
    private readonly configService: ConfigService
  ) {
    this.bucket = this.configService.getOrThrow<string>('S3_BUCKET_NAME')
  }

  publicUrl(key: string) {
    const bucketUuid = this.configService.getOrThrow<string>('S3_BUCKET_UUID')
    return `https://${bucketUuid}.selstorage.ru/${key}`
  }

  async presignPut(options: {
    key: string
    contentType: string
    cacheControl?: string
    expiresInSeconds: number
    metadata?: Record<string, string>
  }) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
      ContentType: options.contentType,
      CacheControl: options.cacheControl,
      Metadata: options.metadata,
    })

    return getSignedUrl(this.s3, cmd, { expiresIn: options.expiresInSeconds })
  }

  async headObject(key: string): Promise<HeadObjectCommandOutput> {
    return this.s3.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    )
  }

  isNotFound(error: any): boolean {
    return (
      error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404
    )
  }
}
