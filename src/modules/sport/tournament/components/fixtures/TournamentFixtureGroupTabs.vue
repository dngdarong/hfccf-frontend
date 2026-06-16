<script setup>
import Button from 'primevue/button'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentFixtureGroupTabs',
})

const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: '',
  },
  includeAll: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useLanguage()

function isActive(value) {
  return String(props.modelValue || '') === String(value || '')
}
</script>

<template>
  <section class="fixture-tabs">
    <Button
      v-if="includeAll"
      type="button"
      class="rounded-xl fixture-tabs__button"
      :severity="isActive('all') ? 'info' : 'secondary'"
      :outlined="!isActive('all')"
      :label="t('sportTournament.fixtures.filters.allGroups')"
      @click="emit('update:modelValue', 'all')"
    />

    <Button
      v-for="group in groups"
      :key="group.id"
      type="button"
      class="rounded-xl fixture-tabs__button"
      :severity="isActive(group.id) ? 'info' : 'secondary'"
      :outlined="!isActive(group.id)"
      :label="group.name"
      @click="emit('update:modelValue', group.id)"
    />
  </section>
</template>

<style scoped>
.fixture-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.fixture-tabs__button {
  white-space: nowrap;
}
</style>
