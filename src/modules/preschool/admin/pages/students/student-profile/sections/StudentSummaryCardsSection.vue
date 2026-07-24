<script setup>
defineOptions({
  name: 'StudentSummaryCardsSection',
})

defineProps({
  cards: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="student-profile-page__cards">
    <article v-for="card in cards" :key="card.key" class="student-profile-page__card">
      <p class="student-profile-page__card-label">{{ card.label }}</p>
      <p class="student-profile-page__card-value">{{ card.value }}</p>
    </article>
  </div>
</template>
