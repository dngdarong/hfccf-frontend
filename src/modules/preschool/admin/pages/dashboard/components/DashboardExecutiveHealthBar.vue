<script setup>
import AppStatusChip from '@/components/ui/AppStatusChip.vue'

defineOptions({
  name: 'DashboardExecutiveHealthBar',
})

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="preschool-dashboard-page__health-grid">
    <article
      v-for="item in items"
      :key="item.label"
      class="preschool-dashboard-page__health-item"
      :data-status="item.status"
    >
      <div class="preschool-dashboard-page__health-card">
        <div class="preschool-dashboard-page__health-topline">
          <div class="preschool-dashboard-page__health-icon-wrap" aria-hidden="true">
            <i :class="[item.iconClass || 'pi pi-info-circle', 'preschool-dashboard-page__health-icon']" />
          </div>
          <AppStatusChip
            :status="item.status === 'healthy' ? 'success' : item.status"
            :label="item.statusBadgeLabel || item.statusLabel"
            :translate-label="false"
            size="xs"
          />
        </div>
        <div class="preschool-dashboard-page__health-copy">
          <p class="preschool-dashboard-page__health-label">{{ item.label }}</p>
          <p class="preschool-dashboard-page__health-detail">{{ item.detail }}</p>
        </div>
      </div>
    </article>
  </div>
</template>
