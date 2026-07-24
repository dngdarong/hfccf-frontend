<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'
import {
  cancelPreschoolInvoice,
  createPreschoolReceiptFromPayment,
  deletePreschoolInvoice,
  downloadPreschoolInvoiceExport,
  fetchPreschoolInvoice,
  issuePreschoolInvoice,
  printPreschoolInvoice,
  printPreschoolReceipt,
} from '@/modules/preschool/services/api/preschoolPaymentApi'

defineOptions({
  name: 'PreschoolAdminInvoiceDetailPage',
})

const { t } = useLanguage()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const invoice = ref(null)
const actionLoading = ref(false)
const exportLoading = ref(false)
const exportFormat = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const deleteDialogOpen = ref(false)
const cancelDialogOpen = ref(false)
const navigateAfterSuccess = ref(false)

const itemRows = computed(() => invoice.value?.items || [])
const receiptRows = computed(() => invoice.value?.receipts || [])
const receiptRowsByPayment = computed(() =>
  receiptRows.value.reduce((carry, receipt) => {
    const paymentId = String(receipt.paymentId || '')
    if (!paymentId) return carry

    if (!carry[paymentId]) {
      carry[paymentId] = []
    }

    carry[paymentId].push(receipt)
    return carry
  }, {}),
)
const paymentRows = computed(() =>
  (invoice.value?.payments || []).map((payment) => ({
    ...payment,
    linkedReceipts: receiptRowsByPayment.value[String(payment.id || '')] || [],
  })),
)
const normalizedStatus = computed(() => String(invoice.value?.status || '').trim().toLowerCase())
const canIssueInvoice = computed(() => !!invoice.value?.id && normalizedStatus.value === 'draft')
const canDeleteInvoice = computed(() => !!invoice.value?.id && normalizedStatus.value === 'draft')
const canCancelInvoice = computed(() => !!invoice.value?.id && ['issued', 'partial', 'overdue'].includes(normalizedStatus.value))
const canAddPayment = computed(() => {
  const balanceDue = Number(invoice.value?.balanceDue ?? invoice.value?.balance_due ?? 0)
  return !!invoice.value?.id && balanceDue > 0 && ['issued', 'partial', 'overdue'].includes(normalizedStatus.value)
})

async function loadInvoice() {
  const invoiceId = String(route.params.id || '').trim()
  if (!invoiceId) {
    errorMessage.value = t('preschoolInvoiceDetailPage.messages.notFound')
    invoice.value = null
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPreschoolInvoice(invoiceId)
    if (!response) {
      invoice.value = null
      errorMessage.value = t('preschoolInvoiceDetailPage.messages.notFound')
      return
    }

    invoice.value = response
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolInvoiceDetailPage.messages.loadFailed')
    invoice.value = null
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'dashboard-preschool-admin-invoices' })
}

function onAddPayment() {
  if (!canAddPayment.value || !invoice.value?.id) return
  router.push({ name: 'dashboard-preschool-admin-payment', query: { invoiceId: invoice.value.id } })
}

