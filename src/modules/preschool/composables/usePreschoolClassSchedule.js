// Keep the class timetable state in one composable so the view page only
// handles selection and rendering.
import { ref } from 'vue'
import { fetchClassSchedule } from '@/modules/preschool/services/api/preschoolScheduleApi'
import { fetchPreschoolClasses } from '@/modules/preschool/services/preschoolApi'

function normalizeText(value) {
  return String(value ?? '').trim()
}

export function usePreschoolClassSchedule() {
  const loading = ref(false)
  const errorMessage = ref('')
  const classOptions = ref([])
  const selectedClassId = ref('')
  const classSummary = ref(null)
  const schedules = ref([])

  async function loadClassOptions() {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await fetchPreschoolClasses({ page: 1, perPage: 100 })
      classOptions.value = (response.items || []).map((item) => ({
        label: `${normalizeText(item.code)} - ${normalizeText(item.name)}`,
        value: item.id,
        raw: item,
      }))

      if (!selectedClassId.value) {
        selectedClassId.value = String(classOptions.value[0]?.value || '').trim()
      }
    } catch (error) {
      classOptions.value = []
      errorMessage.value = error?.message || 'Failed to load Preschool classes.'
    } finally {
      loading.value = false
    }
  }

  async function loadClassSchedule(classId = selectedClassId.value) {
    const resolvedClassId = String(classId || '').trim()
    if (!resolvedClassId) return null

    loading.value = true
    errorMessage.value = ''

    try {
      const bundle = await fetchClassSchedule(resolvedClassId)
      classSummary.value = bundle.class || null
      schedules.value = bundle.items || []
      selectedClassId.value = resolvedClassId
      return bundle
    } catch (error) {
      classSummary.value = null
      schedules.value = []
      errorMessage.value = error?.message || 'Failed to load the Preschool class schedule.'
      throw error
    } finally {
      loading.value = false
    }
  }

  function setSelectedClassId(classId) {
    selectedClassId.value = String(classId || '').trim()
  }

  return {
    classOptions,
    classSummary,
    errorMessage,
    loadClassOptions,
    loadClassSchedule,
    loading,
    schedules,
    selectedClassId,
    setSelectedClassId,
  }
}
