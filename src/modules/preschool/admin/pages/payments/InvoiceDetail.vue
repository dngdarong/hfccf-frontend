<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'
import { createPreschoolReceiptFromPayment, fetchPreschoolInvoice, issuePreschoolInvoice, deletePreschoolInvoice, cancelPreschoolInvoice, printPreschoolInvoice } from '@/modules/preschool/services/api/preschoolPaymentApi'

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
const showSuccess = ref(false)
const successMessage = ref('')

const itemRows = computed(() => invoice.value?.items || [])
const paymentRows = computed(() => invoice.value?.payments || [])
const receiptRows = computed(() => invoice.value?.receipts || [])

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
  router.push({ name: 'dashboard-preschool-admin-payment' })
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

async function onIssueInvoice() {
  if (!invoice.value?.id) return
  await reloadAfterAction(() => issuePreschoolInvoice(invoice.value.id))
}

async function onDeleteInvoice() {
  if (!invoice.value?.id) return
  actionLoading.value = true
  try {
    await deletePreschoolInvoice(invoice.value.id)
    successMessage.value = t('preschoolPaymentManagementPage.messages.deleteInvoiceSuccess')
    showSuccess.value = true
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolPaymentManagementPage.messages.saveInvoiceFailed')
  } finally {
    actionLoading.value = false
  }
}

async function onCancelInvoice() {
  if (!invoice.value?.id) return
  await reloadAfterAction(() => cancelPreschoolInvoice(invoice.value.id))
}

async function onPrintInvoice() {
  if (!invoice.value?.id) return
  const html = await printPreschoolInvoice(invoice.value.id)
  if (!html) return
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (win) {
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
  }
}

async function onGenerateReceipt(payment) {
  if (!payment?.id) return
  const receipt = await createPreschoolReceiptFromPayment(payment.id)
  if (receipt?.id) {
    router.push({ name: 'dashboard-preschool-admin-receipt-view', params: { id: receipt.id } })
  }
}

function onCloseSuccess() {
  showSuccess.value = false
  goBack()
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
            type="button"
            variant="secondary"
            rounded="xl"
            :disabled="actionLoading || !invoice || invoice.status !== 'draft'"
            @click="onIssueInvoice"
          >
            {{ t('preschoolPaymentManagementPage.actions.issueInvoice') }}
          </Button>
          <Button
            type="button"
            variant="danger"
            rounded="xl"
            :disabled="actionLoading || !invoice || invoice.status === 'cancelled'"
            @click="invoice?.status === 'draft' ? onDeleteInvoice() : onCancelInvoice()"
          >
            {{ invoice?.status === 'draft' ? t('common.delete') : t('preschoolPaymentManagementPage.actions.cancelInvoice') }}
          </Button>
          <Button type="button" variant="primary" rounded="xl" @click="onPrintInvoice">
            {{ t('preschoolPaymentManagementPage.actions.printInvoice') }}
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
              <span>{{ t('preschoolPaymentManagementPage.invoiceLabels.issueDate') }}</span>
              <strong>{{ formatDate(invoice.issueDate) || invoice.issueDate || '-' }}</strong>
            </article>
          </div>

          <div class="invoice-detail-page__grid">
            <section class="invoice-detail-page__panel">
              <h3>{{ t('preschoolPaymentManagementPage.invoiceSection.items') }}</h3>
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
            </section>

            <section class="invoice-detail-page__panel">
              <h3>{{ t('preschoolPaymentManagementPage.invoiceSection.payments') }}</h3>
              <div v-if="paymentRows.length" class="invoice-detail-page__stack">
                <article v-for="payment in paymentRows" :key="payment.id" class="invoice-detail-page__entry">
                  <div>
                    <strong>{{ payment.paymentReference }}</strong>
                    <p>{{ payment.amount.toFixed(2) }} | {{ payment.paymentStatus }}</p>
                  </div>
                  <div class="invoice-detail-page__entry-actions">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      rounded="xl"
                      :disabled="payment.receiptCount > 0"
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
              <h3>{{ t('preschoolPaymentManagementPage.invoiceSection.receipts') }}</h3>
              <div v-if="receiptRows.length" class="invoice-detail-page__stack">
                <article v-for="receipt in receiptRows" :key="receipt.id" class="invoice-detail-page__entry">
                  <div>
                    <strong>{{ receipt.receiptNumber }}</strong>
                    <p>{{ formatDate(receipt.issuedAt) || receipt.issuedAt || '-' }} | {{ receipt.amount.toFixed(2) }}</p>
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

.invoice-detail-page__entry p {
  margin: 0.25rem 0 0;
  color: #64748b;
}

.invoice-detail-page__entry-actions {
  display: flex;
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
  .invoice-detail-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
