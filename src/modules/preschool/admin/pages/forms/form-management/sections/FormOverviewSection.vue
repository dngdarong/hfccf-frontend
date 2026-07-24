<script setup>
import FormMetricCard from '../components/FormMetricCard.vue'
import FormSectionHeader from '../components/FormSectionHeader.vue'

defineOptions({
  name: 'PreschoolFormOverviewSection',
})

defineProps({
  cards: {
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
  <section class="preschool-form-overview-section">
    <FormSectionHeader
      :eyebrow="header.eyebrow"
      :title="header.title"
      :description="header.description"
    />

    <div class="preschool-form-overview-section__grid">
      <FormMetricCard
        v-for="card in cards"
        :key="card.title"
        :icon="card.icon"
        :title="card.title"
        :description="card.description"
      />
    </div>
  </section>
</template>

<style scoped>
.preschool-form-overview-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preschool-form-overview-section__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
</style>
