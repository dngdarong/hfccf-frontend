<script setup>
// Keep this legacy Preschool report fragment explicit so future route wiring
// does not silently drift back to an unlabelled scaffold.
import PreschoolPlaceholderState from '@/modules/preschool/shared/components/PreschoolPlaceholderState.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolAdminAddReportLegacyPlaceholder',
})

const { t } = useLanguage()
</script>

<template>
  <PreschoolPlaceholderState
    :eyebrow="t('preschoolScaffold.reportManagement.eyebrow')"
    :title="t('preschoolScaffold.reportManagement.title')"
    :subtitle="t('preschoolScaffold.reportManagement.subtitle')"
    :description="t('preschoolScaffold.reportManagement.description')"
  />
</template>
