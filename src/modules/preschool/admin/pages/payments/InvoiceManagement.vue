<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import PaymentFilters from '@/modules/preschool/admin/components/payment-management/PaymentFilters.vue'
import PaymentSummaryCards from '@/modules/preschool/admin/components/payment-management/PaymentSummaryCards.vue'
import InvoiceTable from '@/modules/preschool/admin/components/payment-management/InvoiceTable.vue'
import PaymentToolbar from '@/modules/preschool/admin/components/payment-management/PaymentToolbar.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  fetchPreschoolClasses,
  fetchPreschoolStudents,
} from '@/modules/preschool/services/preschoolApi'
import {
  cancelPreschoolInvoice,
  deletePreschoolInvoice,
  downloadPreschoolInvoiceExport,
  fetchPreschoolInvoices,
  printPreschoolInvoice,
} from '@/modules/preschool/services/api/preschoolPaymentApi'
import { PAGE_SIZE, DEFAULT_PAGINATION } from './constants/paymentManagementConstants'
import {
  buildClassOptions,
  buildStudentOptions,
  normalize,
} from './utils/paymentManagementHelpers'
import {
  buildInvoiceColumns,
  mapInvoice,
} from './utils/invoiceManagementHelpers'

defineOptions({
  name: 'PreschoolAdminInvoiceManagementPage',
})

const { t } = useLanguage()
const router = useRouter()

const invoiceRows = ref([])
const searchQuery = ref('')
const classFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const selectedInvoice = ref(null)
const isDeleteOpen = ref(false)
const isCancelOpen = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const loading = ref(false)
const errorMessage = ref('')
const pagination = ref({ ...DEFAULT_PAGINATION })
const classOptions = ref([])
const studentOptions = ref([])
const exportLoading = ref(false)
const exportFormat = ref('')

const invoiceColumns = computed(() => buildInvoiceColumns(t))

const classOptionLabelMap = computed(() =>
  classOptions.value.reduce((carry, item) => {
    carry[String(item.value)] = item.label
    return carry
  }, {}),
)

const studentOptionLabelMap = computed(() =>
  studentOptions.value.reduce((carry, item) => {
    carry[String(item.value)] = item.label
    return carry
  }, {}),
)

const mappedInvoiceRows = computed(() =>
  invoiceRows.value.map((row) => mapInvoice(row, classOptionLabelMap.value, studentOptionLabelMap.value)),
)

const totalInvoiceAmount = computed(() =>
  mappedInvoiceRows.value.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0),
)

const totalInvoiceBalance = computed(() =>
  mappedInvoiceRows.value.reduce((sum, row) => sum + Number(row.balanceDue || 0), 0),
)

const totalInvoiceCount = computed(() => Number(pagination.value.total || mappedInvoiceRows.value.length || 0))

const draftInvoiceCount = computed(
  () => mappedInvoiceRows.value.filter((row) => normalize(row.status) === 'draft').length,
)

const overdueInvoiceCount = computed(
  () => mappedInvoiceRows.value.filter((row) => normalize(row.status) === 'overdue').length,
)

const invoiceSummaryCards = computed(() => [
  {
    id: 'invoice-total',
    label: t('preschoolInvoiceManagementPage.summary.total'),
    value: totalInvoiceCount.value,
    tone: 'info',
    icon: 'pi pi-file',
  },
  {
    id: 'invoice-amount',
    label: t('preschoolPaymentManagementPage.invoiceLabels.total'),
    value: `$${totalInvoiceAmount.value.toFixed(2)}`,
    tone: 'success',
    icon: 'pi pi-wallet',
  },
  {
    id: 'invoice-balance',
    label: t('preschoolPaymentManagementPage.invoiceLabels.balance'),
    value: `$${totalInvoiceBalance.value.toFixed(2)}`,
    tone: 'warning',
    icon: 'pi pi-exclamation-circle',
  },
  {
    id: 'invoice-overdue',
    label: t('preschoolPaymentManagementPage.invoiceStatus.overdue'),
    value: overdueInvoiceCount.value,
    tone: 'danger',
    icon: 'pi pi-times-circle',
  },
  {
    id: 'invoice-draft',
    label: t('preschoolPaymentManagementPage.invoiceStatus.draft'),
    value: draftInvoiceCount.value,
    tone: 'warning',
    icon: 'pi pi-pencil',
  },
])

