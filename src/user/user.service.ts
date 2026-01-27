import { BadRequestException, Injectable } from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'
import { TokenService } from '@/token/token.service'

import { UserPrivateDto } from '../common/dtos/user-private.dto'
import { UserPublicDto } from '../common/dtos/user-public.dto'

import { UpdateUserDto } from './dtos/update-user.dto'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService
  ) {}

  async getMe(id: string): Promise<UserPrivateDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    if (!user) throw new BadRequestException('User not found')

    return new UserPrivateDto(user)
  }

  async getByUsername(username: string): Promise<UserPublicDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    })

    if (!user) throw new BadRequestException('User not found')

    return new UserPublicDto(user)
  }

  async deactivateUser(id: string) {
    await this.prisma.$transaction(async tx => {
      const user = await tx.user.update({
        where: { id },
        data: { isActive: false },
      })

      await this.tokenService.removeAllUserSessions(user.id)
    })
  }

  async updateProfile(
    id: string,
    data: UpdateUserDto
  ): Promise<UserPrivateDto> {
    const { username, birthDate } = data

    const updated = await this.prisma.$transaction(async tx => {
      const user = await tx.user.findUnique({
        where: { id },
        select: { id: true, username: true },
      })

      if (!user) throw new BadRequestException('User not found')

      if (username && username != user.username) {
        const { available } = await this.isUsernameAvailable(username)
        if (!available) throw new BadRequestException('Username already taken')
      }

      return await tx.user.update({
        where: { id },
        data: {
          ...data,
          birthDate: birthDate ? new Date(birthDate) : undefined,
        },
      })
    })

    return new UserPrivateDto(updated)
  }

  async isUsernameAvailable(username: string): Promise<{ available: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    return { available: !user }
  }
}
