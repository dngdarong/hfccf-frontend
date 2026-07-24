import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLanguage } from '@/composables/useLanguage'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'
import { buildLocationAddress } from '@/modules/preschool/services/cambodiaLocationService'
import { fetchPreschoolStudent } from '@/modules/preschool/services/preschoolApi'
import { fetchPreschoolStudentPaymentSummary } from '@/modules/preschool/services/api/preschoolPaymentApi'
import { fetchStudentHealthSummary } from '@/modules/preschool/services/api/preschoolHealthApi'
import { fetchStudentGuardianCommunications } from '@/modules/preschool/services/api/preschoolGuardianCommunicationApi'
import { buildInfoCards, getStatusClass, getStatusLabel, getStudentDisplayName } from '../../utils/studentProfileHelpers'

function resetProfileState(state) {
  state.student.value = null
  state.healthSummary.value = null
  state.paymentSummary.value = null
  state.communicationTimeline.value = null
}

export function useStudentProfileData() {
  const route = useRoute()
  const { t } = useLanguage()
  const { locale } = useI18n()

  const loading = ref(false)
  const errorMessage = ref('')
  const student = ref(null)
  const healthSummary = ref(null)
  const paymentSummary = ref(null)
  const communicationTimeline = ref(null)
  const requestSequence = ref(0)

  const profileClasses = computed(() => student.value?.classes || [])
  const avatarSrc = computed(() => resolveAvatarSource(student.value?.avatarUrl || ''))
  const initials = computed(() => getAvatarInitials(getStudentDisplayName(student.value), '?'))
  const statusLabel = computed(() => getStatusLabel(t, student.value))
  const statusClass = computed(() => getStatusClass(student.value?.status))
  const infoCards = computed(() => buildInfoCards(t, student.value, profileClasses.value))
  const birthLocationDisplay = computed(() => {
    const resolvedLocale = String(locale.value || 'en').toLowerCase().startsWith('kh') ? 'kh' : 'en'
    return student.value?.birthLocationDisplay
      || student.value?.placeOfBirth
      || student.value?.place_of_birth
      || buildLocationAddress({
        province: student.value?.birthProvince,
        district: student.value?.birthDistrict,
        commune: student.value?.birthCommune,
        village: student.value?.birthVillage,
      }, resolvedLocale)
  })
  const currentResidenceDisplay = computed(() => {
    const resolvedLocale = String(locale.value || 'en').toLowerCase().startsWith('kh') ? 'kh' : 'en'
    return student.value?.currentResidenceDisplay
      || student.value?.address
      || buildLocationAddress({
        province: student.value?.residenceProvince,
        district: student.value?.residenceDistrict,
        commune: student.value?.residenceCommune,
        village: student.value?.residenceVillage,
      }, resolvedLocale)
  })
  const addressDisplay = currentResidenceDisplay

  async function loadStudent() {
    const studentId = String(route.params.id || '').trim()
    const currentSequence = requestSequence.value + 1
    requestSequence.value = currentSequence

    if (!studentId) {
      loading.value = false
      errorMessage.value = t('preschoolStudentProfilePage.messages.notFound')
      resetProfileState({ student, healthSummary, paymentSummary, communicationTimeline })
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const [response, healthResponse, paymentResponse, communications] = await Promise.all([
        fetchPreschoolStudent(studentId),
        fetchStudentHealthSummary(studentId).catch(() => null),
        fetchPreschoolStudentPaymentSummary(studentId).catch(() => null),
        fetchStudentGuardianCommunications(studentId, { perPage: 5 }).catch(() => null),
      ])

      if (requestSequence.value !== currentSequence) return

      if (!response) {
        resetProfileState({ student, healthSummary, paymentSummary, communicationTimeline })
        errorMessage.value = t('preschoolStudentProfilePage.messages.notFound')
        return
      }

      student.value = response
      healthSummary.value = healthResponse
      paymentSummary.value = paymentResponse
      communicationTimeline.value = communications
    } catch (error) {
      if (requestSequence.value !== currentSequence) return

      resetProfileState({ student, healthSummary, paymentSummary, communicationTimeline })
      errorMessage.value = error?.message || t('preschoolStudentProfilePage.messages.loadFailed')
    } finally {
      if (requestSequence.value === currentSequence) {
        loading.value = false
      }
    }
  }

  watch(
    () => route.params.id,
    () => {
      void loadStudent()
    },
    { immediate: true },
  )

  return {
    loading,
    errorMessage,
    student,
    healthSummary,
    paymentSummary,
    communicationTimeline,
    profileClasses,
    avatarSrc,
    initials,
    statusLabel,
    statusClass,
    infoCards,
    birthLocationDisplay,
    currentResidenceDisplay,
    addressDisplay,
    loadStudent,
  }
}