const invoiceStatusOptions = ['draft', 'issued', 'partial', 'paid', 'overdue', 'cancelled']

const invoiceVisibleRangeLabel = computed(() => {
  const total = Number(pagination.value.total || 0)
  if (!total) return t('preschoolInvoiceManagementPage.messages.noResults')

  const perPage = Number(pagination.value.perPage || PAGE_SIZE || 1)
  const page = Number(pagination.value.page || currentPage.value || 1)
  const start = Math.min((page - 1) * perPage + 1, total)
  const end = Math.min(page * perPage, total)

  return t('preschoolInvoiceManagementPage.toolbar.range', {
    start,
    end,
    total,
  })
})

async function loadClasses() {
  try {
    const response = await fetchPreschoolClasses({ perPage: 100 })
    classOptions.value = buildClassOptions(response.items || [])
  } catch {
    classOptions.value = []
  }
}

async function loadStudents() {
  try {
    const response = await fetchPreschoolStudents({ perPage: 100 })
    studentOptions.value = buildStudentOptions(response.items || [])
  } catch {
    studentOptions.value = []
  }
}

async function loadInvoices() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPreschoolInvoices({
      page: currentPage.value,
      perPage: PAGE_SIZE,
      search: searchQuery.value,
      classId: classFilter.value,
      status: statusFilter.value,
    })

    invoiceRows.value = response.items || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    invoiceRows.value = []
    errorMessage.value = error?.message || t('preschoolInvoiceManagementPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}

function clearFilters() {
  searchQuery.value = ''
  classFilter.value = ''
  statusFilter.value = ''
}

function onViewInvoice(row) {
  router.push({ name: 'dashboard-preschool-admin-invoice-detail', params: { id: row.id } })
}

function onAddPayment(row) {
  if (!row?.id) return
  router.push({ name: 'dashboard-preschool-admin-payment', query: { invoiceId: row.id } })
}

function onDeleteInvoice(row) {
  selectedInvoice.value = row
  isDeleteOpen.value = true
}

function onCancelInvoice(row) {
  selectedInvoice.value = row
  isCancelOpen.value = true
}

function onCloseDelete() {
  isDeleteOpen.value = false
  selectedInvoice.value = null
}

function onCloseCancel() {
  isCancelOpen.value = false
  selectedInvoice.value = null
}

async function onConfirmDeleteInvoice() {
  try {
    await deletePreschoolInvoice(selectedInvoice.value?.id)
    successMessage.value = t('preschoolInvoiceManagementPage.messages.deleteSuccess')
    showSuccess.value = true
    onCloseDelete()
    await loadInvoices()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolInvoiceManagementPage.messages.saveFailed')
  }
}

async function onConfirmCancelInvoice() {
  try {
    await cancelPreschoolInvoice(selectedInvoice.value?.id)
    successMessage.value = t('preschoolInvoiceManagementPage.messages.cancelSuccess')
    showSuccess.value = true
    onCloseCancel()
    await loadInvoices()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolInvoiceManagementPage.messages.saveFailed')
  }
}

async function onPrintInvoice(row) {
  const invoiceId = row?.id
  if (!invoiceId) return

  try {
    const html = await printPreschoolInvoice(invoiceId)
    if (!html) return

    const win = window.open('', '_blank')
    if (!win) {
      errorMessage.value = t('preschoolInvoiceManagementPage.messages.exportFailed')
      return
    }

    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolInvoiceManagementPage.messages.exportFailed')
  }
}

async function onDownloadInvoice(row, format = 'pdf') {
  const invoiceId = row?.id
  if (!invoiceId) return

  exportLoading.value = true
  exportFormat.value = format
  errorMessage.value = ''

  try {
    const file = await downloadPreschoolInvoiceExport(invoiceId, format)
    if (file?.blob) {
      triggerDownload(file.blob, file.filename)
    }
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolInvoiceManagementPage.messages.exportFailed')
  } finally {
    exportLoading.value = false
    exportFormat.value = ''
  }
}

watch([searchQuery, classFilter, statusFilter], () => {
  currentPage.value = 1
  loadInvoices()
})

watch(currentPage, () => {
  loadInvoices()
})

onMounted(async () => {
  await Promise.all([loadClasses(), loadStudents(), loadInvoices()])
})
</script>

<template>
  <MainLayout>
    <section class="payment-management-page">
      <HeaderSection
        :title="t('preschoolInvoiceManagementPage.title')"
        :subtitle="t('preschoolInvoiceManagementPage.subtitle')"
      />

      <PaymentSummaryCards :cards="invoiceSummaryCards" />

      <div class="payment-management-page__panel">
        <PaymentToolbar
          :eyebrow="t('preschoolInvoiceManagementPage.toolbar.eyebrow')"
          :title="invoiceVisibleRangeLabel"
          :clear-label="t('preschoolInvoiceManagementPage.toolbar.clear')"
          @clear="clearFilters"
        />

        <PaymentFilters
          v-model:searchQuery="searchQuery"
          v-model:classFilter="classFilter"
          v-model:statusFilter="statusFilter"
          :class-options="classOptions"
          :status-options="invoiceStatusOptions"
          :search-placeholder="t('preschoolInvoiceManagementPage.searchPlaceholder')"
          :all-classes-label="t('common.allClasses')"
          :all-status-label="t('common.allStatus')"
        />

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <div v-if="exportLoading" class="payment-management-page__inline-help">
          {{ t('preschoolInvoiceManagementPage.messages.exporting') }}
        </div>

        <InvoiceTable
          :invoices="mappedInvoiceRows"
          :columns="invoiceColumns"
          :loading="loading"
          :empty-text="t('preschoolInvoiceManagementPage.messages.noResults')"
          @view="onViewInvoice"
          @delete="onDeleteInvoice"
          @cancel="onCancelInvoice"
          @print="onPrintInvoice"
          @download-pdf="onDownloadInvoice($event, 'pdf')"
          @download-excel="onDownloadInvoice($event, 'xlsx')"
          @add-payment="onAddPayment"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <AlertQuestion
      :show="isDeleteOpen"
      :title="t('preschoolPaymentManagementPage.alerts.deleteTitle')"
      :message="t('preschoolPaymentManagementPage.alerts.deleteMessage', { name: selectedInvoice?.invoiceNumber || t('preschoolPaymentManagementPage.alerts.deleteFallback') })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onConfirmDeleteInvoice"
      @cancel="onCloseDelete"
    />

    <AlertQuestion
      :show="isCancelOpen"
      :title="t('preschoolPaymentManagementPage.actions.cancelInvoice')"
      :message="t('preschoolPaymentManagementPage.alerts.cancelInvoiceMessage', { name: selectedInvoice?.invoiceNumber || t('preschoolPaymentManagementPage.alerts.deleteFallback') })"
      :confirm-text="t('preschoolPaymentManagementPage.actions.cancelInvoice')"
      :cancel-text="t('common.cancel')"
      type="warning"
      @confirm="onConfirmCancelInvoice"
      @cancel="onCloseCancel"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('preschoolInvoiceManagementPage.alerts.successTitle')"
      :message="successMessage"
      :button-text="t('preschoolInvoiceManagementPage.alerts.close')"
      @close="showSuccess = false"
    />
  </MainLayout>
</template>

<style scoped>
.payment-management-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.payment-management-page__panel {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.payment-management-page__inline-help {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #64748b;
}

@media (max-width: 640px) {
  .payment-management-page__panel {
    padding: 1.1rem;
  }
}
</style>
