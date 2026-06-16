<script setup>
import { useLanguage } from '@/composables/useLanguage'

/**
 * NotificationFilterTabs
 * --------------------------------------------------------------------------
 * Filter tabs for notification inbox.
 *
 * Features:
 * - Accessible tablist structure
 * - Active tab state
 * - Count badge per tab
 * - Disabled state support
 * --------------------------------------------------------------------------
 */

defineOptions({
  name: 'NotificationFilterTabs',
})

const props = defineProps({
  /**
   * Tab list.
   *
   * Expected shape:
   * {
   *   value: string,
   *   label: string,
   *   count: number
   * }
   */
  tabs: {
    type: Array,
    default: () => [],
  },

  /**
   * Active tab value.
   */
  activeTab: {
    type: String,
    default: 'all',
  },

  /**
   * Disable all tabs.
   */
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:activeTab'])
const { t } = useLanguage()

/**
 * Select tab only when enabled.
 */
function selectTab(tab) {
  if (props.disabled || !tab?.value) return
  if (props.activeTab === tab.value) return

  emit('update:activeTab', tab.value)
}
</script>

<template>
  <div
    class="notification-filter-tabs"
    role="tablist"
    :aria-label="t('common.notifications.filters')"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      class="notification-filter-tabs__button"
      :class="{
        'notification-filter-tabs__button--active': activeTab === tab.value,
      }"
      :disabled="disabled"
      role="tab"
      :aria-selected="activeTab === tab.value"
      @click="selectTab(tab)"
    >
      <span>{{ tab.label }}</span>

      <span class="notification-filter-tabs__count">
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>

<style scoped>
/**
 * Tabs wrapper.
 */
.notification-filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.45rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.1rem;
  background: #ffffff;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.05);
}

/**
 * Individual tab button.
 */
.notification-filter-tabs__button {
  display: inline-flex;
  min-height: 2.4rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.58rem 0.85rem;
  border: 1px solid transparent;
  border-radius: 0.85rem;
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

/**
 * Count badge.
 */
.notification-filter-tabs__count {
  display: inline-flex;
  min-width: 1.55rem;
  align-items: center;
  justify-content: center;
  padding: 0.18rem 0.45rem;
  border-radius: 9999px;
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
