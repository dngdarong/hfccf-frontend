import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'

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

describe('UserAvatar', () => {
  it('renders a Cloudflare R2 avatar image source from the configured public origin', async () => {
    const { default: UserAvatar } = await import('@/components/navigation/Avatar.vue')
    const avatarUrl = `${imageOrigin}/avatars/user.jpg`

    const wrapper = mountWithPlugins(UserAvatar, {
      props: {
        name: 'Jane Doe',
        username: 'jane.doe',
        avatar: avatarUrl,
        showMeta: false,
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(avatarUrl)

    await img.trigger('load')

    expect(wrapper.find('.navbar-profile__avatar-image').classes()).toContain(
      'navbar-profile__avatar-image--visible',
    )
  })
})
