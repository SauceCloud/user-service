import { IsString, MinLength } from 'class-validator'

import { ValidationCode } from '@/common/constants/validation-codes.enum'
import { vmsg } from '@/common/utils/validation.utils'

export class ConfirmAvatarDto {
  @IsString({ message: vmsg(ValidationCode.AVATAR_KEY_REQUIRED) })
  @MinLength(1, { message: vmsg(ValidationCode.AVATAR_KEY_REQUIRED) })
  key: string
}
