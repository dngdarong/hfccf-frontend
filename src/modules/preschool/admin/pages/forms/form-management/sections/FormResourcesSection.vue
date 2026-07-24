<script setup>
import FormActionCard from '../components/FormActionCard.vue'
import FormSectionHeader from '../components/FormSectionHeader.vue'

defineOptions({
  name: 'PreschoolFormResourcesSection',
})

defineProps({
  header: {
    type: Object,
    required: true,
  },
  resources: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <section class="preschool-form-resources-section">
    <FormSectionHeader
      :eyebrow="header.eyebrow"
      :title="header.title"
      :description="header.description"
    />

    <div class="preschool-form-resources-section__grid">
      <FormActionCard
        v-for="resource in resources"
        :key="resource.title"
        :icon="resource.icon"
        :title="resource.title"
        :description="resource.description"
        :to="resource.to"
      />
    </div>
  </section>
</template>

<style scoped>
.preschool-form-resources-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preschool-form-resources-section__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
</style>
