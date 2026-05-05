<script setup>
defineProps({
  tabs: {
    type: Array,
    default: () => [],
  },
  activeTab: {
    type: String,
    default: 'all',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:activeTab'])
</script>

<template>
  <div class="notification-filter-tabs" role="tablist" aria-label="Notification filters">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="notification-filter-tabs__button"
      :class="{ 'notification-filter-tabs__button--active': activeTab === tab.value }"
      :disabled="disabled"
      role="tab"
      :aria-selected="activeTab === tab.value"
      @click="$emit('update:activeTab', tab.value)"
    >
      <span>{{ tab.label }}</span>
      <span class="notification-filter-tabs__count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.notification-filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.1rem;
  padding: 0.45rem;
  background: #ffffff;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.05);
}

.notification-filter-tabs__button {
  min-height: 2.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.85rem;
  padding: 0.58rem 0.85rem;
  background: transparent;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 800;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.notification-filter-tabs__button:hover:not(:disabled),
.notification-filter-tabs__button--active {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}

.notification-filter-tabs__button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.notification-filter-tabs__count {
  min-width: 1.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  padding: 0.18rem 0.45rem;
  background: #e2e8f0;
  color: #334155;
  font-size: 0.72rem;
  line-height: 1;
}

.notification-filter-tabs__button--active .notification-filter-tabs__count {
  background: #dbeafe;
  color: #1d4ed8;
}

@media (max-width: 640px) {
  .notification-filter-tabs {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
