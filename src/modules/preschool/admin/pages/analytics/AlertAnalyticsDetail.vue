<script setup>
import AnalyticsDetailPage from './detail/AnalyticsDetailPage.vue'
import { preschoolAnalyticsDetailConfigs } from './detail/configs'

defineOptions({
  name: 'PreschoolAlertAnalyticsDetailPage',
})
</script>

<template>
  <AnalyticsDetailPage :config="preschoolAnalyticsDetailConfigs.alerts" />
</template>
