import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

import { ValidationCode } from '@/common/constants/validation-codes.enum'
import { vmsg } from '@/common/utils/validation.utils'

export class LoginDto {
  @IsNotEmpty({ message: vmsg(ValidationCode.EMAIL_REQUIRED) })
  @IsEmail({}, { message: vmsg(ValidationCode.EMAIL_INVALID) })
  readonly email: string

  @IsNotEmpty({ message: vmsg(ValidationCode.PASSWORD_REQUIRED) })
  @IsString({ message: vmsg(ValidationCode.PASSWORD_REQUIRED) })
  readonly password: string
}
