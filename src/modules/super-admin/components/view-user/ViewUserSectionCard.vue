<script setup>
defineOptions({
  name: 'ViewUserSectionCard',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
  body: {
    type: String,
    default: '',
  },
  emptyLabel: {
    type: String,
    default: '-',
  },
})
</script>

<template>
  <div class="view-user-section-card">
    <div class="view-user-section-card__header">
      <h2 class="view-user-section-card__title">{{ title }}</h2>
    </div>

    <div v-if="rows.length" class="view-user-section-card__grid">
      <div
        v-for="item in rows"
        :key="item.label"
        class="view-user-section-card__row"
      >
        <span class="view-user-section-card__label">{{ item.label }}</span>
        <span class="view-user-section-card__value">
          {{ item.value !== null && item.value !== undefined && item.value !== '' ? item.value : emptyLabel }}
        </span>
      </div>
    </div>

    <div v-else class="view-user-section-card__body">
      <p class="view-user-section-card__body-text">
        {{ body !== null && body !== undefined && body !== '' ? body : emptyLabel }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.view-user-section-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 18px 34px -34px rgba(15, 23, 42, 0.25);
}

.view-user-section-card__header {
  margin-bottom: 0.9rem;
}

.view-user-section-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.96rem;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.view-user-section-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.view-user-section-card__row {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.72rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  background: #f8fafc;
}

.view-user-section-card__label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.view-user-section-card__value,
.view-user-section-card__body-text {
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.75;
  word-break: break-word;
}

.view-user-section-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.view-user-section-card__body-text {
  margin: 0;
  white-space: pre-line;
}

@media (max-width: 640px) {
  .view-user-section-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
