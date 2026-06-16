<script setup>
import { computed } from 'vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { matchSquadStatusTone, normalizeMatchSquadStatus } from '@/modules/sport/constants/matchSquad'

defineOptions({ name: 'MatchSquadStatusBadge' })

const props = defineProps({
  status: {
    type: String,
    default: '',
  },
})

const { t, te } = useLanguage()

const normalizedStatus = computed(() => normalizeMatchSquadStatus(props.status))
const statusLabel = computed(() =>
  normalizedStatus.value && te(`sportMatchSquad.statuses.${normalizedStatus.value}`)
    ? t(`sportMatchSquad.statuses.${normalizedStatus.value}`)
    : t('sportMatchSquad.common.empty'),
)
</script>

<template>
  <StatusBadge
    :status="matchSquadStatusTone(normalizedStatus)"
    :label="statusLabel"
    :translate-label="false"
    size="sm"
  />
</template>
