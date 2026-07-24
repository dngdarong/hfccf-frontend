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

<style scoped>
.tournament-form-section {
  position: relative;
  overflow: hidden;
  border: 1px solid #dbe7f3;
  border-radius: 1.35rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 0.95) 100%);
  box-shadow: 0 18px 44px -36px rgba(15, 23, 42, 0.55);
}

.tournament-form-section::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 0.35rem;
  background: linear-gradient(90deg, var(--hope-o-cyan-blue) 0%, var(--hope-h-lime-green) 55%, #93c5fd 100%);
}

.tournament-form-section :deep(.p-card-body) {
  padding: 0;
}

.tournament-form-section :deep(.p-card-title) {
  margin: 0;
  color: #0f172a;
  font-size: 1.02rem;
  font-weight: 800;
  line-height: 1.25;
}

.tournament-form-section :deep(.p-card-subtitle) {
  margin-top: 0.35rem;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.55;
}

.tournament-form-section :deep(.p-card-content) {
  padding: 0;
}

.tournament-form-section__content {
  padding: 1.15rem 1.2rem 1.25rem;
}

@media (max-width: 640px) {
  .tournament-form-section__content {
    padding: 1rem;
  }
}
</style>
