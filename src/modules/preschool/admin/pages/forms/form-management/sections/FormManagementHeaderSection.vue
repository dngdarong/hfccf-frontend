<script setup>
import FormManagementHero from '@/modules/preschool/admin/components/form-management/FormManagementHero.vue'

defineOptions({
  name: 'PreschoolFormManagementHeaderSection',
})

defineProps({
  hero: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <FormManagementHero
    :eyebrow="hero.eyebrow"
    :title="hero.title"
    :description="hero.description"
    :meta-label="hero.metaLabel"
    :meta-note="hero.metaNote"
    :quick-links="hero.quickLinks"
  />
</template>
