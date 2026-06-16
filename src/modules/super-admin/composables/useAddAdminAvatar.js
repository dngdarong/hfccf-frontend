import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveAvatarSource } from '@/utils/avatar'
import { optimizeImageFile } from '@/utils/imageOptimization'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 2 * 1024 * 1024

function isBlobUrl(value) {
  return String(value || '').startsWith('blob:')
}

/**
 * Manages profile image preview, blob URL lifecycle, and file validation.
 * Mutations to form.profileImage and form.avatarAction are performed here.
 *
 * @param {{ form: object }} options - reactive form object with profileImage and avatarAction fields
 * @returns {{ profileImagePreview, profileImageFallbackLabel, initFromUser, changeProfileImage, removeProfileImage }}
 */
export function useAddAdminAvatar({ form }) {
  const { t } = useI18n()

  function resolved(key, fallback) {
    const translated = t(key)
    return translated !== key ? translated : fallback
  }

  const profileImagePreview = ref('')

  const profileImageFallbackLabel = computed(() => {
    const tokens = String(form.name || '').trim().split(/\s+/).filter(Boolean)
    return (
      tokens
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'AU'
    )
  })

  function initFromUser(userAvatar) {
    profileImagePreview.value = resolveAvatarSource(userAvatar)
    form.avatarAction = userAvatar ? 'keep' : 'none'
  }

  /**
   * Validates and applies a new file selection.
   * Returns an error string on failure, null on success.
   */
  async function changeProfileImage(event) {
    const [file] = event?.target?.files || []
    if (event?.target) event.target.value = ''
    if (!file) return null

    if (!ALLOWED_TYPES.includes(file.type)) {
      return resolved('users.addAdmin.validation.imageType', 'Please choose a JPG, PNG, or WEBP image.')
    }

    if (file.size > MAX_SIZE_BYTES) {
      return resolved('users.addAdmin.validation.imageSize', 'Profile images must be 2 MB or smaller.')
    }

    const optimizedFile = await optimizeImageFile(file, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.84,
    }).catch(() => file)

    if (isBlobUrl(profileImagePreview.value)) {
      URL.revokeObjectURL(profileImagePreview.value)
    }
    form.profileImage = optimizedFile
    form.avatarAction = 'replace'
    profileImagePreview.value = URL.createObjectURL(optimizedFile)
    return null
  }

  function removeProfileImage() {
    if (isBlobUrl(profileImagePreview.value)) {
      URL.revokeObjectURL(profileImagePreview.value)
    }
    profileImagePreview.value = ''
    form.profileImage = null
    form.avatarAction = 'remove'
  }

  onBeforeUnmount(() => {
    if (isBlobUrl(profileImagePreview.value)) {
      URL.revokeObjectURL(profileImagePreview.value)
    }
  })

  return {
    profileImagePreview,
    profileImageFallbackLabel,
    initFromUser,
    changeProfileImage,
    removeProfileImage,
  }
}
