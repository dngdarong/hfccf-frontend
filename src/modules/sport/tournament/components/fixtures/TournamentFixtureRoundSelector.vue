<script setup>
import Button from 'primevue/button'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentFixtureRoundSelector',
})

const props = defineProps({
  rounds: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: [Number, String],
    default: 1,
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useLanguage()

function isActive(round) {
  return Number(props.modelValue || 1) === Number(round || 1)
}
</script>

<template>
  <section class="round-selector">
    <Button
      v-for="round in rounds"
      :key="round"
      type="button"
      class="rounded-xl round-selector__button"
      :severity="isActive(round) ? 'info' : 'secondary'"
      :outlined="!isActive(round)"
      :label="`${t('sportTournament.fixtures.labels.matchday')} ${round}`"
      @click="emit('update:modelValue', round)"
    />
  </section>
</template>

<style scoped>
.round-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.round-selector__button {
  white-space: nowrap;
}
</style>
