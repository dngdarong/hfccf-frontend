import { useRouter } from 'vue-router'

export function useFormManagementActions() {
  const router = useRouter()

  function navigateTo(name, query = {}) {
    return router.push({ name, query })
  }

  function goToManageTemplates() {
    return navigateTo('dashboard-preschool-admin-forms-manage')
  }

  function goToBuildForm() {
    return navigateTo('dashboard-preschool-admin-forms-build')
  }

  function goToReviewForms() {
    return navigateTo('dashboard-preschool-admin-forms-review')
  }

  function goToReports() {
  }

  function goToAuditLog() {
    return navigateTo('dashboard-preschool-admin-lifecycle-audit')
  }

  return {
    goToAuditLog,
    goToBuildForm,
    goToManageTemplates,
    goToReports,
    goToReviewForms,
    navigateTo,
  }
}
