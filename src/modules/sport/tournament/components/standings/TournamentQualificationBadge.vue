<script setup>
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentQualificationBadge',
})
defineProps({
  qualified: {
    type: Boolean,
    default: false,
  },
})

const { t } = useLanguage()
</script>

<template>
  <Tag :severity="qualified ? 'success' : 'secondary'" :value="qualified ? t('sportTournament.standings.qualified') : t('sportTournament.standings.notQualified')" />
</template>
