<script setup>
import Button from '@/components/buttons/Button.vue'
import InputNumber from 'primevue/inputnumber'
import ToggleButton from 'primevue/togglebutton'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentKnockoutSettings',
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useLanguage()

const settings = computed({
  get() {
    return {
      qualificationSlots: 2,
      includeThirdPlaceTeams: false,
      bestThirdPlaceTeams: 0,
      thirdPlaceMatchEnabled: false,
      extraTimeEnabled: false,
      penaltyEnabled: false,
      seededMode: true,
      autoGenerateBracket: true,
      ...props.modelValue,
    }
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

function updateField(field, value) {
  settings.value = {
    ...settings.value,
    [field]: value,
  }
}
</script>

<template>
  <section class="knockout-settings">
    <div class="knockout-settings__head">
      <div>
        <h3 class="knockout-settings__title">{{ t('sportTournament.knockout.settings.title') }}</h3>
        <p class="knockout-settings__subtitle">{{ t('sportTournament.knockout.settings.subtitle') }}</p>
      </div>
    </div>

    <div class="knockout-settings__grid">
      <label class="knockout-settings__field">
        <span>{{ t('sportTournament.knockout.settings.qualificationSlots') }}</span>
        <InputNumber :model-value="settings.qualificationSlots" :min="1" :max="8" @update:modelValue="updateField('qualificationSlots', $event)" />
      </label>

      <label class="knockout-settings__field">
        <span>{{ t('sportTournament.knockout.settings.bestThirdPlaceTeams') }}</span>
        <InputNumber
          :model-value="settings.bestThirdPlaceTeams"
          :min="0"
          :max="8"
          :disabled="!settings.includeThirdPlaceTeams"
          @update:modelValue="updateField('bestThirdPlaceTeams', $event)"
        />
      </label>

      <label class="knockout-settings__field">
        <span>{{ t('sportTournament.knockout.settings.includeThirdPlaceTeams') }}</span>
        <ToggleButton
          :model-value="settings.includeThirdPlaceTeams"
          :on-label="t('common.enabled')"
          :off-label="t('common.disabled')"
          @update:modelValue="updateField('includeThirdPlaceTeams', $event)"
        />
      </label>

      <label class="knockout-settings__field">
        <span>{{ t('sportTournament.knockout.settings.thirdPlaceMatchEnabled') }}</span>
        <ToggleButton
          :model-value="settings.thirdPlaceMatchEnabled"
          :on-label="t('common.enabled')"
          :off-label="t('common.disabled')"
          @update:modelValue="updateField('thirdPlaceMatchEnabled', $event)"
        />
      </label>

      <label class="knockout-settings__field">
        <span>{{ t('sportTournament.knockout.settings.extraTimeEnabled') }}</span>
        <ToggleButton
          :model-value="settings.extraTimeEnabled"
          :on-label="t('common.enabled')"
          :off-label="t('common.disabled')"
          @update:modelValue="updateField('extraTimeEnabled', $event)"
        />
      </label>

      <label class="knockout-settings__field">
        <span>{{ t('sportTournament.knockout.settings.penaltyEnabled') }}</span>
        <ToggleButton
          :model-value="settings.penaltyEnabled"
          :on-label="t('common.enabled')"
          :off-label="t('common.disabled')"
          @update:modelValue="updateField('penaltyEnabled', $event)"
        />
      </label>

      <label class="knockout-settings__field">
        <span>{{ t('sportTournament.knockout.settings.seededMode') }}</span>
        <ToggleButton
          :model-value="settings.seededMode"
          :on-label="t('common.enabled')"
          :off-label="t('common.disabled')"
          @update:modelValue="updateField('seededMode', $event)"
        />
      </label>

      <label class="knockout-settings__field">
        <span>{{ t('sportTournament.knockout.settings.autoGenerateBracket') }}</span>
        <ToggleButton
          :model-value="settings.autoGenerateBracket"
          :on-label="t('common.enabled')"
          :off-label="t('common.disabled')"
          @update:modelValue="updateField('autoGenerateBracket', $event)"
        />
      </label>
    </div>

    <div class="knockout-settings__footer">
      <Button type="button" class="rounded-xl" outlined :label="t('common.reset')" @click="emit('update:modelValue', { ...settings })" />
    </div>
  </section>
</template>

<style scoped>
.knockout-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.35rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(141, 198, 63, 0.08), transparent 26%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.knockout-settings__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.knockout-settings__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
}

.knockout-settings__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.knockout-settings__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.knockout-settings__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.9rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.96);
}

.knockout-settings__field span {
  color: #0f172a;
  font-size: 0.84rem;
  font-weight: 700;
}

.knockout-settings__footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .knockout-settings {
    padding: 1rem;
  }

  .knockout-settings__grid {
    grid-template-columns: 1fr;
  }
}
</style>

