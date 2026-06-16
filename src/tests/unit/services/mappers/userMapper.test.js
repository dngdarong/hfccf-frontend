import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const imageOrigin = 'https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev'

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('VITE_API_BASE_URL', 'http://hfccf-backend.test/api')
  vi.stubEnv('VITE_IMAGE_PUBLIC_ORIGIN', imageOrigin)
  vi.stubEnv('VITE_IMAGE_PUBLIC_URL', '')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('mapUser avatar normalization', () => {
  it('maps alternate avatar fields to a displayable avatar url', async () => {
    const { mapUser } = await import('@/services/mappers/userMapper')
    const avatarUrl = `${imageOrigin}/avatars/user.jpg`

    const user = mapUser({
      id: 'usr-1',
      first_name: 'Jane',
      last_name: 'Doe',
      avatar_url: avatarUrl,
      profile_photo_url: avatarUrl,
    })

    expect(user.avatar).toBe(avatarUrl)
    expect(user.avatarUrl).toBe(avatarUrl)
    expect(user.profilePhotoUrl).toBe(avatarUrl)
  })
})
