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

describe('avatar utils', () => {
  it('keeps relative avatar paths safe', async () => {
    const { isSafeAvatarSource, resolveAvatarSource } = await import('@/utils/avatar')

    const src = '/storage/avatars/user.jpg'

    expect(isSafeAvatarSource(src)).toBe(true)
    expect(resolveAvatarSource(src)).toBe(src)
  })

  it('allows the configured Cloudflare R2 public avatar origin', async () => {
    const { isSafeAvatarSource, resolveAvatarSource } = await import('@/utils/avatar')

    const src = `${imageOrigin}/avatars/user.jpg`

    expect(isSafeAvatarSource(src)).toBe(true)
    expect(resolveAvatarSource(src)).toBe(src)
  })

  it('rejects unrelated external avatar URLs', async () => {
    const { isSafeAvatarSource, resolveAvatarSource } = await import('@/utils/avatar')

    const src = 'https://example.com/avatar.jpg'

    expect(isSafeAvatarSource(src)).toBe(false)
    expect(resolveAvatarSource(src)).toBe('')
  })

  it('builds initials from a display name', async () => {
    const { getAvatarInitials } = await import('@/utils/avatar')

    expect(getAvatarInitials('Jane Doe')).toBe('JD')
    expect(getAvatarInitials('Jane')).toBe('J')
  })
})
