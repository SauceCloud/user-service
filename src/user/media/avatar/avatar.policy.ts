export const AVATAR_POLICY = {
  allowedContentTypes: ['image/png', 'image/jpeg', 'image/webp'] as const,
  maxBytes: 5 * 1024 * 1024,
  minBytes: 1024,
  keyPrefix: (userId: string) => `avatars/${userId}/`,
  cacheControl: 'public, max-age=31536000, immutable',
  expiresInSeconds: 120,
} as const

export const EXT_BY_CONTENT_TYPE: Record<
  AvatarContentType,
  'png' | 'jpg' | 'webp'
> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export type AvatarContentType =
  (typeof AVATAR_POLICY.allowedContentTypes)[number]

export function isAvatarContentType(v: string): v is AvatarContentType {
  return (AVATAR_POLICY.allowedContentTypes as readonly string[]).includes(v)
}
