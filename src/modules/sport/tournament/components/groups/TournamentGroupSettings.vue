<script setup>
import Card from 'primevue/card'
import InputNumber from 'primevue/inputnumber'
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGroupSettings',
})

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useLanguage()

const settings = computed(() => ({
  groupCount: Number(props.modelValue?.groupCount || 1),
  teamsPerGroup: Number(props.modelValue?.teamsPerGroup || 1),
  qualificationCount: Number(props.modelValue?.qualificationCount || 1),
  seededMode: Boolean(props.modelValue?.seededMode ?? true),
  autoFixtureGeneration: Boolean(props.modelValue?.autoFixtureGeneration ?? true),
}))

function patch(nextPatch) {
  emit('update:modelValue', {
    ...settings.value,
    ...nextPatch,
  })
}
</script>

<template>
  <Card class="group-settings">
    <template #title>
      {{ t('sportTournament.groups.settings.title') }}
    </template>
    <template #subtitle>
      {{ t('sportTournament.groups.settings.subtitle') }}
    </template>
    <template #content>
      <div class="group-settings__grid">
        <label class="group-settings__field">
          <span class="group-settings__label">{{ t('sportTournament.groups.settings.groupCount') }}</span>
          <InputNumber
            :model-value="settings.groupCount"
            :min="1"
            :use-grouping="false"
            :disabled="disabled"
            class="group-settings__input"
            @update:modelValue="patch({ groupCount: Number($event || 1) })"
          />
        </label>

        <label class="group-settings__field">
          <span class="group-settings__label">{{ t('sportTournament.groups.settings.teamsPerGroup') }}</span>
          <InputNumber
            :model-value="settings.teamsPerGroup"
            :min="1"
            :use-grouping="false"
            :disabled="disabled"
            class="group-settings__input"
            @update:modelValue="patch({ teamsPerGroup: Number($event || 1) })"
          />
        </label>

        <label class="group-settings__field">
          <span class="group-settings__label">{{ t('sportTournament.groups.settings.qualificationCount') }}</span>
          <InputNumber
            :model-value="settings.qualificationCount"
            :min="1"
            :use-grouping="false"
            :disabled="disabled"
            class="group-settings__input"
            @update:modelValue="patch({ qualificationCount: Number($event || 1) })"
          />
        </label>

        <label class="group-settings__switch">
          <input
            :checked="settings.seededMode"
            type="checkbox"
            :disabled="disabled"
            @change="patch({ seededMode: $event.target.checked })"
          >
          <span>{{ t('sportTournament.groups.settings.seededMode') }}</span>
        </label>

        <label class="group-settings__switch">
          <input
            :checked="settings.autoFixtureGeneration"
            type="checkbox"
            :disabled="disabled"
            @change="patch({ autoFixtureGeneration: $event.target.checked })"
          >
          <span>{{ t('sportTournament.groups.settings.autoFixtureGeneration') }}</span>
        </label>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.group-settings {
  border: 1px solid #dce6f2;
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.group-settings__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.group-settings__field,
.group-settings__switch {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.group-settings__label {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

.group-settings__input {
  width: 100%;
}

.group-settings__switch {
  flex-direction: row;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.96);
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 700;
}

@media (max-width: 768px) {
  .group-settings__grid {
    grid-template-columns: 1fr;
  }
}
</style>
