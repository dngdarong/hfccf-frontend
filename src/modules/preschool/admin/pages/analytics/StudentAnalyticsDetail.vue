<script setup>
import AnalyticsDetailPage from './detail/AnalyticsDetailPage.vue'
import { preschoolAnalyticsDetailConfigs } from './detail/configs'

defineOptions({
  name: 'PreschoolStudentAnalyticsDetailPage',
})
</script>

<template>
  <AnalyticsDetailPage :config="preschoolAnalyticsDetailConfigs.students" />
</template>
