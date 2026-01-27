import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class RefreshPayloadDto {
  @IsUUID()
  sub: string

  @IsString()
  @IsNotEmpty()
  deviceId: string
}
