<script setup>
import Card from 'primevue/card'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentSettingsSummary',
})

const props = defineProps({
  tournament: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

const items = computed(() => [
  {
    label: t('sportTournament.detail.settings.organizer'),
    value: props.tournament.organizer || '-',
  },
  {
    label: t('sportTournament.detail.settings.location'),
    value: props.tournament.location || '-',
  },
  {
    label: t('sportTournament.detail.settings.visibility'),
    value: t(`sportTournament.visibility.${props.tournament.visibility || 'private'}`),
  },
  {
    label: t('sportTournament.detail.settings.registration'),
    value: t(`sportTournament.registrationStatuses.${props.tournament.registrationStatus || 'closed'}`),
  },
  {
    label: t('sportTournament.detail.settings.rules'),
    value: [
      `${props.tournament.rules?.groupCount ?? 0} ${t('sportTournament.detail.settings.groups')}`,
      `${props.tournament.rules?.teamsPerGroup ?? 0} ${t('sportTournament.detail.settings.teamsPerGroup')}`,
      props.tournament.rules?.knockoutEnabled
        ? t('sportTournament.detail.settings.knockoutEnabled')
        : t('sportTournament.detail.settings.knockoutDisabled'),
    ].join(' • '),
  },
])
</script>

<template>
  <Card class="tournament-settings-summary">
    <template #title>
      {{ t('sportTournament.detail.settings.title') }}
    </template>
    <template #subtitle>
      {{ t('sportTournament.detail.settings.subtitle') }}
    </template>
    <template #content>
      <dl class="tournament-settings-summary__grid">
        <div v-for="item in items" :key="item.label" class="tournament-settings-summary__item">
          <dt class="tournament-settings-summary__label">{{ item.label }}</dt>
          <dd class="tournament-settings-summary__value">{{ item.value }}</dd>
        </div>
      </dl>
    </template>
  </Card>
</template>

<style scoped>
.tournament-settings-summary {
  border: 1px solid #dce6f2;
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.tournament-settings-summary__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin: 0;
}

.tournament-settings-summary__item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.95rem;
  border: 1px solid #dce6f2;
  border-radius: 1rem;
  background: rgba(248, 250, 252, 0.96);
}

.tournament-settings-summary__label {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tournament-settings-summary__value {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.6;
  font-weight: 700;
}

@media (max-width: 768px) {
  .tournament-settings-summary__grid {
    grid-template-columns: 1fr;
  }
}
</style>
