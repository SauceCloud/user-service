import { registerAs } from '@nestjs/config'

import { isProd } from '@/common/utils/env.util'

export type RefreshCookieConfig = {
  name: string
  path: string
  httpOnly: boolean
  sameSite: 'lax' | 'none' | 'strict'
  secure: boolean
}

export type CookiesConfig = {
  refresh: RefreshCookieConfig
}

export default registerAs('cookies', (): CookiesConfig => {
  return {
    refresh: {
      name: 'refreshToken',
      path: '/',
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    },
  }
})
