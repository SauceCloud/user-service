import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'

import { ValidationCode } from '@/common/constants/validation-codes.enum'
import { AppException } from '@/common/exceptions/api.exceptions'
import { PrismaService } from '@/prisma/prisma.service'
import { S3Service } from '@/s3/s3.service'

import {
  AVATAR_POLICY,
  AvatarContentType,
  EXT_BY_CONTENT_TYPE,
  isAvatarContentType,
} from './avatar.policy'

@Injectable()
export class AvatarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service
  ) {}

  async getUploadUrl(userId: string, contentType: AvatarContentType) {
    const ext = EXT_BY_CONTENT_TYPE[contentType]
    const key = `${AVATAR_POLICY.keyPrefix(userId)}${randomUUID()}.${ext}`

    const uploadUrl = await this.s3Service.presignPut({
      key,
      contentType,
      cacheControl: AVATAR_POLICY.cacheControl,
      expiresInSeconds: AVATAR_POLICY.expiresInSeconds,
      metadata: { uid: userId },
    })

    return {
      key,
      uploadUrl,
      headers: {
        'Content-Type': contentType,
        'x-amz-meta-uid': userId,
      },
    }
  }

  async confirm(userId: string, key: string) {
    if (!key.startsWith(AVATAR_POLICY.keyPrefix(userId)))
      throw AppException.validationFailed({
        fields: { key: [{ code: ValidationCode.AVATAR_KEY_INVALID }] },
      })

    try {
      const head = await this.s3Service.headObject(key)

      const size = head.ContentLength ?? 0
      const contentType = head.ContentType ?? ''
      const metaUid = head.Metadata?.uid

      if (!metaUid || metaUid !== userId) {
        await this.s3Service.deleteObject(key)
        throw AppException.validationFailed({
          fields: { key: [{ code: ValidationCode.AVATAR_KEY_INVALID }] },
        })
      }

      if (size < AVATAR_POLICY.minBytes)
        throw AppException.validationFailed({
          fields: {
            contentLength: [{ code: ValidationCode.CONTENT_LENGTH_MIN }],
          },
        })

      if (size > AVATAR_POLICY.maxBytes)
        throw AppException.validationFailed({
          fields: {
            contentLength: [{ code: ValidationCode.CONTENT_LENGTH_MAX }],
          },
        })

      if (!isAvatarContentType(contentType))
        throw AppException.validationFailed({
          fields: {
            contentType: [{ code: ValidationCode.UNSUPPORTED_CONTENT_TYPE }],
          },
        })
    } catch (err) {
      if (this.s3Service.isNotFound(err)) {
        throw AppException.validationFailed({
          fields: { key: [{ code: ValidationCode.AVATAR_KEY_INVALID }] },
        })
      }
      throw err
    }

    const avatarUrl = this.s3Service.publicUrl(key)

    await this.prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { avatarKey: true },
      })

      if (user?.avatarKey) await this.s3Service.deleteObject(user.avatarKey)

      await tx.user.update({
        where: { id: userId },
        data: { avatarKey: key, avatarUrl },
      })
    })

    return { avatarUrl }
  }
}
