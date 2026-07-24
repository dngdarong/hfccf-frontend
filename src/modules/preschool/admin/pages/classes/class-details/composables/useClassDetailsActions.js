import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useClassDetailsActions() {
  const route = useRoute()
  const router = useRouter()

  const classId = computed(() => String(route.params.id || '').trim())

  function goBack() {
    router.push({ name: 'dashboard-preschool-admin-classes' })
  }

  function goEdit() {
    if (!classId.value) return
    router.push({
      path: '/module/preschool-admin/classes/add',
      query: { mode: 'edit', id: classId.value },
    })
  }

  function goToAttendance() {
    if (!classId.value) return
    router.push({
      name: 'dashboard-preschool-admin-attendance-students',
      query: { classId: classId.value },
    })
  }

  function goToSchedule() {
    if (!classId.value) return
    router.push({
      name: 'dashboard-preschool-admin-class-schedule',
      query: { classId: classId.value },
    })
  }

  return {
    classId,
    goBack,
    goEdit,
    goToAttendance,
    goToSchedule,
  }
}