async function reloadAfterAction(action) {
  actionLoading.value = true
  try {
    await action()
    await loadInvoice()
  } finally {
    actionLoading.value = false
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

async function onIssueInvoice() {
  if (!invoice.value?.id) return

  try {
    await reloadAfterAction(() => issuePreschoolInvoice(invoice.value.id))
    successMessage.value = t('preschoolPaymentManagementPage.messages.issueInvoiceSuccess')
    navigateAfterSuccess.value = false
    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveInvoiceFailed')
  }
}

async function onDeleteInvoice() {
  if (!invoice.value?.id) return

  actionLoading.value = true
  try {
    await deletePreschoolInvoice(invoice.value.id)
    successMessage.value = t('preschoolPaymentManagementPage.messages.deleteInvoiceSuccess')
    navigateAfterSuccess.value = true
    showSuccess.value = true
    deleteDialogOpen.value = false
    invoice.value = null
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveInvoiceFailed')
  } finally {
    actionLoading.value = false
  }
}

async function onCancelInvoice() {
  if (!invoice.value?.id) return

  try {
    await reloadAfterAction(() => cancelPreschoolInvoice(invoice.value.id))
    successMessage.value = t('preschoolPaymentManagementPage.messages.cancelInvoiceSuccess')
    navigateAfterSuccess.value = false
    showSuccess.value = true
    cancelDialogOpen.value = false
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveInvoiceFailed')
  }
}

async function onPrintInvoice() {
  if (!invoice.value?.id) return

  try {
    const html = await printPreschoolInvoice(invoice.value.id)
    if (!html) return

    const win = window.open('', '_blank')
    if (!win) {
      errorMessage.value = t('preschoolPaymentManagementPage.messages.exportFailed')
      return
    }

    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.exportFailed')
  }
}

async function onDownloadInvoice(format) {
  if (!invoice.value?.id) return

  exportLoading.value = true
  exportFormat.value = format

  try {
    const file = await downloadPreschoolInvoiceExport(invoice.value.id, format)
    if (file?.blob) {
      triggerDownload(file.blob, file.filename)
    }
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.exportFailed')
  } finally {
    exportLoading.value = false
    exportFormat.value = ''
  }
}

async function onGenerateReceipt(payment) {
  if (!payment?.id) return

  const receipt = await createPreschoolReceiptFromPayment(payment.id)
  if (receipt?.id) {
    router.push({ name: 'dashboard-preschool-admin-receipt-view', params: { id: receipt.id } })
  }
}

async function onPrintReceipt(receipt) {
  if (!receipt?.id) return

  try {
    const html = await printPreschoolReceipt(receipt.id)
    if (!html) return

    const win = window.open('', '_blank')
    if (!win) {
      errorMessage.value = t('preschoolPaymentManagementPage.messages.exportFailed')
      return
    }

    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.exportFailed')
  }
}

function onCloseSuccess() {
  showSuccess.value = false
  if (navigateAfterSuccess.value) {
    goBack()
  }
}

watch(() => route.params.id, loadInvoice)
onMounted(loadInvoice)
</script>

<template>
  <MainLayout>
    <section class="invoice-detail-page">
      <HeaderSection
        :title="t('preschoolInvoiceDetailPage.title')"
        :subtitle="t('preschoolInvoiceDetailPage.subtitle')"
      />

      <div class="invoice-detail-page__shell">
        <div class="invoice-detail-page__toolbar">
          <Button type="button" variant="ghost" rounded="xl" @click="goBack">
            {{ t('preschoolPaymentManagementPage.actions.back') }}
          </Button>
          <Button
            v-if="canAddPayment"
            type="button"
            variant="primary"
            rounded="xl"
            @click="onAddPayment"
          >
            {{ t('preschoolPaymentManagementPage.actions.addPayment') }}
          </Button>
          <Button
            v-if="canIssueInvoice"
            type="button"
            variant="secondary"
            rounded="xl"
            :disabled="actionLoading"
            @click="onIssueInvoice"
          >
            {{ t('preschoolPaymentManagementPage.actions.issueInvoice') }}
          </Button>
          <Button
            v-if="canDeleteInvoice"
            type="button"
            variant="danger"
            rounded="xl"
            :disabled="actionLoading"
            @click="deleteDialogOpen = true"
          >
            {{ t('common.delete') }}
          </Button>
          <Button
            v-if="canCancelInvoice"
            type="button"
            variant="danger"
            rounded="xl"
            :disabled="actionLoading"
            @click="cancelDialogOpen = true"
          >
            {{ t('preschoolPaymentManagementPage.actions.cancelInvoice') }}
          </Button>
          <Button type="button" variant="primary" rounded="xl" @click="onPrintInvoice">
            {{ t('preschoolPaymentManagementPage.actions.printInvoice') }}
          </Button>
          <Button
            type="button"
            variant="secondary"
            rounded="xl"
            :loading="exportLoading && exportFormat === 'pdf'"
            :disabled="exportLoading"
            @click="onDownloadInvoice('pdf')"
          >
            {{ t('preschoolPaymentManagementPage.actions.downloadPdf') }}
          </Button>
          <Button
            type="button"
            variant="secondary"
            rounded="xl"
            :loading="exportLoading && exportFormat === 'xlsx'"
            :disabled="exportLoading"
            @click="onDownloadInvoice('xlsx')"
          >
            {{ t('preschoolPaymentManagementPage.actions.downloadExcel') }}
          </Button>
        </div>

        <div v-if="loading" class="invoice-detail-page__state">
          {{ t('preschoolInvoiceDetailPage.messages.loading') }}
        </div>

        <div v-else-if="errorMessage" class="invoice-detail-page__state invoice-detail-page__state--error">
          {{ errorMessage }}
        </div>

        <template v-else-if="invoice">
          <div class="invoice-detail-page__hero">
            <div>
              <p class="invoice-detail-page__eyebrow">{{ t('preschoolPaymentManagementPage.actions.invoice') }}</p>
              <h2 class="invoice-detail-page__title">{{ invoice.invoiceNumber }}</h2>
              <p class="invoice-detail-page__meta">
                {{ invoice.studentName || '-' }} | {{ invoice.className || '-' }}
              </p>
            </div>
            <div class="invoice-detail-page__status" :data-status="invoice.status">
              {{ t(`preschoolPaymentManagementPage.invoiceStatus.${invoice.status}`) }}
            </div>
          </div>

          <div class="invoice-detail-page__summary">
            <article class="invoice-detail-page__card">
              <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.total') }}</span>
              <strong>{{ invoice.totalAmount.toFixed(2) }}</strong>
            </article>
            <article class="invoice-detail-page__card">
              <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.paid') }}</span>
              <strong>{{ invoice.paidAmount.toFixed(2) }}</strong>
            </article>
            <article class="invoice-detail-page__card">
              <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.balance') }}</span>
              <strong>{{ invoice.balanceDue.toFixed(2) }}</strong>
            </article>
            <article class="invoice-detail-page__card">
              <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.dueDate') }}</span>
              <strong>{{ formatDate(invoice.dueDate) || invoice.dueDate || '-' }}</strong>
            </article>
          </div>

          <div class="invoice-detail-page__grid">
            <section class="invoice-detail-page__panel">
              <h3>{{ t('preschoolInvoiceDetailPage.sections.information') }}</h3>
              <dl class="invoice-detail-page__info-list">
                <div>
                  <dt>{{ t('preschoolPaymentManagementPage.columns.student') }}</dt>
                  <dd>{{ invoice.studentName || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolPaymentManagementPage.columns.class') }}</dt>
                  <dd>{{ invoice.className || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolPaymentManagementPage.invoiceLabels.issueDate') }}</dt>
                  <dd>{{ formatDate(invoice.issueDate) || invoice.issueDate || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolPaymentManagementPage.invoiceLabels.dueDate') }}</dt>
                  <dd>{{ formatDate(invoice.dueDate) || invoice.dueDate || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolPaymentManagementPage.columns.status') }}</dt>
                  <dd>{{ t(`preschoolPaymentManagementPage.invoiceStatus.${invoice.status}`) }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolPaymentManagementPage.invoiceLabels.balance') }}</dt>
                  <dd>{{ invoice.balanceDue.toFixed(2) }}</dd>
                </div>
              </dl>
            </section>

            <section class="invoice-detail-page__panel">
              <h3>{{ t('preschoolPaymentManagementPage.invoiceSection.items') }}</h3>
              <template v-if="itemRows.length">
                <table class="invoice-detail-page__table">
                  <thead>
                    <tr>
                      <th>{{ t('preschoolPaymentManagementPage.invoiceLabels.description') }}</th>
                      <th>{{ t('preschoolPaymentManagementPage.invoiceLabels.quantity') }}</th>
                      <th>{{ t('preschoolPaymentManagementPage.invoiceLabels.unitPrice') }}</th>
                      <th>{{ t('preschoolPaymentManagementPage.invoiceLabels.amount') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in itemRows" :key="item.id">
                      <td>{{ item.description }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.unitPrice.toFixed(2) }}</td>
                      <td>{{ item.amount.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
              <div v-else class="invoice-detail-page__empty">
                {{ t('preschoolPaymentManagementPage.messages.noInvoiceHistory') }}
              </div>
            </section>

            <section class="invoice-detail-page__panel">
              <h3>{{ t('preschoolInvoiceDetailPage.sections.paymentSummary') }}</h3>
              <div v-if="paymentRows.length" class="invoice-detail-page__stack">
                <article v-for="payment in paymentRows" :key="payment.id" class="invoice-detail-page__entry">
                  <div class="invoice-detail-page__entry-copy">
                    <strong>{{ payment.paymentReference || '-' }}</strong>
                    <dl class="invoice-detail-page__inline-list">
                      <div>
                        <dt>{{ t('preschoolPaymentManagementPage.dialog.formLabels.paymentDate') }}</dt>
                        <dd>{{ formatDate(payment.paidAt) || payment.paidAt || '-' }}</dd>
                      </div>
                      <div>
                        <dt>{{ t('preschoolPaymentManagementPage.dialog.formLabels.paymentMethod') }}</dt>
                        <dd>{{ payment.paymentMethod || '-' }}</dd>
                      </div>
                      <div>
                        <dt>{{ t('preschoolPaymentManagementPage.dialog.formLabels.amount') }}</dt>
                        <dd>{{ payment.amount.toFixed(2) }}</dd>
                      </div>
                      <div>
                        <dt>{{ t('preschoolPaymentManagementPage.receiptLabels.number') }}</dt>
                        <dd>
                          <template v-if="payment.linkedReceipts.length">
                            {{ payment.linkedReceipts.map((receipt) => receipt.receiptNumber).join(', ') }}
                          </template>
                          <template v-else>-</template>
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div class="invoice-detail-page__entry-actions">
                    <Button
                      v-for="receipt in payment.linkedReceipts"
                      :key="`payment-${payment.id}-receipt-${receipt.id}`"
                      type="button"
                      size="sm"
                      variant="secondary"
                      rounded="xl"
                      @click="router.push({ name: 'dashboard-preschool-admin-receipt-view', params: { id: receipt.id } })"
                    >
                      {{ t('preschoolPaymentManagementPage.actions.viewReceipt') }}
                    </Button>
                    <Button
                      v-if="!payment.linkedReceipts.length"
                      type="button"
                      size="sm"
                      variant="secondary"
                      rounded="xl"
                      :disabled="String(payment.paymentStatus || '').trim().toLowerCase() !== 'paid'"
                      @click="onGenerateReceipt(payment)"
                    >
                      {{ t('preschoolPaymentManagementPage.actions.generateReceipt') }}
                    </Button>
                  </div>
                </article>
              </div>
              <div v-else class="invoice-detail-page__empty">
                {{ t('preschoolPaymentManagementPage.messages.noPaymentHistory') }}
              </div>
            </section>

            <section class="invoice-detail-page__panel invoice-detail-page__panel--wide">
              <h3>{{ t('preschoolInvoiceDetailPage.sections.receiptSummary') }}</h3>
              <div v-if="receiptRows.length" class="invoice-detail-page__stack">
                <article v-for="receipt in receiptRows" :key="receipt.id" class="invoice-detail-page__entry">
                  <div class="invoice-detail-page__entry-copy">
                    <strong>{{ receipt.receiptNumber }}</strong>
                    <dl class="invoice-detail-page__inline-list">
                      <div>
                        <dt>{{ t('preschoolPaymentManagementPage.receiptLabels.issuedAt') }}</dt>
                        <dd>{{ formatDate(receipt.issuedAt) || receipt.issuedAt || '-' }}</dd>
                      </div>
                      <div>
                        <dt>{{ t('preschoolPaymentManagementPage.dialog.formLabels.amount') }}</dt>
                        <dd>{{ receipt.amount.toFixed(2) }}</dd>
                      </div>
                    </dl>
                  </div>
                  <div class="invoice-detail-page__entry-actions">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      rounded="xl"
                      @click="router.push({ name: 'dashboard-preschool-admin-receipt-view', params: { id: receipt.id } })"
                    >
                      {{ t('preschoolPaymentManagementPage.actions.viewReceipt') }}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      rounded="xl"
                      @click="onPrintReceipt(receipt)"
                    >
                      {{ t('preschoolPaymentManagementPage.actions.printReceipt') }}
                    </Button>
                  </div>
                </article>
              </div>
              <div v-else class="invoice-detail-page__empty">
                {{ t('preschoolPaymentManagementPage.messages.noReceiptHistory') }}
              </div>
            </section>
          </div>
        </template>
      </div>
    </section>

    <AlertSuccess
      :show="showSuccess"
      :title="t('preschoolPaymentManagementPage.alerts.successTitle')"
      :message="successMessage"
      :button-text="t('preschoolPaymentManagementPage.alerts.close')"
      @close="onCloseSuccess"
    />

    <AlertQuestion
      :show="deleteDialogOpen"
      :title="t('preschoolPaymentManagementPage.alerts.deleteTitle')"
      :message="t('preschoolPaymentManagementPage.alerts.deleteMessage', { name: invoice?.invoiceNumber || t('preschoolPaymentManagementPage.alerts.deleteFallback') })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onDeleteInvoice"
      @cancel="deleteDialogOpen = false"
    />

    <AlertQuestion
      :show="cancelDialogOpen"
      :title="t('preschoolPaymentManagementPage.actions.cancelInvoice')"
      :message="t('preschoolPaymentManagementPage.alerts.cancelInvoiceMessage', { name: invoice?.invoiceNumber || t('preschoolPaymentManagementPage.alerts.deleteFallback') })"
      :confirm-text="t('preschoolPaymentManagementPage.actions.cancelInvoice')"
      :cancel-text="t('common.cancel')"
      type="warning"
      @confirm="onCancelInvoice"
      @cancel="cancelDialogOpen = false"
    />
  </MainLayout>
</template>

<style scoped>
.invoice-detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.invoice-detail-page__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #dce6f2;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.99) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.invoice-detail-page__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.invoice-detail-page__state {
  padding: 3rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  background: #fff;
}

.invoice-detail-page__state--error {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fff1f2;
}

.invoice-detail-page__hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #0f2e63 0%, #12356f 45%, #0f2a58 100%);
  color: #fff;
}

.invoice-detail-page__eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  color: #93c5fd;
}

.invoice-detail-page__title {
  margin: 0.25rem 0 0;
  font-size: 1.7rem;
}

.invoice-detail-page__meta {
  margin: 0.3rem 0 0;
  color: #dbeafe;
}

.invoice-detail-page__status {
  align-self: flex-start;
  padding: 0.5rem 0.8rem;
  border-radius: 9999px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(255,255,255,0.15);
}

.invoice-detail-page__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.invoice-detail-page__card {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.invoice-detail-page__card span {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.invoice-detail-page__card strong {
  font-size: 1.3rem;
  color: #0f172a;
}

.invoice-detail-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.invoice-detail-page__panel {
  border: 1px solid #dbe3ef;
  border-radius: 1rem;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.invoice-detail-page__panel--wide {
  grid-column: 1 / -1;
}

.invoice-detail-page__panel h3 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: #0f172a;
}

.invoice-detail-page__info-list,
.invoice-detail-page__inline-list {
  display: grid;
  gap: 0.75rem;
}

.invoice-detail-page__info-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.invoice-detail-page__info-list div,
.invoice-detail-page__inline-list div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.invoice-detail-page__info-list dt,
.invoice-detail-page__inline-list dt {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #64748b;
}

.invoice-detail-page__info-list dd,
.invoice-detail-page__inline-list dd {
  margin: 0;
  color: #0f172a;
}

.invoice-detail-page__table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-detail-page__table th,
.invoice-detail-page__table td {
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.invoice-detail-page__stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.invoice-detail-page__entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.95rem;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
}

.invoice-detail-page__entry-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
}

.invoice-detail-page__entry-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.invoice-detail-page__empty {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  background: #f8fafc;
}

@media (max-width: 1024px) {
  .invoice-detail-page__summary,
  .invoice-detail-page__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .invoice-detail-page__hero,
  .invoice-detail-page__entry {
    flex-direction: column;
    align-items: flex-start;
  }

  .invoice-detail-page__summary,
  .invoice-detail-page__grid,
  .invoice-detail-page__info-list {
    grid-template-columns: 1fr;
  }
}
</style>
