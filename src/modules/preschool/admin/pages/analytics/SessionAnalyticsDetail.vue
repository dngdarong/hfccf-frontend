<script setup>
import AnalyticsDetailPage from './detail/AnalyticsDetailPage.vue'
import { preschoolAnalyticsDetailConfigs } from './detail/configs'

defineOptions({
  name: 'PreschoolSessionAnalyticsDetailPage',
})
</script>

<template>
  <AnalyticsDetailPage :config="preschoolAnalyticsDetailConfigs.sessions" />
</template>
