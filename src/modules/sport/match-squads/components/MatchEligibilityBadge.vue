<script setup>
import { computed } from 'vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  matchEligibilityTone,
  normalizeMatchEligibilityStatus,
} from '@/modules/sport/constants/matchSquad'

defineOptions({ name: 'MatchEligibilityBadge' })

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
})

const { t, te } = useLanguage()

const normalizedStatus = computed(() => normalizeMatchEligibilityStatus(props.status))
const eligibilityLabel = computed(() =>
  normalizedStatus.value && te(`sportMatchSquad.eligibility.${normalizedStatus.value}`)
    ? t(`sportMatchSquad.eligibility.${normalizedStatus.value}`)
    : t('sportMatchSquad.common.empty'),
)
</script>

<template>
  <StatusBadge
    :status="matchEligibilityTone(normalizedStatus)"
    :label="eligibilityLabel"
    :translate-label="false"
    size="sm"
  />
</template>
