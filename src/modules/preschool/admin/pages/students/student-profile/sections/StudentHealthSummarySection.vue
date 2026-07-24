<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'StudentHealthSummarySection',
})

defineProps({
  healthSummary: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['open-health'])
const { t } = useLanguage()
</script>

<template>
  <div v-if="healthSummary" class="student-profile-page__health">
    <div class="student-profile-page__health-header">
      <div>
        <p class="student-profile-page__panel-eyebrow">{{ t('preschoolHealthPage.profile.medicalProfile') }}</p>
        <h3 class="student-profile-page__panel-title">{{ t('preschoolHealthPage.dashboard.summaryTitle') }}</h3>
      </div>
      <Button type="button" variant="secondary" size="sm" rounded="xl" @click="emit('open-health')">
        {{ t('preschoolStudentProfilePage.actions.health') }}
      </Button>
    </div>

    <div class="student-profile-page__health-grid">
      <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.allergies') }}: {{ healthSummary.counts.allergies }}</div>
      <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.vaccinations') }}: {{ healthSummary.counts.vaccinations }}</div>
      <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.medications') }}: {{ healthSummary.counts.medications }}</div>
      <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.incidents') }}: {{ healthSummary.counts.incidents }}</div>
      <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.contacts') }}: {{ healthSummary.counts.emergencyContacts }}</div>
      <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.checks') }}: {{ healthSummary.counts.healthChecks }}</div>
    </div>
  </div>
</template>
