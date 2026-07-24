import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BACK_ROUTE_NAME } from '../../constants/studentProfileConstants'

export function useStudentProfileActions() {
  const route = useRoute()
  const router = useRouter()

  const studentId = computed(() => String(route.params.id || '').trim())

  function goBack() {
    router.push({ name: BACK_ROUTE_NAME })
  }

  function goToHealthRecords() {
    if (!studentId.value) return
    router.push({ name: 'dashboard-preschool-admin-health-student', params: { id: studentId.value } })
  }

  function goToPayments() {
    if (!studentId.value) return
    router.push({ name: 'dashboard-preschool-admin-payment', query: { studentId: studentId.value } })
  }

  function goToCommunications() {
    if (!studentId.value) return
    router.push({ name: 'dashboard-preschool-admin-guardian-communications', query: { studentId: studentId.value } })
  }

  return {
    studentId,
    goBack,
    goToHealthRecords,
    goToPayments,
    goToCommunications,
  }
}
