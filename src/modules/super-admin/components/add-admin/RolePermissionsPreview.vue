<script setup>
import { computed } from 'vue'
import Checkbox from 'primevue/checkbox'
import { useLanguage } from '@/composables/useLanguage'
import { normalizePermissionLabel } from '@/modules/super-admin/services/rolePermissionsApi'

defineOptions({
  name: 'RolePermissionsPreview',
})

const props = defineProps({
  role: {
    type: String,
    default: '',
  },
  permissions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { t } = useLanguage()

function normalizePermission(permission) {
  if (typeof permission === 'string') {
    return {
      code: permission,
      name: normalizePermissionLabel(permission),
    }
  }

  const code = String(permission?.code || permission?.permission_code || '').trim()

  return {
    code,
    name: String(permission?.name || permission?.label || normalizePermissionLabel(code)).trim(),
  }
}

const normalizedPermissions = computed(() =>
  Array.isArray(props.permissions) ? props.permissions.map(normalizePermission).filter((permission) => permission.code) : [],
)

const hasRole = computed(() => Boolean(String(props.role || '').trim()))
const emptyMessage = computed(() =>
  hasRole.value
    ? t('users.addAdmin.rolePermissionsEmpty')
    : t('users.addAdmin.rolePermissionsSelectRole'),
)
</script>

<template>
  <section class="role-permissions-preview">
    <header class="role-permissions-preview__header">
      <div>
        <p class="role-permissions-preview__eyebrow">
          {{ t('users.addAdmin.permissions') }}
        </p>

        <p class="role-permissions-preview__subtext">
          {{ t('users.addAdmin.rolePermissionsHelper') }}
        </p>
      </div>
    </header>

    <div
      v-if="loading"
      class="role-permissions-preview__state"
    >
      {{ t('common.states.loading') }}
    </div>

    <div
      v-else-if="!normalizedPermissions.length"
      class="role-permissions-preview__state role-permissions-preview__state--empty"
    >
      {{ emptyMessage }}
    </div>

    <div
      v-else
      class="role-permissions-preview__grid"
    >
      <label
        v-for="permission in normalizedPermissions"
        :key="permission.code"
        class="role-permissions-preview__card role-permissions-preview__card--active"
      >
        <Checkbox
          binary
          :model-value="true"
          disabled
        />

        <span class="role-permissions-preview__label">
          {{ permission.name }}
        </span>

        <span class="role-permissions-preview__code">
          {{ permission.code }}
        </span>
      </label>
    </div>

    <p class="role-permissions-preview__hint">
      {{ t('users.addAdmin.rolePermissionsHint') }}
    </p>
  </section>
</template>

<style scoped>
.role-permissions-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.role-permissions-preview__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.role-permissions-preview__eyebrow {
  margin: 0;
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.role-permissions-preview__subtext {
  margin: 0.18rem 0 0;
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.5;
}

.role-permissions-preview__state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 8.5rem;
  padding: 1rem;
  border: 1px dashed #cbd5e1;
  border-radius: 0.9rem;
  background: #f8fbff;
  color: #64748b;
  font-size: 0.88rem;
  text-align: center;
}

.role-permissions-preview__state--empty {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.role-permissions-preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.65rem;
}

.role-permissions-preview__card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  min-height: 2.8rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid #d6e2ee;
  border-radius: 0.82rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  color: #334155;
}

.role-permissions-preview__card :deep(.p-checkbox) {
  opacity: 0.9;
}

.role-permissions-preview__card--active {
  border-color: #67b7df;
  background: linear-gradient(180deg, #e8f6fe 0%, #dff1fc 100%);
  color: #075985;
  box-shadow: 0 6px 14px -12px rgba(0, 87, 138, 0.8);
}

.role-permissions-preview__label {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
}

.role-permissions-preview__code {
  grid-column: 2;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.role-permissions-preview__hint {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.5;
}
</style>
