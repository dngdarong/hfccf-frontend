<script setup>
import Card from 'primevue/card'

// Reusable card shell keeps Preschool settings sections visually aligned and
// avoids repeating the same border, shadow, and spacing pattern in each panel.
defineOptions({
  name: 'PreschoolSettingsSectionCard',
})

defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <Card class="preschool-settings-section-card">
    <template #title>
      <div class="space-y-1">
        <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
          {{ eyebrow }}
        </p>
        <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm font-normal text-slate-500">{{ subtitle }}</p>
      </div>
    </template>
    <template #content>
      <slot />
    </template>
  </Card>
</template>

<style scoped>
:deep(.p-card) {
  border-radius: 1.25rem;
  border: 1px solid #dbe4ef;
  background: #fff;
  box-shadow: 0 18px 45px -34px rgba(15, 23, 42, 0.45);
}

:deep(.p-card-body) {
  padding: 1.25rem;
}

:deep(.p-card-title) {
  margin-bottom: 1rem;
}
</style>
