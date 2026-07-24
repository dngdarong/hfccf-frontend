<script setup>
import AnalyticsDetailPage from './detail/AnalyticsDetailPage.vue'
import { preschoolAnalyticsDetailConfigs } from './detail/configs'

defineOptions({
  name: 'PreschoolTeacherAnalyticsDetailPage',
})
</script>

<template>
  <AnalyticsDetailPage :config="preschoolAnalyticsDetailConfigs.teachers" />
</template>
