<script setup>
import Card from 'primevue/card'

defineOptions({
  name: 'TournamentFormSection',
})

defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <Card class="tournament-form-section">
    <template #title>
      {{ title }}
    </template>

    <template #subtitle>
      {{ subtitle }}
    </template>

    <template #content>
      <div class="tournament-form-section__content">
        <slot />
      </div>
    </template>
  </Card>
</template>

