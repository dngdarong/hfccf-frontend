import { ref, watch } from 'vue'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'

/**
 * Manages per-row avatar image loading state for a data table.
 *
 * rowsRef — a computed or ref that holds the current row array.
 * When rows change, stale avatar error/load state is cleared automatically.
 */
export function useTableAvatar(rowsRef) {
  const avatarStates = ref({})

  function avatarKey(row) {
    return String(row?.id || row?.email || row?.username || row?.name || '')
  }

  function avatarSrc(row) {
    const key = avatarKey(row)
    if (key && avatarStates.value[key]?.error) return ''

    return resolveAvatarSource(
      row?.avatarUrl ||
      row?.avatar ||
      row?.avatar_url ||
      row?.profile_photo_url ||
      row?.profilePhotoUrl ||
      row?.profile_image_url ||
      row?.profileImageUrl ||
      row?.photo_url ||
      row?.photoUrl ||
      row?.image_url ||
      row?.imageUrl ||
      row?.profileImage ||
      row?.profile_image ||
      row?.photo ||
      row?.image ||
      row?.thumbnail ||
      row?.media?.url ||
      row?.media?.path,
    )
  }

  function shouldShowImage(row) {
    const key = avatarKey(row)
    const state = key ? (avatarStates.value[key] ?? {}) : {}
    return Boolean(avatarSrc(row)) && Boolean(state.loaded) && !state.error
  }

  function userInitials(row) {
    return getAvatarInitials(row?.name, '?')
  }

  function onAvatarError(row) {
    const key = avatarKey(row)
    if (!key) return
    avatarStates.value = {
      ...avatarStates.value,
      [key]: { loaded: false, error: true },
    }
  }

  function onAvatarLoad(row) {
    const key = avatarKey(row)
    if (!key) return
    avatarStates.value = {
      ...avatarStates.value,
      [key]: { loaded: true, error: false },
    }
  }

  watch(rowsRef, () => {
    avatarStates.value = {}
  }, { deep: true })

  return {
    avatarSrc,
    shouldShowImage,
    userInitials,
    onAvatarError,
    onAvatarLoad,
  }
}
