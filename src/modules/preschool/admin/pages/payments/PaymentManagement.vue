<script setup>
// Keep tuition-management copy locale-driven so the screen stays stable and
// can be regression-tested for EN/KH parity instead of hardcoded English.
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import PaymentFilters from '@/modules/preschool/admin/components/payment-management/PaymentFilters.vue'
import PaymentSummaryCards from '@/modules/preschool/admin/components/payment-management/PaymentSummaryCards.vue'
import PaymentTable from '@/modules/preschool/admin/components/payment-management/PaymentTable.vue'
import InvoiceTable from '@/modules/preschool/admin/components/payment-management/InvoiceTable.vue'
import PaymentToolbar from '@/modules/preschool/admin/components/payment-management/PaymentToolbar.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { normalizeDateForInput } from '@/utils/date'
import { fetchPreschoolClasses, fetchPreschoolPayments, fetchPreschoolStudents, createPreschoolPayment, updatePreschoolPayment, deletePreschoolPayment } from '@/modules/preschool/services/preschoolApi'
import { fetchPreschoolInvoices, createPreschoolInvoice, updatePreschoolInvoice, deletePreschoolInvoice, cancelPreschoolInvoice } from '@/modules/preschool/services/api/preschoolPaymentApi'
import { fetchFeeTypes as fetchConfiguredFeeTypes, fetchPaymentMethods as fetchConfiguredPaymentMethods, fetchPaymentSettings as fetchConfiguredPaymentSettings } from '@/modules/preschool/services/api/preschoolPaymentConfigurationApi'
import { PAGE_SIZE, DEFAULT_PAGINATION, DEFAULT_FORM, MODAL_MODES } from './constants/paymentManagementConstants'
import { buildStatusOptions, buildMethodOptions, buildTableColumns, normalize, mapPayment, normalizePayload, buildClassOptions, buildStudentOptions } from './utils/paymentManagementHelpers'
import { DEFAULT_INVOICE_FORM, DEFAULT_INVOICE_ITEM, buildInvoiceColumns, mapInvoice, normalizeInvoicePayload } from './utils/invoiceManagementHelpers'

defineOptions({
  name: 'PreschoolAdminPaymentManagementPage',
})

const { t } = useLanguage()
const router = useRouter()

const paymentRows = ref([])
const invoiceRows = ref([])
const searchQuery = ref('')
const classFilter = ref('')
const statusFilter = ref('')
const invoiceStatusFilter = ref('')
const currentPage = ref(1)
const invoicePage = ref(1)
const selectedPayment = ref(null)
const selectedInvoice = ref(null)
const isDeleteOpen = ref(false)
const isInvoiceDeleteOpen = ref(false)
const isInvoiceCancelOpen = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const loading = ref(false)
const invoiceLoading = ref(false)
const errorMessage = ref('')
const invoiceErrorMessage = ref('')
const pagination = ref({ ...DEFAULT_PAGINATION })
const invoicePagination = ref({ ...DEFAULT_PAGINATION })
const classOptions = ref([])
const studentOptions = ref([])
const modalOpen = ref(false)
const modalMode = ref('create')
const paymentSaving = ref(false)
const invoiceModalOpen = ref(false)
const invoiceModalMode = ref('create')
const invoiceSaving = ref(false)
const invoiceItems = ref([DEFAULT_INVOICE_ITEM()])
const configuredFeeTypes = ref([])
const configuredPaymentMethods = ref([])
const configuredPaymentSettings = ref({ invoicePrefix: 'INV', nextInvoiceNumber: 1 })

const form = reactive({ ...DEFAULT_FORM })
const invoiceForm = reactive({ ...DEFAULT_INVOICE_FORM() })

const statusOptions = computed(() => buildStatusOptions(t))
const methodOptions = computed(() => buildMethodOptions(t, configuredPaymentMethods.value))
const tableColumns = computed(() => buildTableColumns(t))
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

const studentById = computed(() =>
  studentOptions.value.reduce((carry, item) => {
    carry[String(item.value)] = item
    return carry
  }, {}),
)

