<script setup>
import AnalyticsDetailPage from './detail/AnalyticsDetailPage.vue'
import { preschoolAnalyticsDetailConfigs } from './detail/configs'

defineOptions({
  name: 'PreschoolGuardianContactAnalyticsDetailPage',
})
</script>

<template>
  <AnalyticsDetailPage :config="preschoolAnalyticsDetailConfigs.guardianContacts" />
</template>
