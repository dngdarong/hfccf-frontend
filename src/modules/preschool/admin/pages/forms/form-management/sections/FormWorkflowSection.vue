<script setup>
import FormActionCard from '../components/FormActionCard.vue'
import FormSectionHeader from '../components/FormSectionHeader.vue'

defineOptions({
  name: 'PreschoolFormWorkflowSection',
})

defineProps({
  header: {
    type: Object,
    required: true,
  },
  steps: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="preschool-form-workflow-section">
    <FormSectionHeader
      :eyebrow="header.eyebrow"
      :title="header.title"
      :description="header.description"
    />

    <div class="preschool-form-workflow-section__grid">
      <FormActionCard
        v-for="step in steps"
        :key="step.title"
        :icon="step.icon"
        :title="step.title"
        :description="step.description"
      />
    </div>
  </section>
</template>

<style scoped>
.preschool-form-workflow-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preschool-form-workflow-section__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
</style>
