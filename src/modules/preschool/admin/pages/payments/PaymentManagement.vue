<script setup>
// Keep tuition-management copy locale-driven so the screen stays stable and
// can be regression-tested for EN/KH parity instead of hardcoded English.
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Dialog from 'primevue/dialog'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import PaymentFilters from '@/modules/preschool/admin/components/payment-management/PaymentFilters.vue'
import PaymentSummaryCards from '@/modules/preschool/admin/components/payment-management/PaymentSummaryCards.vue'
import PaymentTable from '@/modules/preschool/admin/components/payment-management/PaymentTable.vue'
import PaymentToolbar from '@/modules/preschool/admin/components/payment-management/PaymentToolbar.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { normalizeDateForInput } from '@/utils/date'
import { fetchPreschoolClasses, fetchPreschoolPayments, fetchPreschoolStudents, createPreschoolPayment, updatePreschoolPayment, deletePreschoolPayment } from '@/modules/preschool/services/preschoolApi'
import { fetchPreschoolInvoice, fetchPreschoolStudentInvoices } from '@/modules/preschool/services/api/preschoolPaymentApi'
import { fetchPaymentMethods as fetchConfiguredPaymentMethods } from '@/modules/preschool/services/api/preschoolPaymentConfigurationApi'
import { PAGE_SIZE, DEFAULT_PAGINATION, DEFAULT_FORM, MODAL_MODES } from './constants/paymentManagementConstants'
import { buildStatusOptions, buildMethodOptions, buildTableColumns, normalize, mapPayment, normalizePayload, buildClassOptions, buildStudentOptions } from './utils/paymentManagementHelpers'

defineOptions({
  name: 'PreschoolAdminPaymentManagementPage',
})

const { t } = useLanguage()
const route = useRoute()

const paymentRows = ref([])
const searchQuery = ref('')
const classFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const selectedPayment = ref(null)
const isDeleteOpen = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')
const loading = ref(false)
const errorMessage = ref('')
const pagination = ref({ ...DEFAULT_PAGINATION })
const classOptions = ref([])
const studentOptions = ref([])
const modalOpen = ref(false)
const modalMode = ref('create')
const paymentSaving = ref(false)
const configuredPaymentMethods = ref([])
const selectedStudentInvoices = ref([])
const selectedStudentInvoicesLoading = ref(false)
const selectedStudentInvoicesError = ref('')
const validationErrors = ref({})

const form = reactive({ ...DEFAULT_FORM })

const statusOptions = computed(() => buildStatusOptions(t))
const methodOptions = computed(() => buildMethodOptions(t, configuredPaymentMethods.value))
const tableColumns = computed(() => buildTableColumns(t))

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

const paymentInvoiceOptions = computed(() =>
  modalMode.value === MODAL_MODES.EDIT ? selectedStudentInvoices.value : [],
)

