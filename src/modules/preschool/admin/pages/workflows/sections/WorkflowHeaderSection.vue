<script setup>
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import Button from '@/components/buttons/Button.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  generatedAt: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  refreshLabel: {
    type: String,
    default: 'Refresh',
  },
})

defineEmits(['refresh'])
</script>

<template>
  <header class="workflow-header-section">
    <div>
      <Breadcrumb />
      <div class="workflow-header-section__eyebrow">Preschool</div>
      <h1 class="workflow-header-section__title">{{ title }}</h1>
      <p
        v-if="subtitle"
        class="workflow-header-section__subtitle"
      >
        {{ subtitle }}
      </p>
      <p
        v-if="generatedAt"
        class="workflow-header-section__meta"
      >
        {{ generatedAt }}
      </p>
    </div>

    <Button
      type="button"
      severity="secondary"
      outlined
      :loading="loading"
      @click="$emit('refresh')"
    >
      {{ refreshLabel }}
    </Button>
  </header>
</template>

<style scoped>
.workflow-header-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 1.2rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
}

.workflow-header-section__eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1d4ed8;
}

.workflow-header-section__title {
  margin: 0.35rem 0 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
}

.workflow-header-section__subtitle,
.workflow-header-section__meta {
  margin: 0.5rem 0 0;
  color: #475569;
}

.workflow-header-section__meta {
  font-size: 0.84rem;
}

@media (max-width: 768px) {
  .workflow-header-section {
    flex-direction: column;
  }
}
</style>
