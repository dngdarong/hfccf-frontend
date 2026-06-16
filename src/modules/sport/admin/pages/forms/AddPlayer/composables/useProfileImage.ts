import { onBeforeUnmount, ref } from 'vue'
import { optimizeImageFile } from '@/utils/imageOptimization'
import { ALLOWED_PROFILE_IMAGE_TYPES, IMAGE_OPTIMIZATION_OPTIONS, MAX_PROFILE_IMAGE_SIZE_BYTES } from '../constants/addPlayerConstants'

export function useProfileImage(t: any) {
  const profileImagePreview = ref('')
  const profileImageObjectUrl = ref('')

  function cleanupProfileImageObjectUrl() {
    if (!profileImageObjectUrl.value) return
    URL.revokeObjectURL(profileImageObjectUrl.value)
    profileImageObjectUrl.value = ''
  }

  async function handleProfileImageChange(event: Event, form: any, isFormLocked: boolean): Promise<string> {
    if (isFormLocked) return ''

    const target = event.target as HTMLInputElement
    const [file] = target?.files || []
    if (!file) return ''

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      return t('sportAddPlayer.validation.imageType')
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      return t('sportAddPlayer.validation.imageSize')
    }

    const optimizedFile = await optimizeImageFile(file, IMAGE_OPTIMIZATION_OPTIONS).catch(() => file)

    cleanupProfileImageObjectUrl()
    profileImageObjectUrl.value = URL.createObjectURL(optimizedFile)
    profileImagePreview.value = profileImageObjectUrl.value
    form.profileImage = optimizedFile

    return ''
  }

  function removeProfileImage(form: any, isFormLocked: boolean) {
    if (isFormLocked) return
    cleanupProfileImageObjectUrl()
    profileImagePreview.value = ''
    form.profileImage = null
  }

  function setImagePreview(preview: string) {
    profileImagePreview.value = preview
  }

  onBeforeUnmount(() => {
    cleanupProfileImageObjectUrl()
  })

  return {
    profileImagePreview,
    profileImageObjectUrl,
    handleProfileImageChange,
    removeProfileImage,
    setImagePreview,
  }
}
