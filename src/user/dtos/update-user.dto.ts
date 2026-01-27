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

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_]+$/)
  readonly username?: string

  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  @Validate(IsBirthDateValidConstraint)
  readonly birthDate?: Date

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  readonly description?: string | null
}
