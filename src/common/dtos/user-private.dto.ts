import { Expose } from 'class-transformer'

export class UserPrivateDto {
  @Expose()
  readonly username: string

  @Expose()
  readonly birthDate: Date

  @Expose()
  readonly description: string | null

  @Expose()
  readonly email: string

  constructor(partial: Partial<UserPrivateDto>) {
    Object.assign(this, partial)
  }
}