const totalInvoiceAmount = computed(() =>
  invoiceRows.value.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0),
)
const totalInvoiceBalance = computed(() =>
  invoiceRows.value.reduce((sum, row) => sum + Number(row.balanceDue || 0), 0),
)
const totalInvoiceCount = computed(() => Number(invoicePagination.value.total || invoiceRows.value.length || 0))
const draftInvoiceCount = computed(
  () => invoiceRows.value.filter((row) => normalize(row.status) === 'draft').length,
)
const overdueInvoiceCount = computed(
  () => invoiceRows.value.filter((row) => normalize(row.status) === 'overdue').length,
)

const invoiceSummaryCards = computed(() => [
  {
    id: 'invoice-total',
    label: t('preschoolPaymentManagementPage.invoiceSection.title'),
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


const paidAmount = computed(() =>
  paymentRows.value
    .filter((row) => normalize(row.paymentStatus) === 'paid')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0),
)
const totalPaymentCount = computed(() => Number(pagination.value.total || paymentRows.value.length || 0))
const pendingCount = computed(
  () => paymentRows.value.filter((row) => normalize(row.paymentStatus) === 'pending').length,
)
const overdueCount = computed(
  () => paymentRows.value.filter((row) => normalize(row.paymentStatus) === 'overdue').length,
)

const summaryCards = computed(() => [
  {
    id: 'total',
    label: t('preschoolPaymentManagementPage.summary.total'),
    value: totalPaymentCount.value,
    tone: 'info',
    icon: 'pi pi-receipt',
  },
  {
    id: 'paid',
    label: t('preschoolPaymentManagementPage.summary.collected'),
    value: `$${paidAmount.value.toFixed(2)}`,
    tone: 'success',
    icon: 'pi pi-check-circle',
  },
  {
    id: 'pending',
    label: t('preschoolPaymentManagementPage.summary.pending'),
    value: pendingCount.value,
    tone: 'warning',
    icon: 'pi pi-clock',
  },
  {
    id: 'overdue',
    label: t('preschoolPaymentManagementPage.summary.overdue'),
    value: overdueCount.value,
    tone: 'danger',
    icon: 'pi pi-exclamation-triangle',
  },
])

const visibleRangeLabel = computed(() => {
  const total = Number(pagination.value.total || 0)
  if (!total) return t('preschoolPaymentManagementPage.messages.noResults')

  const perPage = Number(pagination.value.perPage || PAGE_SIZE || 1)
  const page = Number(pagination.value.page || currentPage.value || 1)
  const start = Math.min((page - 1) * perPage + 1, total)
  const end = Math.min(page * perPage, total)

  return t('preschoolPaymentManagementPage.toolbar.range', {
    start,
    end,
    total,
  })
})

const invoiceVisibleRangeLabel = computed(() => {
  const total = Number(invoicePagination.value.total || 0)
  if (!total) return t('preschoolPaymentManagementPage.messages.noInvoiceHistory')

  const perPage = Number(invoicePagination.value.perPage || PAGE_SIZE || 1)
  const page = Number(invoicePagination.value.page || invoicePage.value || 1)
  const start = Math.min((page - 1) * perPage + 1, total)
  const end = Math.min(page * perPage, total)

  return t('preschoolPaymentManagementPage.toolbar.range', {
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

async function loadPaymentConfiguration() {
  try {
    const [settings, feeTypesResponse, paymentMethodsResponse] = await Promise.all([
      fetchConfiguredPaymentSettings(),
      fetchConfiguredFeeTypes(),
      fetchConfiguredPaymentMethods(),
    ])

    configuredPaymentSettings.value = settings || { invoicePrefix: 'INV', nextInvoiceNumber: 1 }
    configuredFeeTypes.value = Array.isArray(feeTypesResponse?.items) ? feeTypesResponse.items : []
    configuredPaymentMethods.value = Array.isArray(paymentMethodsResponse?.items) ? paymentMethodsResponse.items : []
  } catch {
    configuredPaymentSettings.value = { invoicePrefix: 'INV', nextInvoiceNumber: 1 }
    configuredFeeTypes.value = []
    configuredPaymentMethods.value = []
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

async function loadPayments() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPreschoolPayments({
      page: currentPage.value,
      perPage: PAGE_SIZE,
      search: searchQuery.value,
      classId: classFilter.value,
      paymentStatus: statusFilter.value,
    })

    paymentRows.value = (response.items || []).map((row) => mapPayment(row, classOptionLabelMap.value, studentOptionLabelMap.value))
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    paymentRows.value = []
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

async function loadInvoices() {
  invoiceLoading.value = true
  invoiceErrorMessage.value = ''

  try {
    const response = await fetchPreschoolInvoices({
      page: invoicePage.value,
      perPage: PAGE_SIZE,
      search: searchQuery.value,
      classId: classFilter.value,
      status: invoiceStatusFilter.value,
    })

    invoiceRows.value = (response.items || []).map((row) => mapInvoice(row, classOptionLabelMap.value, studentOptionLabelMap.value))
    invoicePagination.value = response.pagination || invoicePagination.value
  } catch (error) {
    invoiceRows.value = []
    invoiceErrorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.loadInvoiceFailed')
  } finally {
    invoiceLoading.value = false
  }
}

function clearFilters() {
  searchQuery.value = ''
  classFilter.value = ''
  statusFilter.value = ''
  invoiceStatusFilter.value = ''
}

function openCreateInvoiceModal() {
  invoiceModalMode.value = 'create'
  selectedInvoice.value = null
  const prefix = String(configuredPaymentSettings.value.invoicePrefix || 'INV').trim() || 'INV'
  const nextNumber = Number(configuredPaymentSettings.value.nextInvoiceNumber || 1)
  const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${String(nextNumber).padStart(5, '0')}`
  const defaultFeeType = configuredFeeTypes.value[0]

  Object.assign(invoiceForm, {
    ...DEFAULT_INVOICE_FORM(),
    invoice_number: invoiceNumber,
  })
  invoiceItems.value = [
    defaultFeeType
      ? {
        description: defaultFeeType.name || '',
        quantity: 1,
        unit_price: Number(defaultFeeType.defaultAmount || 0),
        sort_order: 1,
      }
      : DEFAULT_INVOICE_ITEM(),
  ]
  invoiceModalOpen.value = true
}

function openEditInvoiceModal(row) {
  invoiceModalMode.value = 'edit'
  selectedInvoice.value = row
  Object.assign(invoiceForm, {
    student_id: row.studentId || '',
    class_id: row.classId || '',
    academic_year_id: row.academicYearId || '',
    term_id: row.termId || '',
    invoice_number: row.invoiceNumber || '',
    issue_date: normalizeDateForInput(row.issueDate || row.issue_date || ''),
    due_date: normalizeDateForInput(row.dueDate || row.due_date || ''),
    discount_amount: row.discountAmount || 0,
  })
  invoiceItems.value = Array.isArray(row.items) && row.items.length
    ? row.items.map((item, index) => ({
      description: item.description || '',
      quantity: item.quantity || 1,
      unit_price: item.unitPrice || 0,
      sort_order: item.sortOrder || index + 1,
    }))
    : [DEFAULT_INVOICE_ITEM()]
  invoiceModalOpen.value = true
}

function addInvoiceItem() {
  invoiceItems.value.push({
    ...DEFAULT_INVOICE_ITEM(),
    sort_order: invoiceItems.value.length + 1,
  })
}

function removeInvoiceItem(index) {
  invoiceItems.value.splice(index, 1)
  if (!invoiceItems.value.length) {
    invoiceItems.value = [DEFAULT_INVOICE_ITEM()]
  }
  invoiceItems.value = invoiceItems.value.map((item, itemIndex) => ({
    ...item,
    sort_order: itemIndex + 1,
  }))
}

function closeInvoiceModal() {
  invoiceModalOpen.value = false
  invoiceSaving.value = false
}

async function onSaveInvoice() {
  invoiceSaving.value = true
  invoiceErrorMessage.value = ''

  try {
    const payload = normalizeInvoicePayload(invoiceForm, invoiceItems.value)
    if (invoiceModalMode.value === 'edit' && selectedInvoice.value?.id) {
      await updatePreschoolInvoice(selectedInvoice.value.id, payload)
      successMessage.value = t('preschoolPaymentManagementPage.messages.updateInvoiceSuccess')
    } else {
      await createPreschoolInvoice(payload)
      successMessage.value = t('preschoolPaymentManagementPage.messages.createInvoiceSuccess')
    }

    showSuccess.value = true
    closeInvoiceModal()
    await loadInvoices()
  } catch (error) {
    invoiceErrorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveInvoiceFailed')
  } finally {
    invoiceSaving.value = false
  }
}

function onViewInvoice(row) {
  router.push({ name: 'dashboard-preschool-admin-invoice-detail', params: { id: row.id } })
}

function onEditInvoice(row) {
  if (normalize(row.status) !== 'draft') {
    invoiceErrorMessage.value = t('preschoolPaymentManagementPage.messages.saveInvoiceFailed')
    return
  }
  openEditInvoiceModal(row)
}

async function onDeleteInvoice(row) {
  selectedInvoice.value = row
  isInvoiceDeleteOpen.value = true
}

async function onCancelInvoice(row) {
  selectedInvoice.value = row
  isInvoiceCancelOpen.value = true
}

function onCloseInvoiceDelete() {
  isInvoiceDeleteOpen.value = false
  selectedInvoice.value = null
}

function onCloseInvoiceCancel() {
  isInvoiceCancelOpen.value = false
  selectedInvoice.value = null
}

async function onConfirmDeleteInvoice() {
  try {
    await deletePreschoolInvoice(selectedInvoice.value?.id)
    successMessage.value = t('preschoolPaymentManagementPage.messages.deleteInvoiceSuccess')
    showSuccess.value = true
    onCloseInvoiceDelete()
    await loadInvoices()
  } catch (error) {
    invoiceErrorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveInvoiceFailed')
  }
}

async function onConfirmCancelInvoice() {
  try {
    await cancelPreschoolInvoice(selectedInvoice.value?.id)
    successMessage.value = t('preschoolPaymentManagementPage.messages.cancelInvoiceSuccess')
    showSuccess.value = true
    onCloseInvoiceCancel()
    await loadInvoices()
  } catch (error) {
    invoiceErrorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveInvoiceFailed')
  }
}

function openCreateModal() {
  modalMode.value = MODAL_MODES.CREATE
  selectedPayment.value = null
  Object.assign(form, { ...DEFAULT_FORM })
  modalOpen.value = true
}

function syncClassFromStudent(studentId) {
  const selectedStudent = studentById.value[String(studentId)]
  const activeClasses = Array.isArray(selectedStudent?.classes)
    ? selectedStudent.classes.filter((item) => String(item?.status || 'active') === 'active')
    : []

  if (activeClasses.length === 1) {
    form.class_id = String(activeClasses[0]?.id || '')
  }
}

function openEditModal(row) {
  modalMode.value = MODAL_MODES.EDIT
  selectedPayment.value = row
  form.student_id = row.studentId || row.student_id || ''
  form.class_id = row.classId || row.class_id || ''
  form.payment_reference = row.paymentReference || row.payment_reference || ''
  form.amount = row.amount || ''
  form.currency = row.currency || 'USD'
  form.payment_method = row.paymentMethod || configuredPaymentMethods.value[0]?.code || 'cash'
  form.payment_status = row.paymentStatus || 'pending'
  form.paid_at = normalizeDateForInput(row.paidAt || row.paid_at || '')
  form.due_date = normalizeDateForInput(row.dueDate || row.due_date || '')
  form.note = row.note || ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  paymentSaving.value = false
}


async function onSavePayment() {
  paymentSaving.value = true
  errorMessage.value = ''

  try {
    const payload = normalizePayload(form)
    if (modalMode.value === MODAL_MODES.EDIT && selectedPayment.value?.id) {
      await updatePreschoolPayment(selectedPayment.value.id, payload)
      successMessage.value = t('preschoolPaymentManagementPage.messages.updateSuccess')
    } else {
      await createPreschoolPayment(payload)
      successMessage.value = t('preschoolPaymentManagementPage.messages.createSuccess')
    }

    showSuccess.value = true
    closeModal()
    await loadPayments()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveFailed')
  } finally {
    paymentSaving.value = false
  }
}

function onViewPayment(row) {
  openEditModal(row)
}

function onEditPayment(row) {
  openEditModal(row)
}

function onDeletePayment(row) {
  selectedPayment.value = row
  isDeleteOpen.value = true
}

function onCancelDelete() {
  isDeleteOpen.value = false
  selectedPayment.value = null
}

async function onConfirmDelete() {
  try {
    await deletePreschoolPayment(selectedPayment.value?.id)
    successMessage.value = t('preschoolPaymentManagementPage.messages.deleteSuccess')
    showSuccess.value = true
    onCancelDelete()
    await loadPayments()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveFailed')
  }
}

watch([searchQuery, classFilter, statusFilter], () => {
  currentPage.value = 1
  loadPayments()
  invoicePage.value = 1
  loadInvoices()
})

watch(invoiceStatusFilter, () => {
  invoicePage.value = 1
  loadInvoices()
})

watch(currentPage, () => {
  loadPayments()
})

watch(invoicePage, () => {
  loadInvoices()
})

onMounted(async () => {
  await Promise.all([loadClasses(), loadStudents(), loadPaymentConfiguration(), loadPayments(), loadInvoices()])
})
</script>

<template>
  <MainLayout>
    <section class="payment-management-page">
      <HeaderSection
        :title="t('preschoolPaymentManagementPage.title')"
        :subtitle="t('preschoolPaymentManagementPage.subtitle')"
      />

      <PaymentSummaryCards :cards="summaryCards" />

      <div class="payment-management-page__panel">
        <PaymentToolbar
          :eyebrow="t('preschoolPaymentManagementPage.toolbar.eyebrow')"
          :title="visibleRangeLabel"
          :clear-label="t('preschoolPaymentManagementPage.toolbar.clear')"
          :add-label="t('preschoolPaymentManagementPage.toolbar.add')"
          @clear="clearFilters"
          @add="openCreateModal"
        />

        <PaymentFilters
          v-model:searchQuery="searchQuery"
          v-model:classFilter="classFilter"
          v-model:statusFilter="statusFilter"
          :class-options="classOptions"
          :status-options="statusOptions"
          :search-placeholder="t('preschoolPaymentManagementPage.searchPlaceholder')"
          :all-classes-label="t('common.allClasses')"
          :all-status-label="t('common.allStatus')"
        />

        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ errorMessage }}
        </div>

        <PaymentTable
          :payments="paymentRows"
          :columns="tableColumns"
          :loading="loading"
          :empty-text="t('preschoolPaymentManagementPage.messages.noResults')"
          @view="onViewPayment"
          @edit="onEditPayment"
          @delete="onDeletePayment"
        />

        <div v-if="pagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="currentPage" :total-pages="pagination.totalPages" class="mt-2" />
        </div>
      </div>

      <PaymentSummaryCards :cards="invoiceSummaryCards" />

      <div class="payment-management-page__panel">
        <PaymentToolbar
          :eyebrow="t('preschoolPaymentManagementPage.invoiceSection.title')"
          :title="invoiceVisibleRangeLabel"
          :clear-label="t('preschoolPaymentManagementPage.toolbar.clear')"
          :add-label="t('preschoolPaymentManagementPage.actions.createInvoice')"
          @clear="clearFilters"
          @add="openCreateInvoiceModal"
        />

        <div class="payment-management-page__filter-row">
          <select v-model="invoiceStatusFilter" class="payment-management-page__input">
            <option value="">{{ t('common.allStatus') }}</option>
            <option v-for="status in invoiceStatusOptions" :key="status" :value="status">
              {{ t(`preschoolPaymentManagementPage.invoiceStatus.${status}`) }}
            </option>
          </select>
        </div>

        <div
          v-if="invoiceErrorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {{ invoiceErrorMessage }}
        </div>

        <InvoiceTable
          :invoices="invoiceRows"
          :columns="invoiceColumns"
          :loading="invoiceLoading"
          :empty-text="t('preschoolPaymentManagementPage.messages.noInvoiceHistory')"
          @view="onViewInvoice"
          @edit="onEditInvoice"
          @delete="onDeleteInvoice"
          @cancel="onCancelInvoice"
        />

        <div v-if="invoicePagination.totalPages > 1" class="flex justify-end">
          <Pagination v-model="invoicePage" :total-pages="invoicePagination.totalPages" class="mt-2" />
        </div>
      </div>
    </section>

    <Dialog v-model:visible="modalOpen" :header="modalMode === MODAL_MODES.EDIT ? t('preschoolPaymentManagementPage.dialog.editTitle') : t('preschoolPaymentManagementPage.dialog.createTitle')" modal class="payment-management-page__dialog">
      <div class="payment-management-page__dialog-grid">
        <div class="payment-management-page__field">
          <label for="payment-student-id" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.student') }}</label>
          <select id="payment-student-id" v-model="form.student_id" class="payment-management-page__input" @change="syncClassFromStudent($event.target.value)">
            <option value="">{{ t('preschoolPaymentManagementPage.dialog.student') }}</option>
            <option v-for="option in studentOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="payment-management-page__field">
          <label for="payment-class-id" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.class') }}</label>
          <select id="payment-class-id" v-model="form.class_id" class="payment-management-page__input">
            <option value="">{{ t('preschoolPaymentManagementPage.dialog.class') }}</option>
            <option v-for="option in classOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="payment-management-page__field">
          <label for="payment-reference" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.receiptNumber') }}</label>
          <input id="payment-reference" v-model="form.payment_reference" class="payment-management-page__input" type="text" :placeholder="t('preschoolPaymentManagementPage.dialog.reference')" />
        </div>
        <div class="payment-management-page__field">
          <label for="payment-amount" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.amount') }}</label>
          <input id="payment-amount" v-model="form.amount" class="payment-management-page__input" type="number" step="0.01" min="0" :placeholder="t('preschoolPaymentManagementPage.dialog.amount')" />
        </div>
        <div class="payment-management-page__field">
          <label for="payment-currency" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.currency') }}</label>
          <input id="payment-currency" v-model="form.currency" class="payment-management-page__input" type="text" :placeholder="t('preschoolPaymentManagementPage.dialog.currency')" />
        </div>
        <div class="payment-management-page__field">
          <label for="payment-method" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.paymentMethod') }}</label>
          <select id="payment-method" v-model="form.payment_method" class="payment-management-page__input">
            <option v-for="method in methodOptions" :key="method.value" :value="method.value">
              {{ method.label }}
            </option>
          </select>
        </div>
        <div class="payment-management-page__field">
          <label for="payment-status" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.status') }}</label>
          <select id="payment-status" v-model="form.payment_status" class="payment-management-page__input">
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        <div class="payment-management-page__field">
          <label for="payment-paid-at" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.paymentDate') }}</label>
          <input id="payment-paid-at" v-model="form.paid_at" class="payment-management-page__input" type="date" />
        </div>
        <div class="payment-management-page__field">
          <label for="payment-due-date" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.dueDate') }}</label>
          <input id="payment-due-date" v-model="form.due_date" class="payment-management-page__input" type="date" />
        </div>
        <div class="payment-management-page__field payment-management-page__dialog-full">
          <label for="payment-note" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.notes') }}</label>
          <textarea id="payment-note" v-model="form.note" class="payment-management-page__input" rows="3" :placeholder="t('preschoolPaymentManagementPage.dialog.note')"></textarea>
        </div>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeModal">{{ t('preschoolPaymentManagementPage.dialog.cancel') }}</Button>
        <Button type="button" variant="primary" rounded="xl" :loading="paymentSaving" :disabled="paymentSaving" @click="onSavePayment">
          {{ t('preschoolPaymentManagementPage.dialog.save') }}
        </Button>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="invoiceModalOpen"
      :header="invoiceModalMode === 'edit' ? t('preschoolPaymentManagementPage.actions.editInvoice') : t('preschoolPaymentManagementPage.actions.createInvoice')"
      modal
      class="payment-management-page__dialog payment-management-page__dialog--wide"
    >
      <div class="payment-management-page__dialog-grid">
        <div class="payment-management-page__field">
          <label for="invoice-student-id" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.student') }}</label>
          <select id="invoice-student-id" v-model="invoiceForm.student_id" class="payment-management-page__input">
            <option value="">{{ t('preschoolPaymentManagementPage.dialog.student') }}</option>
            <option v-for="option in studentOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="payment-management-page__field">
          <label for="invoice-class-id" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.class') }}</label>
          <select id="invoice-class-id" v-model="invoiceForm.class_id" class="payment-management-page__input">
            <option value="">{{ t('preschoolPaymentManagementPage.dialog.class') }}</option>
            <option v-for="option in classOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="payment-management-page__field">
          <label for="invoice-number" class="form-label">{{ t('preschoolPaymentManagementPage.invoiceLabels.number') }}</label>
          <input id="invoice-number" v-model="invoiceForm.invoice_number" class="payment-management-page__input" type="text" :placeholder="t('preschoolPaymentManagementPage.invoiceLabels.number')" />
        </div>
        <div class="payment-management-page__field">
          <label for="invoice-issue-date" class="form-label">{{ t('preschoolPaymentManagementPage.invoiceLabels.issueDate') }}</label>
          <input id="invoice-issue-date" v-model="invoiceForm.issue_date" class="payment-management-page__input" type="date" />
        </div>
        <div class="payment-management-page__field">
          <label for="invoice-due-date" class="form-label">{{ t('preschoolPaymentManagementPage.invoiceLabels.dueDate') }}</label>
          <input id="invoice-due-date" v-model="invoiceForm.due_date" class="payment-management-page__input" type="date" />
        </div>
        <div class="payment-management-page__field">
          <label for="invoice-total-amount" class="form-label">{{ t('preschoolPaymentManagementPage.invoiceLabels.total') }}</label>
          <input id="invoice-total-amount" v-model="invoiceForm.discount_amount" class="payment-management-page__input" type="number" step="0.01" min="0" :placeholder="t('preschoolPaymentManagementPage.invoiceLabels.balance')" />
        </div>
      </div>

      <div class="payment-management-page__invoice-items">
        <div class="payment-management-page__invoice-items-header">
          <h3>{{ t('preschoolPaymentManagementPage.invoiceSection.items') }}</h3>
          <Button type="button" variant="secondary" size="sm" rounded="xl" @click="addInvoiceItem">
            {{ t('preschoolPaymentManagementPage.actions.addInvoiceItem') }}
          </Button>
        </div>

        <div v-for="(item, index) in invoiceItems" :key="`${item.sort_order}-${index}`" class="payment-management-page__invoice-item">
          <div class="payment-management-page__field">
            <label :for="`invoice-item-${index}-description`" class="form-label">{{ t('preschoolPaymentManagementPage.invoiceLabels.description') }}</label>
            <input :id="`invoice-item-${index}-description`" v-model="item.description" class="payment-management-page__input" type="text" :placeholder="t('preschoolPaymentManagementPage.invoiceLabels.description')" />
          </div>
          <div class="payment-management-page__field">
            <label :for="`invoice-item-${index}-quantity`" class="form-label">{{ t('preschoolPaymentManagementPage.invoiceLabels.quantity') }}</label>
            <input :id="`invoice-item-${index}-quantity`" v-model="item.quantity" class="payment-management-page__input" type="number" min="0" step="0.01" :placeholder="t('preschoolPaymentManagementPage.invoiceLabels.quantity')" />
          </div>
          <div class="payment-management-page__field">
            <label :for="`invoice-item-${index}-unit-price`" class="form-label">{{ t('preschoolPaymentManagementPage.invoiceLabels.unitPrice') }}</label>
            <input :id="`invoice-item-${index}-unit-price`" v-model="item.unit_price" class="payment-management-page__input" type="number" min="0" step="0.01" :placeholder="t('preschoolPaymentManagementPage.invoiceLabels.unitPrice')" />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            rounded="xl"
            :disabled="invoiceItems.length === 1"
            @click="removeInvoiceItem(index)"
          >
            {{ t('preschoolPaymentManagementPage.actions.removeInvoiceItem') }}
          </Button>
        </div>
      </div>

      <div
        v-if="invoiceErrorMessage"
        class="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ invoiceErrorMessage }}
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeInvoiceModal">{{ t('preschoolPaymentManagementPage.dialog.cancel') }}</Button>
        <Button type="button" variant="primary" rounded="xl" :loading="invoiceSaving" :disabled="invoiceSaving" @click="onSaveInvoice">
          {{ t('preschoolPaymentManagementPage.dialog.save') }}
        </Button>
      </template>
    </Dialog>

    <AlertQuestion
      :show="isDeleteOpen"
      :title="t('preschoolPaymentManagementPage.alerts.deleteTitle')"
      :message="t('preschoolPaymentManagementPage.alerts.deleteMessage', { name: selectedPayment?.studentName || t('preschoolPaymentManagementPage.alerts.deleteFallback') })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="t('preschoolPaymentManagementPage.alerts.successTitle')"
      :message="successMessage"
      :button-text="t('preschoolPaymentManagementPage.alerts.close')"
      @close="showSuccess = false"
    />

    <AlertQuestion
      :show="isInvoiceDeleteOpen"
      :title="t('common.delete')"
      :message="t('preschoolPaymentManagementPage.alerts.deleteMessage', { name: selectedInvoice?.invoiceNumber || t('preschoolPaymentManagementPage.alerts.deleteFallback') })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onConfirmDeleteInvoice"
      @cancel="onCloseInvoiceDelete"
    />

    <AlertQuestion
      :show="isInvoiceCancelOpen"
      :title="t('preschoolPaymentManagementPage.actions.cancelInvoice')"
      :message="t('preschoolPaymentManagementPage.alerts.cancelInvoiceMessage', { name: selectedInvoice?.invoiceNumber || t('preschoolPaymentManagementPage.alerts.deleteFallback') })"
      :confirm-text="t('preschoolPaymentManagementPage.actions.cancelInvoice')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onConfirmCancelInvoice"
      @cancel="onCloseInvoiceCancel"
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

.payment-management-page__dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  min-width: min(100vw - 2rem, 48rem);
}

.payment-management-page__dialog--wide {
  min-width: min(100vw - 2rem, 72rem);
}

.payment-management-page__dialog-full {
  grid-column: 1 / -1;
}

.payment-management-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.payment-management-page__field .form-label {
  margin: 0;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 600;
  display: block;
}

.payment-management-page__input {
  width: 100%;
  min-height: 2.7rem;
  border-radius: 0.8rem;
  border: 1px solid #d4dde8;
  background: #fcfdff;
  padding: 0.6rem 0.8rem;
  color: #0f172a;
}

.payment-management-page__filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.payment-management-page__invoice-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.payment-management-page__invoice-items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.payment-management-page__invoice-items-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.payment-management-page__invoice-item {
  display: grid;
  grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr)) auto;
  gap: 0.75rem;
  align-items: center;
}

@media (max-width: 640px) {
  .payment-management-page__panel {
    padding: 1.1rem;
  }
}

@media (max-width: 900px) {
  .payment-management-page__dialog-grid {
    grid-template-columns: 1fr;
    min-width: 0;
  }

  .payment-management-page__dialog--wide {
    min-width: 0;
  }

  .payment-management-page__invoice-item {
    grid-template-columns: 1fr;
  }
}
</style>
