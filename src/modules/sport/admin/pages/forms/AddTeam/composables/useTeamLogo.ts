import { onBeforeUnmount, ref } from 'vue'
import { optimizeImageFile } from '@/utils/imageOptimization'
import { ALLOWED_LOGO_IMAGE_TYPES, IMAGE_OPTIMIZATION_OPTIONS, MAX_LOGO_IMAGE_SIZE_BYTES } from '../constants/addTeamConstants'

export function useTeamLogo(t: any) {
  const logoPreview = ref('')
  const logoObjectUrl = ref('')

  function cleanupLogoObjectUrl() {
    if (!logoObjectUrl.value) return
    URL.revokeObjectURL(logoObjectUrl.value)
    logoObjectUrl.value = ''
  }

  async function handleLogoChange(event: Event, form: any, isFormLocked: boolean): Promise<string> {
    if (isFormLocked) return ''

    const target = event.target as HTMLInputElement
    const [file] = target?.files || []
    if (!file) return ''

    if (!ALLOWED_LOGO_IMAGE_TYPES.includes(file.type)) {
      return t('sportAddTeam.validation.logoType')
    }

    if (file.size > MAX_LOGO_IMAGE_SIZE_BYTES) {
      return t('sportAddTeam.validation.logoSize')
    }

    const optimizedFile = await optimizeImageFile(file, IMAGE_OPTIMIZATION_OPTIONS).catch(() => file)

    cleanupLogoObjectUrl()
    logoObjectUrl.value = URL.createObjectURL(optimizedFile)
    logoPreview.value = logoObjectUrl.value
    form.logo = optimizedFile

    return ''
  }

  function removeLogo(form: any, isFormLocked: boolean) {
    if (isFormLocked) return
    cleanupLogoObjectUrl()
    logoPreview.value = ''
    form.logo = null
  }

  function setLogoPreview(preview: string) {
    logoPreview.value = preview
  }

  function cleanup() {
    cleanupLogoObjectUrl()
  }

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    logoPreview,
    logoObjectUrl,
    handleLogoChange,
    removeLogo,
    setLogoPreview,
    cleanup,
  }
}
