import { ref } from 'vue'

function createDefaultFilters() {
  return {
    dateFrom: '',
    dateTo: '',
    classId: '',
    teacherUserId: '',
    status: '',
  }
}

export function useOperationsFilters() {
  const filters = ref(createDefaultFilters())

  function resetFilters() {
    filters.value = createDefaultFilters()
  }

  function cloneFilters() {
    return {
      dateFrom: String(filters.value.dateFrom || ''),
      dateTo: String(filters.value.dateTo || ''),
      classId: String(filters.value.classId || ''),
      teacherUserId: String(filters.value.teacherUserId || ''),
      status: String(filters.value.status || ''),
    }
  }

  return {
    filters,
    resetFilters,
    cloneFilters,
  }
}
