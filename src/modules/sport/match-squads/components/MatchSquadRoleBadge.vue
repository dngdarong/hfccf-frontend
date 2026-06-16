<script setup>
import { computed } from 'vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { MATCH_SQUAD_PLAYER_ROLE, normalizeMatchSquadRole } from '@/modules/sport/constants/matchSquad'

defineOptions({ name: 'MatchSquadRoleBadge' })

const props = defineProps({
  role: {
    type: String,
    default: '',
  },
})

const { t, te } = useLanguage()

const normalizedRole = computed(() => normalizeMatchSquadRole(props.role))
const roleLabel = computed(() =>
  normalizedRole.value && te(`sportMatchSquad.roles.${normalizedRole.value}`)
    ? t(`sportMatchSquad.roles.${normalizedRole.value}`)
    : t('sportMatchSquad.roles.reserve'),
)

const tone = computed(() => {
  switch (normalizedRole.value) {
    case MATCH_SQUAD_PLAYER_ROLE.STARTER:
      return 'success'
    case MATCH_SQUAD_PLAYER_ROLE.SUBSTITUTE:
      return 'info'
    case MATCH_SQUAD_PLAYER_ROLE.UNAVAILABLE:
      return 'danger'
    default:
      return 'neutral'
  }
})
</script>

<template>
  <StatusBadge
    :status="tone"
    :label="roleLabel"
    :translate-label="false"
    size="sm"
  />
</template>
