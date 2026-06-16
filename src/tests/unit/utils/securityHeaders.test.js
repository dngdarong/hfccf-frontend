import { describe, expect, it } from 'vitest'
import {
  createContentSecurityPolicy,
  getApiBaseOrigin,
  getImagePublicOrigin,
} from '@/utils/securityHeaders'

describe('securityHeaders', () => {
  it('resolves the api and image origins from env values', () => {
    expect(
      getApiBaseOrigin({
        VITE_API_BASE_URL: 'http://hfccf-backend.test/api',
      }),
    ).toBe('http://hfccf-backend.test')

    expect(
      getImagePublicOrigin({
        VITE_IMAGE_PUBLIC_ORIGIN: 'https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev',
      }),
    ).toBe('https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev')

    expect(
      getImagePublicOrigin({
        VITE_IMAGE_PUBLIC_URL: 'https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev/avatars/user.jpg',
      }),
    ).toBe('https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev')
  })

  it('includes only the explicit trusted image origin in img-src', () => {
    const csp = createContentSecurityPolicy({
      isDev: true,
      apiBaseOrigin: 'http://hfccf-backend.test',
      imagePublicOrigin: 'https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev',
    })

    expect(csp).toContain("img-src 'self' data: blob:")
    expect(csp).toContain('http://hfccf-backend.test')
    expect(csp).toContain('https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev')
    expect(csp).not.toContain('*.r2.dev')
    expect(csp).not.toContain('*')
  })
})
