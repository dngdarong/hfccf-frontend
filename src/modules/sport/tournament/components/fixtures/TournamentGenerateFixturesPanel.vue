<script setup>
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import SelectButton from 'primevue/selectbutton'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGenerateFixturesPanel',
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  canGenerate: {
    type: Boolean,
    default: false,
  },
  canReset: {
    type: Boolean,
    default: false,
  },
  previewCount: {
    type: Number,
    default: 0,
  },
  previewMatchdays: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'preview', 'apply', 'reset'])
const { t } = useLanguage()

const modeOptions = computed(() => [
  { label: t('sportTournament.fixtures.settings.modes.single'), value: 'single' },
  { label: t('sportTournament.fixtures.settings.modes.double'), value: 'double' },
])

const settingsProxy = computed({
  get: () => ({
    roundRobinMode: 'single',
    homeAwayEnabled: false,
    matchdaySpacingDays: 7,
    baseDate: '',
    venue: '',
    ...props.modelValue,
  }),
  set: (value) => emit('update:modelValue', value),
})

function updateSetting(key, value) {
  emit('update:modelValue', {
    ...settingsProxy.value,
    [key]: value,
  })
}
</script>

<template>
  <section class="fixture-generator">
    <div class="fixture-generator__head">
      <div>
        <h3 class="fixture-generator__title">{{ t('sportTournament.fixtures.settings.title') }}</h3>
        <p class="fixture-generator__subtitle">{{ t('sportTournament.fixtures.settings.subtitle') }}</p>
      </div>

      <div class="fixture-generator__summary">
        <strong>{{ previewCount }}</strong>
        <span>{{ t('sportTournament.fixtures.stats.generated') }}</span>
      </div>
    </div>

    <div class="fixture-generator__grid">
      <div class="fixture-generator__field">
        <span>{{ t('sportTournament.fixtures.settings.roundRobinMode') }}</span>
        <SelectButton
          :model-value="settingsProxy.roundRobinMode"
          :options="modeOptions"
          option-label="label"
          option-value="value"
          @change="updateSetting('roundRobinMode', $event.value)"
        />
      </div>

      <div class="fixture-generator__field fixture-generator__field--switch">
        <span>{{ t('sportTournament.fixtures.settings.homeAwayEnabled') }}</span>
        <ToggleSwitch
          :model-value="settingsProxy.homeAwayEnabled"
          @update:modelValue="updateSetting('homeAwayEnabled', $event)"
        />
      </div>

      <div class="fixture-generator__field">
        <span>{{ t('sportTournament.fixtures.settings.matchdaySpacingDays') }}</span>
        <InputNumber
          :model-value="settingsProxy.matchdaySpacingDays"
          :min="1"
          :max="30"
          @update:modelValue="updateSetting('matchdaySpacingDays', $event)"
        />
      </div>

      <div class="fixture-generator__field">
        <span>{{ t('sportTournament.fixtures.settings.baseDate') }}</span>
        <DatePicker
          :model-value="settingsProxy.baseDate || null"
          date-format="yy-mm-dd"
          show-icon
          @update:modelValue="updateSetting('baseDate', $event ? new Date($event).toISOString().slice(0, 10) : '')"
        />
      </div>

      <div class="fixture-generator__field fixture-generator__field--full">
        <span>{{ t('sportTournament.fixtures.settings.venue') }}</span>
        <input
          :value="settingsProxy.venue"
          type="text"
          class="fixture-generator__input"
          @input="updateSetting('venue', $event.target.value)"
        />
      </div>
    </div>

    <div class="fixture-generator__actions">
      <Button
        type="button"
        class="rounded-xl"
        severity="info"
        :disabled="!canGenerate"
        :label="t('sportTournament.fixtures.actions.previewFixtures')"
        @click="emit('preview')"
      />
      <Button
        type="button"
        class="rounded-xl"
        severity="success"
        :disabled="!canGenerate || !previewCount"
        :label="t('sportTournament.fixtures.actions.applyPreview')"
        @click="emit('apply')"
      />
      <Button
        type="button"
        class="rounded-xl"
        outlined
        :disabled="!canReset"
        :label="t('sportTournament.fixtures.actions.resetFixtures')"
        @click="emit('reset')"
      />
    </div>

    <p class="fixture-generator__note">
      {{ t('sportTournament.fixtures.settings.note') }}
      <span v-if="previewMatchdays">· {{ previewMatchdays }} {{ t('sportTournament.fixtures.labels.matchdays') }}</span>
    </p>
  </section>
</template>

<style scoped>
.fixture-generator {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #dce6f2;
  border-radius: 1.35rem;
  background:
    radial-gradient(circle at top left, rgba(0, 174, 239, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.fixture-generator__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.fixture-generator__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 800;
}

.fixture-generator__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  line-height: 1.6;
}

.fixture-generator__summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
  padding: 0.75rem 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.fixture-generator__summary strong {
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 900;
}

.fixture-generator__summary span {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.fixture-generator__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.fixture-generator__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.fixture-generator__field span {
  color: #475569;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.fixture-generator__field--switch {
  justify-content: center;
}

.fixture-generator__field--full {
  grid-column: 1 / -1;
}

.fixture-generator__input {
  width: 100%;
  padding: 0.72rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.9rem;
  background: #ffffff;
  color: #0f172a;
}

.fixture-generator__input:focus {
  outline: 2px solid rgba(0, 174, 239, 0.24);
  outline-offset: 2px;
}

.fixture-generator__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.fixture-generator__note {
  margin: 0;
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .fixture-generator {
    padding: 1rem;
  }

  .fixture-generator__head,
  .fixture-generator__summary {
    align-items: flex-start;
  }

  .fixture-generator__grid {
    grid-template-columns: 1fr;
  }
}
</style>
