<script setup>
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import TournamentFixtureStatusBadge from './TournamentFixtureStatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentFixtureCard',
})

const props = defineProps({
  fixture: {
    type: Object,
    default: () => ({}),
  },
  editable: {
    type: Boolean,
    default: false,
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select', 'update-status'])
const { t } = useLanguage()

function changeStatus(event) {
  emit('update-status', {
    fixtureId: props.fixture?.id,
    status: event?.value,
  })
}
</script>

<template>
  <article class="fixture-card">
    <div class="fixture-card__head">
      <div class="fixture-card__copy">
        <div class="fixture-card__title-row">
          <h4 class="fixture-card__title">{{ fixture.homeTeamName }} vs {{ fixture.awayTeamName }}</h4>
          <TournamentFixtureStatusBadge :status="fixture.status" />
        </div>
        <p class="fixture-card__meta">
          {{ fixture.groupName }}
          <span class="fixture-card__dot">•</span>
          {{ t('sportTournament.fixtures.labels.matchday') }} {{ fixture.matchday || 1 }}
        </p>
      </div>

      <div class="fixture-card__score">
        <strong>{{ fixture.score?.home ?? '-' }}</strong>
        <span>:</span>
        <strong>{{ fixture.score?.away ?? '-' }}</strong>
      </div>
    </div>

    <div class="fixture-card__details">
      <div class="fixture-card__detail">
        <span>{{ t('sportTournament.fixtures.labels.dateTime') }}</span>
        <strong>{{ fixture.dateTime ? new Date(fixture.dateTime).toLocaleString() : '-' }}</strong>
      </div>
      <div class="fixture-card__detail">
        <span>{{ t('sportTournament.fixtures.labels.venue') }}</span>
        <strong>{{ fixture.venue || '-' }}</strong>
      </div>
    </div>

    <div class="fixture-card__footer">
      <Select
        v-if="editable"
        :model-value="fixture.status"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        append-to="self"
        class="fixture-card__status"
        @update:modelValue="changeStatus({ value: $event })"
      />

      <Button
        type="button"
        class="rounded-xl fixture-card__button"
        severity="info"
        :label="t('sportTournament.fixtures.actions.openResults')"
        @click="emit('select', fixture)"
      />
    </div>
  </article>
</template>

<style scoped>
.fixture-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid #dce6f2;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 20px 45px -35px rgba(15, 23, 42, 0.45);
}

.fixture-card__head,
.fixture-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.fixture-card__copy {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.fixture-card__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.fixture-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.98rem;
  line-height: 1.35;
  font-weight: 800;
}

.fixture-card__meta {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.5;
}

.fixture-card__dot {
  margin: 0 0.35rem;
}

.fixture-card__score {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 0.85rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.96);
}

.fixture-card__score strong {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 900;
}

.fixture-card__score span {
  color: #94a3b8;
  font-weight: 800;
}

.fixture-card__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.fixture-card__detail {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.8rem 0.9rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.92);
}

.fixture-card__detail span {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.fixture-card__detail strong {
  color: #0f172a;
  font-size: 0.88rem;
  line-height: 1.5;
}

.fixture-card__status {
  min-width: 9rem;
}

.fixture-card__status :deep(.p-select) {
  width: 100%;
}

.fixture-card__button {
  flex: 1;
}

@media (max-width: 640px) {
  .fixture-card__head,
  .fixture-card__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .fixture-card__details {
    grid-template-columns: 1fr;
  }
}
</style>

