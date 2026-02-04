import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator'

import { ValidationCode } from '@/common/constants/validation-codes.enum'
import { vmsg } from '@/common/utils/validation.utils'

import { IsBirthDateValidConstraint } from '../decorators/is-birth-date-valid.decorator'

export class RegisterDto {
  @IsNotEmpty({ message: vmsg(ValidationCode.USERNAME_REQUIRED) })
  @IsString({ message: vmsg(ValidationCode.USERNAME_REQUIRED) })
  @MinLength(5, { message: vmsg(ValidationCode.USERNAME_MIN) })
  @MaxLength(32, { message: vmsg(ValidationCode.USERNAME_MAX) })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: vmsg(ValidationCode.USERNAME_PATTERN),
  })
  readonly username: string

  @IsNotEmpty({ message: vmsg(ValidationCode.BIRTHDATE_REQUIRED) })
  @IsDateString({}, { message: vmsg(ValidationCode.BIRTHDATE_ISO) })
  @Validate(IsBirthDateValidConstraint, {
    message: vmsg(ValidationCode.BIRTHDATE_INVALID),
  })
  readonly birthDate: string

  @IsNotEmpty({ message: vmsg(ValidationCode.EMAIL_REQUIRED) })
  @IsEmail({}, { message: vmsg(ValidationCode.EMAIL_INVALID) })
  readonly email: string

  @IsNotEmpty({ message: vmsg(ValidationCode.PASSWORD_REQUIRED) })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: vmsg(ValidationCode.PASSWORD_WEAK) }
  )
  readonly password: string
}
