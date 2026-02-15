import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator'

import { IsBirthDateValidConstraint } from '@/auth/decorators/is-birth-date-valid.decorator'
import { ValidationCode } from '@/common/constants/validation-codes.enum'
import { vmsg } from '@/common/utils/validation.utils'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: vmsg(ValidationCode.USERNAME_MIN) })
  @MaxLength(32, { message: vmsg(ValidationCode.USERNAME_MAX) })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: vmsg(ValidationCode.USERNAME_PATTERN),
  })
  readonly username?: string

  @IsOptional()
  @IsDateString({}, { message: vmsg(ValidationCode.BIRTHDATE_ISO) })
  @Validate(IsBirthDateValidConstraint, {
    message: vmsg(ValidationCode.BIRTHDATE_INVALID),
  })
  readonly birthDate?: string

  @IsOptional()
  @IsString()
  @MaxLength(160, { message: vmsg(ValidationCode.DESCRIPTION_MIN) })
  readonly description?: string | null
}
