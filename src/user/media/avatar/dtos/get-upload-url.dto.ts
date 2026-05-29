import { IsIn, IsNumber, Max, Min } from 'class-validator'

import { ValidationCode } from '@/common/constants/validation-codes.enum'
import { vmsg } from '@/common/utils/validation.utils'

import { AVATAR_POLICY, type AvatarContentType } from '../avatar.policy'

export class GetUploadUrlDto {
  @IsIn(AVATAR_POLICY.allowedContentTypes, {
    message: vmsg(ValidationCode.UNSUPPORTED_CONTENT_TYPE),
  })
  contentType: AvatarContentType

  @IsNumber({}, { message: vmsg(ValidationCode.CONTENT_LENGTH_INVALID) })
  @Min(AVATAR_POLICY.minBytes, {
    message: vmsg(ValidationCode.CONTENT_LENGTH_MIN),
  })
  @Max(AVATAR_POLICY.maxBytes, {
    message: vmsg(ValidationCode.CONTENT_LENGTH_MAX),
  })
  contentLength: number
}
