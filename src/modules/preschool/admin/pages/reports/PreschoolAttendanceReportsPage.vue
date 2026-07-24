<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineOptions({ name: 'PreschoolAttendanceReportsPage' })

// Redirect to main reports page
router.replace({ name: 'dashboard-preschool-admin-reports' })
</script>

<template>
  <div><!-- Redirecting to reports dashboard --></div>
</template>
