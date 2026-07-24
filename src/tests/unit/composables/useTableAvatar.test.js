import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useTableAvatar } from '@/components/data-display/composables/useTableAvatar'

/**
 * Mount the composable inside a minimal component so Vue's reactivity
 * system (watch) is fully active.
 */
function setup(initialRows = []) {
  const rowsRef = ref(initialRows)
  let api

  mount({
    setup() {
      api = useTableAvatar(rowsRef)
      return {}
    },
    template: '<div />',
  })

  return { ...api, rowsRef }
}

describe('useTableAvatar', () => {
  // ─── avatarSrc ────────────────────────────────────────────────────────────────

  it('returns empty string when row has no avatar fields', () => {
    const { avatarSrc } = setup()
    expect(avatarSrc({ id: '1' })).toBe('')
  })

  it('returns the src when avatar is a relative path (safe)', () => {
    const { avatarSrc } = setup()
    expect(avatarSrc({ id: '1', avatar: '/uploads/avatar.jpg' })).toBe('/uploads/avatar.jpg')
  })

  it('returns empty string after onAvatarError marks the row', () => {
    const { avatarSrc, onAvatarError } = setup()
    const row = { id: '1', avatar: '/uploads/avatar.jpg' }
    onAvatarError(row)
    expect(avatarSrc(row)).toBe('')
  })

  it('uses avatarUrl field as fallback', () => {
    const { avatarSrc } = setup()
    expect(avatarSrc({ id: '1', avatarUrl: '/uploads/pic.png' })).toBe('/uploads/pic.png')
  })

  it('uses photo field as last fallback', () => {
    const { avatarSrc } = setup()
    expect(avatarSrc({ id: '1', photo: '/uploads/photo.jpg' })).toBe('/uploads/photo.jpg')
  })

  it('uses nested media url when the row only exposes media payloads', () => {
    const { avatarSrc } = setup()
    expect(avatarSrc({ id: '1', media: { url: '/uploads/media.jpg' } })).toBe('/uploads/media.jpg')
  })

  // ─── shouldShowImage ──────────────────────────────────────────────────────────

  it('returns false when there is no avatar src', () => {
    const { shouldShowImage } = setup()
    expect(shouldShowImage({ id: '1' })).toBe(false)
  })

  it('returns false before the image has loaded (even if src exists)', () => {
    const { shouldShowImage } = setup()
    expect(shouldShowImage({ id: '1', avatar: '/uploads/avatar.jpg' })).toBe(false)
  })

  it('returns true after onAvatarLoad signals success', () => {
    const { shouldShowImage, onAvatarLoad } = setup()
    const row = { id: '1', avatar: '/uploads/avatar.jpg' }
    onAvatarLoad(row)
    expect(shouldShowImage(row)).toBe(true)
  })

  it('returns false after onAvatarError even when src could resolve', () => {
    const { shouldShowImage, onAvatarError } = setup()
    const row = { id: '1', avatar: '/uploads/avatar.jpg' }
    onAvatarError(row)
    expect(shouldShowImage(row)).toBe(false)
  })

  // ─── onAvatarLoad / onAvatarError ─────────────────────────────────────────────

  it('does nothing when row has no usable key', () => {
    const { onAvatarError, onAvatarLoad, shouldShowImage } = setup()
    expect(() => onAvatarError({})).not.toThrow()
    expect(() => onAvatarLoad({})).not.toThrow()
    expect(() => onAvatarError(null)).not.toThrow()
    // No state leaked: still returns false for the same empty row
    expect(shouldShowImage({})).toBe(false)
  })

  it('uses email as key when id is absent', () => {
    const { shouldShowImage, onAvatarLoad } = setup()
    const row = { email: 'alice@test.com', avatar: '/uploads/alice.jpg' }
    onAvatarLoad(row)
    expect(shouldShowImage(row)).toBe(true)
  })

  it('a load on one row does not affect another row', () => {
    const { shouldShowImage, onAvatarLoad } = setup()
    const a = { id: '1', avatar: '/uploads/a.jpg' }
    const b = { id: '2', avatar: '/uploads/b.jpg' }
    onAvatarLoad(a)
    expect(shouldShowImage(a)).toBe(true)
    expect(shouldShowImage(b)).toBe(false)
  })

  // ─── watch: reset on rows change ─────────────────────────────────────────────

  it('clears avatar state when rows reference changes', async () => {
    const { onAvatarLoad, shouldShowImage, rowsRef } = setup([{ id: '1' }])
    const row = { id: '1', avatar: '/uploads/avatar.jpg' }
    onAvatarLoad(row)
    expect(shouldShowImage(row)).toBe(true)

    rowsRef.value = [{ id: '2' }]
    await nextTick()

    expect(shouldShowImage(row)).toBe(false)
  })

  it('clears state when a row inside the array is mutated', async () => {
    const initialRow = { id: '1', avatar: '/uploads/avatar.jpg' }
    const { onAvatarLoad, shouldShowImage, rowsRef } = setup([initialRow])
    onAvatarLoad(initialRow)
    expect(shouldShowImage(initialRow)).toBe(true)

    rowsRef.value[0] = { id: '1', avatar: '/uploads/new.jpg' }
    await nextTick()

    expect(shouldShowImage(initialRow)).toBe(false)
  })

  // ─── userInitials ─────────────────────────────────────────────────────────────

  it('returns initials from a full name', () => {
    const { userInitials } = setup()
    expect(userInitials({ name: 'Alice Nguyen' })).toBe('AN')
  })

  it('returns single initial for a one-word name', () => {
    const { userInitials } = setup()
    expect(userInitials({ name: 'Alice' })).toBe('A')
  })

  it('caps at two initials for names with more than two words', () => {
    const { userInitials } = setup()
    expect(userInitials({ name: 'Alice Bob Charlie' })).toBe('AB')
  })

  it('returns fallback "?" when name is empty', () => {
    const { userInitials } = setup()
    expect(userInitials({ name: '' })).toBe('?')
    expect(userInitials({})).toBe('?')
    expect(userInitials(null)).toBe('?')
  })
})
