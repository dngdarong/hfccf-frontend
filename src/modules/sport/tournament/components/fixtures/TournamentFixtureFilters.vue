<script setup>
import Select from 'primevue/select'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentFixtureFilters',
})

const props = defineProps({
  status: {
    type: String,
    default: 'all',
  },
  matchday: {
    type: [Number, String],
    default: 'all',
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  matchdayOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:status', 'update:matchday'])
const { t } = useLanguage()

const resolvedStatusOptions = computed(() => [
  { label: t('sportTournament.fixtures.filters.allStatuses'), value: 'all' },
  ...props.statusOptions,
])
</script>

<template>
  <section class="fixture-filters">
    <div class="fixture-filters__field">
      <span>{{ t('sportTournament.fixtures.filters.status') }}</span>
      <Select
        :model-value="status"
        :options="resolvedStatusOptions"
        option-label="label"
        option-value="value"
        append-to="self"
        @update:modelValue="emit('update:status', $event)"
      />
    </div>

    <div class="fixture-filters__field">
      <span>{{ t('sportTournament.fixtures.filters.matchday') }}</span>
      <Select
        :model-value="matchday"
        :options="matchdayOptions"
        option-label="label"
        option-value="value"
        append-to="self"
        @update:modelValue="emit('update:matchday', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.fixture-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.fixture-filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.fixture-filters__field span {
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.fixture-filters__field :deep(.p-select) {
  width: 100%;
}

@media (max-width: 768px) {
  .fixture-filters {
    grid-template-columns: 1fr;
  }
}
</style>
