<script setup>
import FormActionCard from '../components/FormActionCard.vue'
import FormSectionHeader from '../components/FormSectionHeader.vue'

defineOptions({
  name: 'PreschoolFormQuickActionsSection',
})

defineProps({
  actions: {
    type: Array,
    required: true,
  },
  header: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="preschool-form-quick-actions-section">
    <FormSectionHeader
      :eyebrow="header.eyebrow"
      :title="header.title"
      :description="header.description"
    />

    <div class="preschool-form-quick-actions-section__grid">
      <FormActionCard
        v-for="action in actions"
        :key="action.title"
        :icon="action.icon"
        :title="action.title"
        :description="action.description"
        :to="action.to"
      />
    </div>
  </section>
</template>

<style scoped>
.preschool-form-quick-actions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preschool-form-quick-actions-section__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
</style>
