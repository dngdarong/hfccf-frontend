<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'

defineOptions({
  name: 'PreschoolDashboardActionList',
})

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
})

const normalizedItems = computed(() =>
  (Array.isArray(props.items) ? props.items : []).map((item) => (
    typeof item === 'string'
      ? {
        label: item,
        detail: '',
        value: '',
        tone: 'info',
        priority: '',
        priorityLabel: '',
        actionLabel: '',
        actionTo: null,
      }
      : {
        label: item.label || item.title || '',
        detail: item.detail || item.text || '',
        value: item.value ?? '',
        tone: item.tone || 'info',
        priority: item.priority || '',
        priorityLabel: item.priorityLabel || item.priority || '',
        actionLabel: item.actionLabel || '',
        actionTo: item.actionTo || null,
      }
  )),
)

const groupedItems = computed(() => {
  const order = ['critical', 'high', 'medium', 'info']
  const groups = new Map()

  normalizedItems.value.forEach((item) => {
    const priority = order.includes(item.priority) ? item.priority : 'info'
    if (!groups.has(priority)) groups.set(priority, [])
    groups.get(priority).push(item)
  })

  return order
    .filter(priority => groups.has(priority))
    .map(priority => ({
      priority,
      label: groups.get(priority)[0]?.priorityLabel || priority,
      items: groups.get(priority),
    }))
})
</script>

<template>
  <section class="preschool-dashboard-action-list">
    <div class="preschool-dashboard-action-list__header">
      <h3 class="preschool-dashboard-action-list__title">{{ props.title }}</h3>
      <span class="preschool-dashboard-action-list__count">{{ normalizedItems.length }}</span>
    </div>
    <div v-if="normalizedItems.length === 0" class="preschool-dashboard-action-list__empty">
      {{ props.emptyText }}
    </div>
    <div v-else class="preschool-dashboard-action-list__groups">
      <section v-for="group in groupedItems" :key="group.priority" class="preschool-dashboard-action-list__group">
        <div class="preschool-dashboard-action-list__group-heading">
          <h4>{{ group.label }}</h4>
          <span>{{ group.items.length }}</span>
        </div>
        <ul class="preschool-dashboard-action-list__list">
          <li
            v-for="item in group.items"
            :key="`${item.label}-${item.detail}-${item.value}`"
            class="preschool-dashboard-action-list__item"
            :data-tone="item.tone"
          >
            <span class="preschool-dashboard-action-list__bullet" aria-hidden="true"></span>
            <div class="preschool-dashboard-action-list__content">
              <div class="preschool-dashboard-action-list__meta">
                <span class="preschool-dashboard-action-list__label">{{ item.label }}</span>
                <AppStatusChip
                  v-if="item.priorityLabel"
                  :status="item.tone"
                  :label="item.priorityLabel"
                  :translate-label="false"
                  size="xs"
                  :dot="false"
                />
              </div>
              <span v-if="item.detail" class="preschool-dashboard-action-list__detail">{{ item.detail }}</span>
            </div>
            <span v-if="item.value !== ''" class="preschool-dashboard-action-list__value">{{ item.value }}</span>
            <RouterLink
              v-if="item.actionTo"
              :to="item.actionTo"
              class="preschool-dashboard-action-list__action"
            >
              {{ item.actionLabel }}
              <i class="pi pi-arrow-right" aria-hidden="true" />
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<style scoped>
.preschool-dashboard-action-list {
  padding: 1rem;
  border-radius: 1.15rem;
  border: 1px solid #dbe6f2;
  background: #ffffff;
  box-shadow: 0 18px 45px -36px rgba(15, 23, 42, 0.45);
}

.preschool-dashboard-action-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.preschool-dashboard-action-list__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.preschool-dashboard-action-list__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  min-height: 1.75rem;
  padding: 0 0.6rem;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.84rem;
  font-weight: 800;
}

.preschool-dashboard-action-list__groups {
  display: grid;
  gap: 0.8rem;
  margin-top: 0.8rem;
}

.preschool-dashboard-action-list__group-heading {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.4rem;
}

.preschool-dashboard-action-list__group-heading h4 {
  margin: 0;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preschool-dashboard-action-list__group-heading span {
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
}

.preschool-dashboard-action-list__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.preschool-dashboard-action-list__item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #334155;
  line-height: 1.6;
  padding: 0.65rem 0.75rem;
  border-radius: 0.85rem;
  background: #fbfdff;
  border: 1px solid #e2e8f0;
}

.preschool-dashboard-action-list__bullet {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);
  flex-shrink: 0;
}

.preschool-dashboard-action-list__content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}

.preschool-dashboard-action-list__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.preschool-dashboard-action-list__label {
  color: #0f172a;
  font-weight: 700;
}

.preschool-dashboard-action-list__detail {
  color: #64748b;
  font-size: 0.9rem;
}

.preschool-dashboard-action-list__action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  min-height: 2rem;
  padding: 0.25rem 0.25rem 0.25rem 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.1;
  text-decoration: none;
  white-space: nowrap;
}

.preschool-dashboard-action-list__action:hover {
  text-decoration: underline;
}

.preschool-dashboard-action-list__action:focus-visible {
  border-radius: 0.35rem;
  outline: 3px solid rgba(14, 165, 233, 0.28);
  outline-offset: 2px;
}

.preschool-dashboard-action-list__value {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 0.6rem;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.85rem;
  font-weight: 800;
}

.preschool-dashboard-action-list__empty {
  margin-top: 0.75rem;
  color: #64748b;
  font-size: 0.92rem;
}

@media (max-width: 640px) {
  .preschool-dashboard-action-list__item {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .preschool-dashboard-action-list__action {
    margin-left: 1.15rem;
  }
}
</style>
