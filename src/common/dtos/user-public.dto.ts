import { Expose } from 'class-transformer'

export class UserPublicDto {
  @Expose()
  readonly username: string

  @Expose()
  readonly description: string | null

  constructor(partial: Partial<UserPublicDto>) {
    Object.assign(this, partial)
  }
}
