<script setup>
import PermissionBadge from '@/components/badges/PermissionBadge.vue'

defineOptions({
  name: 'ViewUserPermissionsCard',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  permissions: {
    type: Array,
    default: () => [],
  },
  fullAccessLabel: {
    type: String,
    default: 'Full access',
  },
  emptyLabel: {
    type: String,
    default: 'No permissions assigned.',
  },
  isFullAccess: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="view-user-permissions-card">
    <div class="view-user-permissions-card__header">
      <h2 class="view-user-permissions-card__title">{{ title }}</h2>
    </div>

    <div class="view-user-permissions-card__content">
      <template v-if="permissions.length">
        <span
          v-if="isFullAccess"
          class="view-user-permissions-card__full-access"
          :title="permissions.join(', ')"
        >
          {{ fullAccessLabel }}
        </span>

        <template v-else>
          <PermissionBadge
            v-for="permission in permissions"
            :key="permission.key"
            :permission="permission.label"
          />
        </template>
      </template>

      <p v-else class="view-user-permissions-card__empty">
        {{ emptyLabel }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.view-user-permissions-card {
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 18px 34px -34px rgba(15, 23, 42, 0.25);
}

.view-user-permissions-card__header {
  margin-bottom: 0.9rem;
}

.view-user-permissions-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.96rem;
  font-weight: 900;
  letter-spacing: 0.02em;
}

.view-user-permissions-card__content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.view-user-permissions-card__full-access {
  display: inline-flex;
  align-items: center;
  border: 1px solid #dbeafe;
  border-radius: 9999px;
  background: #eff6ff;
  padding: 0.45rem 0.75rem;
  color: #1d4ed8;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
}

.view-user-permissions-card__empty {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
}
</style>
