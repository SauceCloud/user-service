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

import { IsBirthDateValidConstraint } from '../decorators/is-birth-date-valid.decorator'

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_]+$/)
  readonly username: string

  @IsNotEmpty()
  @IsDateString()
  @Validate(IsBirthDateValidConstraint)
  readonly birthDate: string

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  readonly password: string
}
