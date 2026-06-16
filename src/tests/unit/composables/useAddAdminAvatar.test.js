import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { reactive } from 'vue'
import { withI18nSetup } from '../../helpers/mount'
import { useAddAdminAvatar } from '@/modules/super-admin/composables/useAddAdminAvatar'

const messages = { en: {} }

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeForm(nameOverride = 'Test User') {
  return reactive({
    name: nameOverride,
    profileImage: null,
    avatarAction: 'none',
  })
}

/**
 * Returns a change-event-like object with a fake file.
 * Using a plain object works because the composable only reads .type and .size.
 * URL.createObjectURL is mocked so it never receives this object for real.
 */
function makeChangeEvent({ type = 'image/jpeg', size = 1024 } = {}) {
  return { target: { files: [{ type, size, name: 'photo.jpg' }], value: '' } }
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('useAddAdminAvatar — changeProfileImage', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an error string for a disallowed MIME type', async () => {
    const form = makeForm()
    const { changeProfileImage } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)

    const error = await changeProfileImage(makeChangeEvent({ type: 'image/gif' }))

    expect(error).toBeTruthy()
    expect(typeof error).toBe('string')
    expect(form.profileImage).toBeNull()
    expect(form.avatarAction).toBe('none')
  })

  it('returns an error string when file exceeds the 2 MB limit', async () => {
    const form = makeForm()
    const { changeProfileImage } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)

    const error = await changeProfileImage(makeChangeEvent({ size: 3 * 1024 * 1024 }))

    expect(error).toBeTruthy()
    expect(form.profileImage).toBeNull()
  })

  it('returns null and updates form for a valid JPEG', async () => {
    const form = makeForm()
    const { changeProfileImage, profileImagePreview } = withI18nSetup(
      () => useAddAdminAvatar({ form }),
      messages,
    )

    const error = await changeProfileImage(makeChangeEvent({ type: 'image/jpeg', size: 500 * 1024 }))

    expect(error).toBeNull()
    expect(form.avatarAction).toBe('replace')
    expect(form.profileImage).toBeTruthy()
    expect(profileImagePreview.value).toBe('blob:mock-url')
  })

  it('returns null and updates form for a valid PNG', async () => {
    const form = makeForm()
    const { changeProfileImage } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)

    const error = await changeProfileImage(makeChangeEvent({ type: 'image/png', size: 1024 }))
    expect(error).toBeNull()
    expect(form.avatarAction).toBe('replace')
  })

  it('returns null and updates form for a valid WEBP', async () => {
    const form = makeForm()
    const { changeProfileImage } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)

    const error = await changeProfileImage(makeChangeEvent({ type: 'image/webp', size: 1024 }))
    expect(error).toBeNull()
    expect(form.avatarAction).toBe('replace')
  })

  it('returns null and does nothing when no file is selected', async () => {
    const form = makeForm()
    const { changeProfileImage } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)

    const error = await changeProfileImage({ target: { files: [], value: '' } })

    expect(error).toBeNull()
    expect(form.profileImage).toBeNull()
  })

  it('revokes the previous blob URL before replacing with a new file', async () => {
    const form = makeForm()
    const { changeProfileImage } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)

    URL.createObjectURL.mockReturnValueOnce('blob:first-url')
    await changeProfileImage(makeChangeEvent())

    URL.createObjectURL.mockReturnValueOnce('blob:second-url')
    await changeProfileImage(makeChangeEvent())

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:first-url')
  })
})

describe('useAddAdminAvatar — removeProfileImage', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('clears form fields and revokes blob URL', async () => {
    const form = makeForm()
    const { changeProfileImage, removeProfileImage, profileImagePreview } = withI18nSetup(
      () => useAddAdminAvatar({ form }),
      messages,
    )

    await changeProfileImage(makeChangeEvent())
    expect(profileImagePreview.value).toBe('blob:mock-url')

    removeProfileImage()

    expect(form.profileImage).toBeNull()
    expect(form.avatarAction).toBe('remove')
    expect(profileImagePreview.value).toBe('')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})

describe('useAddAdminAvatar — profileImageFallbackLabel', () => {
  it('generates two-letter initials from form.name', () => {
    const form = makeForm('John Doe')
    const { profileImageFallbackLabel } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)
    expect(profileImageFallbackLabel.value).toBe('JD')
  })

  it('uses first letter only for a single-word name', () => {
    const form = makeForm('Alice')
    const { profileImageFallbackLabel } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)
    expect(profileImageFallbackLabel.value).toBe('A')
  })

  it('defaults to "AU" when name is empty', () => {
    const form = makeForm('')
    const { profileImageFallbackLabel } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)
    expect(profileImageFallbackLabel.value).toBe('AU')
  })
})

describe('useAddAdminAvatar — initFromUser', () => {
  it('sets avatarAction to "keep" when user has an avatar', () => {
    const form = makeForm()
    // resolveAvatarSource with a relative path returns the path itself
    const { initFromUser } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)

    initFromUser('/storage/avatars/test.jpg')

    expect(form.avatarAction).toBe('keep')
  })

  it('sets avatarAction to "none" when user has no avatar', () => {
    const form = makeForm()
    const { initFromUser } = withI18nSetup(() => useAddAdminAvatar({ form }), messages)

    initFromUser(null)

    expect(form.avatarAction).toBe('none')
  })
})
