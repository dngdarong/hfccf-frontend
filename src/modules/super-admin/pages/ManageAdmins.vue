<script setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { ROLES, STAFF_ROLES } from '@/constants/roles'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminManagementToolbar from '@/modules/super-admin/components/admin-management/list/AdminManagementToolbar.vue'
import AdminManagementListPanel from '@/modules/super-admin/components/admin-management/list/AdminManagementListPanel.vue'
import AdminManagementDialogs from '@/modules/super-admin/components/admin-management/dialogs/AdminManagementDialogs.vue'
import ResetPasswordDialog from '@/modules/super-admin/components/admin-management/dialogs/ResetPasswordDialog.vue'
import { useAdminManagement } from '@/modules/super-admin/composables/useAdminManagement'
import { resetAdminUserPassword } from '@/modules/super-admin/services/adminUsersApi'

defineOptions({
  name: 'AdminManagementPage',
})

const { t } = useI18n()
const router = useRouter()

const statusOptions = ['active', 'pending', 'inactive', 'suspended']
const roleOptions = [ROLES.SUPER_ADMIN, ...STAFF_ROLES]
const tableColumns = computed(() => [
  { key: 'number', label: t('common.table.number'), align: 'left' },
  {
    key: 'user',
    field: 'name',
    sortField: 'first_name',
    label: t('common.table.user'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'email',
    field: 'email',
    label: t('common.table.email'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'role',
    field: 'role',
    label: t('common.table.role'),
    align: 'left',
    sortable: true,
  },
  { key: 'permission', label: t('common.table.permission'), align: 'left' },
  {
    key: 'status',
    field: 'status',
    label: t('common.table.status'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'created_at',
    field: 'createdAt',
    sortField: 'created_at',
    label: 'Created At',
    align: 'left',
    sortable: true,
  },
  { key: 'actions', label: t('common.table.actions'), align: 'right' },
])

const {
  searchQuery,
  roleFilter,
  statusFilter,
  currentPage,
  sortBy,
  sortDirection,
  isLoading,
  isDeleteOpen,
  showSuccess,
  successMessage,
  showError,
  errorMessage,
  pageTitle,
  pageSubtitle,
  searchPlaceholder,
  addButtonLabel,
  toolbarNote,
  refreshButtonLabel,
  toolbarCountText,
  tableEmptyText,
  loadingLabel,
  summaryCards,
  statusBadges,
  paginatedAdmins,
  totalPages,
  onSort,
  deleteConfirmTitle,
  deleteConfirmText,
  cancelLabel,
  deleteConfirmMessage,
  loadAdmins,
  onConfirmDelete,
  onDeleteAdmin,
  onCancelDelete,
  onClearFilters,
} = useAdminManagement()

const resetTarget = ref(null)
const resetOpen = ref(false)
const resetLoading = ref(false)
const resetPasswordError = ref('')
const resetForm = reactive({
  password: '',
  confirmPassword: '',
  reason: '',
})

function goToAddAdmin() {
  router.push('/module/super-admin/users/add')
}

function onEditAdmin(admin) {
  const id = String(admin?.id || '').trim()
  if (!id) return
  router.push({ path: '/module/super-admin/users/add', query: { mode: 'edit', id } })
}

function onViewAdmin(admin) {
  const id = String(admin?.id || '').trim()
  if (!id) return
  router.push({ name: 'dashboard-super-admin-users-view', params: { id } })
}

function resetResetForm() {
  resetForm.password = ''
  resetForm.confirmPassword = ''
  resetForm.reason = ''
  resetPasswordError.value = ''
}

function onResetAdmin(admin) {
  resetTarget.value = admin || null
  resetResetForm()
  resetOpen.value = true
}

function onResetCancel() {
  resetOpen.value = false
  resetTarget.value = null
  resetResetForm()
}

async function onResetConfirm() {
  const targetId = String(resetTarget.value?.id || '').trim()
  if (!targetId) return

  if (resetForm.password.length < 8 || resetForm.password !== resetForm.confirmPassword) {
    resetPasswordError.value = 'Passwords do not match.'
    return
  }

  resetLoading.value = true
  resetPasswordError.value = ''

  try {
    await resetAdminUserPassword(targetId, {
      password: resetForm.password,
      confirmPassword: resetForm.confirmPassword,
      reason: resetForm.reason,
    })
    await loadAdmins()
    resetOpen.value = false
    resetTarget.value = null
    resetResetForm()
  } catch (error) {
    resetPasswordError.value = error?.message || t('common.error')
  } finally {
    resetLoading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <section class="admin-directory-page">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <AdminSummaryCards :cards="summaryCards" />

      <div class="admin-directory-shell">
        <div class="admin-directory-shell__badges">
          <StatusBadge
            v-for="badge in statusBadges"
            :key="badge.status"
            :status="badge.status"
            :label="badge.label"
            :translate-label="false"
            size="sm"
            :dot="false"
          />
        </div>

        <AdminManagementToolbar
          :title="toolbarNote"
          :note="pageSubtitle"
          :count-text="toolbarCountText"
          :add-label="addButtonLabel"
          @add="goToAddAdmin"
        />

        <AdminManagementListPanel
          :refresh-label="refreshButtonLabel"
          :search-query="searchQuery"
          :role-filter="roleFilter"
          :status-filter="statusFilter"
          :search-placeholder="searchPlaceholder"
          :role-options="roleOptions"
          :status-options="statusOptions"
          :columns="tableColumns"
          :sort-field="sortBy"
          :sort-order="sortDirection === 'asc' ? 1 : -1"
          :server-side="true"
          :users="paginatedAdmins"
          :empty-text="tableEmptyText"
          :loading="isLoading"
          :show-reset-action="true"
          :loading-label="loadingLabel"
          @update:search-query="searchQuery = $event"
          @update:role-filter="roleFilter = $event"
          @update:status-filter="statusFilter = $event"
          @view="onViewAdmin"
          @edit="onEditAdmin"
          @delete="onDeleteAdmin"
          @reset="onResetAdmin"
          @refresh="loadAdmins"
          @clear="onClearFilters"
          @sort="onSort"
        />

        <div v-if="totalPages > 1" class="flex justify-end pt-1">
          <Pagination v-model="currentPage" :total-pages="totalPages" />
        </div>
      </div>
    </section>

    <AdminManagementDialogs
      :delete-show="isDeleteOpen"
      :delete-loading="isLoading"
      :delete-title="deleteConfirmTitle"
      :delete-message="deleteConfirmMessage"
      :delete-confirm-text="deleteConfirmText"
      :delete-cancel-text="cancelLabel"
      :success-show="showSuccess"
      :success-title="t('common.success')"
      :success-message="successMessage"
      :success-button-text="t('common.close')"
      :error-show="showError"
      :error-title="t('common.error')"
      :error-message="errorMessage"
      :error-button-text="t('common.close')"
      @confirm-delete="onConfirmDelete"
      @cancel-delete="onCancelDelete"
      @close-success="showSuccess = false"
      @close-error="showError = false"
    />

    <ResetPasswordDialog
      :visible="resetOpen"
      :loading="resetLoading"
      title="Reset password"
      description="Set a new password and leave a reason for the audit trail."
      :password="resetForm.password"
      :confirm-password="resetForm.confirmPassword"
      :reason="resetForm.reason"
      :error-message="resetPasswordError"
      @update:visible="resetOpen = $event"
      @update:password="resetForm.password = $event"
      @update:confirmPassword="resetForm.confirmPassword = $event"
      @update:reason="resetForm.reason = $event"
      @confirm="onResetConfirm"
      @cancel="onResetCancel"
    />
  </MainLayout>
</template>

<style scoped>
.admin-directory-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.admin-directory-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 1.75rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 252, 0.98) 100%);
  border: 1px solid #e7eaf3;
  padding: 1.25rem;
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.admin-directory-shell__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

</style>
