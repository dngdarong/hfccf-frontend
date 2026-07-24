<script setup>
import AppBadge from '@/components/ui/AppBadge.vue'

defineOptions({
  name: 'DashboardAcademicContext',
})

defineProps({
  academicYear: {
    type: String,
    default: '',
  },
  academicTerm: {
    type: String,
    default: '',
  },
  lastUpdated: {
    type: String,
    default: '',
  },
  academicYearLabel: {
    type: String,
    required: true,
  },
  academicTermLabel: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="preschool-dashboard-page__context">
    <AppBadge
      v-if="academicYear"
      class="preschool-dashboard-page__context-pill"
      size="sm"
      variant="neutral"
      :title="academicYearLabel"
    >
      <i class="pi pi-calendar" aria-hidden="true" />
      {{ academicYear }}
    </AppBadge>
    <AppBadge
      v-if="academicTerm"
      class="preschool-dashboard-page__context-pill"
      size="sm"
      variant="neutral"
      :title="academicTermLabel"
    >
      <i class="pi pi-book" aria-hidden="true" />
      {{ academicTerm }}
    </AppBadge>
    <span v-if="lastUpdated" class="preschool-dashboard-page__updated">
      {{ lastUpdated }}
    </span>
  </div>
</template>