const selectedPaymentInvoice = computed(() =>
  paymentInvoiceOptions.value.find((row) => String(row.id) === String(form.invoice_id || '')) || null,
)


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
    const paymentMethodsResponse = await fetchConfiguredPaymentMethods()
    configuredPaymentMethods.value = Array.isArray(paymentMethodsResponse?.items) ? paymentMethodsResponse.items : []
  } catch {
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

function generatePaymentReference() {
  const stamp = new Date().toISOString().replace(/[\D]/g, '').slice(0, 14)
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `PAY-${stamp}-${suffix}`
}

function resetPaymentForm(mode = 'quick_invoice') {
  Object.assign(form, {
    ...DEFAULT_FORM,
    mode,
    payment_reference: generatePaymentReference(),
    payment_status: 'paid',
    currency: 'USD',
    paid_at: normalizeDateForInput(new Date()),
    issue_date: normalizeDateForInput(new Date()),
    due_date: normalizeDateForInput(new Date()),
  })
  selectedStudentInvoices.value = []
  selectedStudentInvoicesError.value = ''
  selectedStudentInvoicesLoading.value = false
  validationErrors.value = {}
}

async function loadStudentInvoicesForPayment(studentId) {
  const id = String(studentId || '').trim()
  if (!id) {
    selectedStudentInvoices.value = []
    selectedStudentInvoicesError.value = ''
    return
  }

  selectedStudentInvoicesLoading.value = true
  selectedStudentInvoicesError.value = ''

  try {
    const invoices = await fetchPreschoolStudentInvoices(id)
    selectedStudentInvoices.value = Array.isArray(invoices) ? invoices : []
  } catch (error) {
    selectedStudentInvoices.value = []
    selectedStudentInvoicesError.value = error?.message || t('preschoolPaymentManagementPage.messages.loadInvoiceFailed')
  } finally {
    selectedStudentInvoicesLoading.value = false
  }
}

async function openExistingInvoicePaymentModal(invoiceId) {
  const id = String(invoiceId || '').trim()
  if (!id) return

  try {
    const invoice = await fetchPreschoolInvoice(id)
    if (!invoice) return

    modalMode.value = MODAL_MODES.EDIT
    selectedPayment.value = null
    validationErrors.value = {}
    form.mode = 'existing_invoice'
    form.student_id = invoice.studentId || invoice.student_id || ''
    form.class_id = invoice.classId || invoice.class_id || ''
    form.invoice_id = invoice.id || id
    form.payment_reference = generatePaymentReference()
    form.description = ''
    form.amount = Number(invoice.balanceDue || invoice.balance_due || invoice.totalAmount || invoice.total_amount || 0).toFixed(2)
    form.currency = invoice.currency || 'USD'
    form.payment_method = configuredPaymentMethods.value[0]?.code || 'cash'
    form.payment_status = 'paid'
    form.paid_at = normalizeDateForInput(new Date())
    form.issue_date = normalizeDateForInput(invoice.issueDate || invoice.issue_date || new Date())
    form.due_date = normalizeDateForInput(invoice.dueDate || invoice.due_date || new Date())
    form.note = ''
    modalOpen.value = true

    if (form.student_id) {
      await loadStudentInvoicesForPayment(form.student_id)
    }
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.loadInvoiceFailed')
  }
}

async function onPaymentStudentChange(studentId) {
  form.student_id = studentId
  form.invoice_id = ''
  form.class_id = ''
  validationErrors.value = {}
  syncClassFromStudent(studentId)

  if (modalMode.value === MODAL_MODES.EDIT) {
    await loadStudentInvoicesForPayment(studentId)
  } else {
    selectedStudentInvoices.value = []
    selectedStudentInvoicesError.value = ''
  }
}

function onPaymentInvoiceChange(invoiceId) {
  form.invoice_id = invoiceId
  if (validationErrors.value.invoice_id) {
    const nextErrors = { ...validationErrors.value }
    delete nextErrors.invoice_id
    validationErrors.value = nextErrors
  }
  const invoice = paymentInvoiceOptions.value.find((row) => String(row.id) === String(invoiceId || ''))
  if (!invoice) return

  form.class_id = invoice.classId || form.class_id
  form.amount = Number(invoice.balanceDue || invoice.totalAmount || 0).toFixed(2)
  form.due_date = normalizeDateForInput(invoice.dueDate || '')
}

function clearFilters() {
  searchQuery.value = ''
  classFilter.value = ''
  statusFilter.value = ''
}

function openCreateModal() {
  modalMode.value = MODAL_MODES.CREATE
  selectedPayment.value = null
  resetPaymentForm('quick_invoice')
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
  validationErrors.value = {}
  form.mode = 'existing_invoice'
  form.student_id = row.studentId || row.student_id || ''
  form.class_id = row.classId || row.class_id || ''
  form.invoice_id = row.invoiceId || row.invoice_id || ''
  form.payment_reference = row.paymentReference || row.payment_reference || ''
  form.description = row.description || ''
  form.amount = row.amount || ''
  form.currency = row.currency || 'USD'
  form.payment_method = row.paymentMethod || configuredPaymentMethods.value[0]?.code || 'cash'
  form.payment_status = row.paymentStatus || 'pending'
  form.paid_at = normalizeDateForInput(row.paidAt || row.paid_at || '')
  form.issue_date = normalizeDateForInput(row.paidAt || row.paid_at || '')
  form.due_date = normalizeDateForInput(row.dueDate || row.due_date || '')
  form.note = row.note || ''
  modalOpen.value = true

  if (form.student_id) {
    loadStudentInvoicesForPayment(form.student_id)
  }
}

function closeModal() {
  modalOpen.value = false
  paymentSaving.value = false
  validationErrors.value = {}
}

function mapBackendValidationErrors(error, fieldMap = {}) {
  const responseErrors = error?.validationErrors
    || error?.response?.data?.data?.errors
    || error?.response?.data?.errors
    || {}

  const mapped = {}

  Object.entries(responseErrors).forEach(([field, messages]) => {
    const value = Array.isArray(messages) ? messages[0] : messages
    const mappedField = fieldMap[field] || field
    mapped[mappedField] = String(value || '')
  })

  return mapped
}

function validatePaymentDraft() {
  const errors = {}

  if (modalMode.value === MODAL_MODES.EDIT && !String(form.invoice_id || '').trim()) {
    errors.invoice_id = t('preschoolPaymentManagementPage.validation.invoiceRequired')
  }

  return errors
}

async function onSavePayment() {
  paymentSaving.value = true
  errorMessage.value = ''
  validationErrors.value = {}

  try {
    const localErrors = validatePaymentDraft()
    if (Object.keys(localErrors).length > 0) {
      validationErrors.value = localErrors
      errorMessage.value = t('preschoolPaymentManagementPage.messages.validationFailed')
      return
    }

    const payload = normalizePayload(form)
    if (modalMode.value === MODAL_MODES.EDIT && selectedPayment.value?.id) {
      await updatePreschoolPayment(selectedPayment.value.id, payload)
      successMessage.value = t('preschoolPaymentManagementPage.messages.updateSuccess')
    } else {
      await createPreschoolPayment(payload)
      successMessage.value = t('preschoolPaymentManagementPage.messages.quickPaymentSuccess')
    }

    showSuccess.value = true
    closeModal()
    await loadPayments()
  } catch (error) {
    const mappedErrors = mapBackendValidationErrors(error)
    if (Object.keys(mappedErrors).length > 0) {
      validationErrors.value = mappedErrors
      errorMessage.value = t('preschoolPaymentManagementPage.messages.validationFailed')
      return
    }

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
})

watch(currentPage, () => {
  loadPayments()
})

onMounted(async () => {
  await Promise.all([loadClasses(), loadStudents(), loadPaymentConfiguration(), loadPayments()])

  const invoiceId = String(route.query.invoiceId || '').trim()
  if (invoiceId) {
    await openExistingInvoicePaymentModal(invoiceId)
  }
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
    </section>

    <Dialog
      v-model:visible="modalOpen"
      :header="modalMode === MODAL_MODES.EDIT ? t('preschoolPaymentManagementPage.dialog.editTitle') : t('preschoolPaymentManagementPage.dialog.createTitle')"
      modal
      class="payment-management-page__dialog payment-management-page__dialog--wide"
    >
      <div class="payment-management-page__dialog-stack">
        <div v-if="modalMode === MODAL_MODES.CREATE" class="payment-management-page__notice">
          <strong>{{ t('preschoolPaymentManagementPage.paymentSource.noticeTitle') }}</strong>
          <p>{{ t('preschoolPaymentManagementPage.paymentSource.noticeBody') }}</p>
        </div>

        <div class="payment-management-page__dialog-grid">
          <div class="payment-management-page__field">
            <label for="payment-student-id" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.student') }}</label>
            <select id="payment-student-id" v-model="form.student_id" class="payment-management-page__input" @change="onPaymentStudentChange($event.target.value)">
              <option value="">{{ t('preschoolPaymentManagementPage.dialog.student') }}</option>
              <option v-for="option in studentOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <small v-if="validationErrors.student_id" class="payment-management-page__field-error">
              {{ validationErrors.student_id }}
            </small>
          </div>

          <div v-if="modalMode === MODAL_MODES.EDIT" class="payment-management-page__field">
            <label for="payment-invoice-id" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.invoice') }}</label>
            <select id="payment-invoice-id" v-model="form.invoice_id" class="payment-management-page__input" :disabled="selectedStudentInvoicesLoading" @change="onPaymentInvoiceChange($event.target.value)">
              <option value="">{{ t('preschoolPaymentManagementPage.dialog.selectInvoice') }}</option>
              <option v-for="invoice in paymentInvoiceOptions" :key="invoice.id" :value="invoice.id">
                {{ invoice.invoiceNumber }} · {{ invoice.balanceDueLabel }}
              </option>
            </select>
            <small v-if="validationErrors.invoice_id" class="payment-management-page__field-error">
              {{ validationErrors.invoice_id }}
            </small>
            <div v-if="selectedPaymentInvoice" class="payment-management-page__invoice-preview">
              <div>
                <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.total') }}</span>
                <strong>{{ selectedPaymentInvoice.totalAmountLabel }}</strong>
              </div>
              <div>
                <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.paid') }}</span>
                <strong>{{ selectedPaymentInvoice.paidAmount?.toFixed ? selectedPaymentInvoice.paidAmount.toFixed(2) : Number(selectedPaymentInvoice.paidAmount || 0).toFixed(2) }}</strong>
              </div>
              <div>
                <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.balance') }}</span>
                <strong>{{ selectedPaymentInvoice.balanceDueLabel }}</strong>
              </div>
              <div>
                <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.dueDate') }}</span>
                <strong>{{ selectedPaymentInvoice.dueDate || '-' }}</strong>
              </div>
              <div>
                <span>{{ t('preschoolPaymentManagementPage.columns.status') }}</span>
                <strong>{{ t(`preschoolPaymentManagementPage.invoiceStatus.${selectedPaymentInvoice.status}`) }}</strong>
              </div>
            </div>
          </div>

          <template v-else>
            <div class="payment-management-page__field">
              <label for="payment-class-id" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.class') }}</label>
              <select id="payment-class-id" v-model="form.class_id" class="payment-management-page__input">
                <option value="">{{ t('preschoolPaymentManagementPage.dialog.class') }}</option>
                <option v-for="option in classOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <small v-if="validationErrors.class_id" class="payment-management-page__field-error">
                {{ validationErrors.class_id }}
              </small>
            </div>
            <div class="payment-management-page__field">
              <label for="payment-description" class="form-label">{{ t('preschoolPaymentManagementPage.paymentSource.invoiceDescription') }}</label>
              <input id="payment-description" v-model="form.description" class="payment-management-page__input" type="text" :placeholder="t('preschoolPaymentManagementPage.paymentSource.invoiceDescription')" />
              <small v-if="validationErrors.description" class="payment-management-page__field-error">
                {{ validationErrors.description }}
              </small>
            </div>
            <div class="payment-management-page__field">
              <label for="payment-issue-date" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.issueDate') }}</label>
              <input id="payment-issue-date" v-model="form.issue_date" class="payment-management-page__input" type="date" />
            </div>
            <div class="payment-management-page__field">
              <label for="payment-due-date" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.dueDate') }}</label>
              <input id="payment-due-date" v-model="form.due_date" class="payment-management-page__input" type="date" />
              <small v-if="validationErrors.due_date" class="payment-management-page__field-error">
                {{ validationErrors.due_date }}
              </small>
            </div>
          </template>

          <div class="payment-management-page__field">
            <label for="payment-amount" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.amount') }}</label>
            <input id="payment-amount" v-model="form.amount" class="payment-management-page__input" type="number" step="0.01" min="0" :placeholder="t('preschoolPaymentManagementPage.dialog.amount')" />
            <small v-if="validationErrors.amount" class="payment-management-page__field-error">
              {{ validationErrors.amount }}
            </small>
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
            <small v-if="validationErrors.payment_method" class="payment-management-page__field-error">
              {{ validationErrors.payment_method }}
            </small>
          </div>
          <div class="payment-management-page__field">
            <label for="payment-reference" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.receiptNumber') }}</label>
            <input id="payment-reference" v-model="form.payment_reference" class="payment-management-page__input" type="text" :placeholder="t('preschoolPaymentManagementPage.dialog.reference')" />
            <small v-if="validationErrors.payment_reference" class="payment-management-page__field-error">
              {{ validationErrors.payment_reference }}
            </small>
          </div>
          <div v-if="modalMode === MODAL_MODES.EDIT" class="payment-management-page__field">
            <label for="payment-status" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.status') }}</label>
            <select id="payment-status" v-model="form.payment_status" class="payment-management-page__input">
              <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
            <small v-if="validationErrors.payment_status" class="payment-management-page__field-error">
              {{ validationErrors.payment_status }}
            </small>
          </div>
          <div class="payment-management-page__field">
            <label for="payment-paid-at" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.paymentDate') }}</label>
            <input id="payment-paid-at" v-model="form.paid_at" class="payment-management-page__input" type="date" />
            <small v-if="validationErrors.paid_at" class="payment-management-page__field-error">
              {{ validationErrors.paid_at }}
            </small>
          </div>
          <div class="payment-management-page__field payment-management-page__dialog-full">
            <label for="payment-note" class="form-label">{{ t('preschoolPaymentManagementPage.dialog.formLabels.notes') }}</label>
            <textarea id="payment-note" v-model="form.note" class="payment-management-page__input" rows="3" :placeholder="t('preschoolPaymentManagementPage.dialog.note')"></textarea>
            <small v-if="validationErrors.note" class="payment-management-page__field-error">
              {{ validationErrors.note }}
            </small>
          </div>
        </div>

        <div v-if="modalMode === MODAL_MODES.CREATE" class="payment-management-page__inline-help">
          {{ t('preschoolPaymentManagementPage.paymentSource.quickInvoiceHint') }}
        </div>

        <div v-if="selectedStudentInvoicesLoading" class="payment-management-page__state">
          {{ t('preschoolPaymentManagementPage.messages.loadingInvoices') }}
        </div>

        <div v-else-if="selectedStudentInvoicesError" class="payment-management-page__state payment-management-page__state--error">
          {{ selectedStudentInvoicesError }}
        </div>
      </div>

      <template #footer>
        <Button type="button" variant="outline" rounded="xl" @click="closeModal">{{ t('preschoolPaymentManagementPage.dialog.cancel') }}</Button>
        <Button type="button" variant="primary" rounded="xl" :loading="paymentSaving" :disabled="paymentSaving" @click="onSavePayment">
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

.payment-management-page__dialog-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-management-page__notice {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  border: 1px solid #c7d2fe;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 0.98));
  color: #1e293b;
}

.payment-management-page__notice strong {
  font-size: 0.95rem;
  font-weight: 800;
}

.payment-management-page__notice p {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: #475569;
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

.payment-management-page__hint,
.payment-management-page__inline-help {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #64748b;
}

.payment-management-page__field-error {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: #b91c1c;
}

.payment-management-page__invoice-preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.75rem;
  padding: 0.9rem;
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 0.98));
}

.payment-management-page__invoice-preview > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-management-page__invoice-preview span {
  font-size: 0.76rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.payment-management-page__invoice-preview strong {
  font-size: 0.95rem;
  color: #0f172a;
}

.payment-management-page__state {
  padding: 0.85rem 1rem;
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  background: #f8fbff;
  color: #475569;
  font-size: 0.86rem;
}

.payment-management-page__state--error {
  border-color: #fecaca;
  background: #fff1f2;
  color: #b91c1c;
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
