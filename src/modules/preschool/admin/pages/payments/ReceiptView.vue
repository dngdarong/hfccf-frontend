<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'
import { fetchPreschoolReceipt, printPreschoolReceipt } from '@/modules/preschool/services/api/preschoolPaymentApi'

defineOptions({
  name: 'PreschoolAdminReceiptViewPage',
})

const { t } = useLanguage()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const receipt = ref(null)

async function loadReceipt() {
  const receiptId = String(route.params.id || '').trim()
  if (!receiptId) {
    errorMessage.value = t('preschoolReceiptViewPage.messages.notFound')
    receipt.value = null
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchPreschoolReceipt(receiptId)
    if (!response) {
      receipt.value = null
      errorMessage.value = t('preschoolReceiptViewPage.messages.notFound')
      return
    }

    receipt.value = response
  } catch (error) {
    receipt.value = null
    errorMessage.value = error?.message || t('preschoolReceiptViewPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (receipt.value?.invoiceId) {
    router.push({ name: 'dashboard-preschool-admin-invoice-detail', params: { id: receipt.value.invoiceId } })
    return
  }
  router.push({ name: 'dashboard-preschool-admin-payment' })
}

async function onPrintReceipt() {
  if (!receipt.value?.id) return
  const html = await printPreschoolReceipt(receipt.value.id)
  if (!html) return
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (win) {
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.focus()
  }
}

watch(() => route.params.id, loadReceipt)
onMounted(loadReceipt)
</script>

<template>
  <MainLayout>
    <section class="receipt-view-page">
      <HeaderSection
        :title="t('preschoolReceiptViewPage.title')"
        :subtitle="t('preschoolReceiptViewPage.subtitle')"
      />

      <div class="receipt-view-page__shell">
        <div class="receipt-view-page__toolbar">
          <Button type="button" variant="ghost" rounded="xl" @click="goBack">
            {{ t('preschoolPaymentManagementPage.actions.back') }}
          </Button>
          <Button type="button" variant="primary" rounded="xl" @click="onPrintReceipt">
            {{ t('preschoolPaymentManagementPage.actions.printReceipt') }}
          </Button>
        </div>

        <div v-if="loading" class="receipt-view-page__state">
          {{ t('preschoolReceiptViewPage.messages.loading') }}
        </div>

        <div v-else-if="errorMessage" class="receipt-view-page__state receipt-view-page__state--error">
          {{ errorMessage }}
        </div>

        <template v-else-if="receipt">
          <div class="receipt-view-page__hero">
            <div>
              <p class="receipt-view-page__eyebrow">{{ t('preschoolPaymentManagementPage.actions.receipt') }}</p>
              <h2 class="receipt-view-page__title">{{ receipt.receiptNumber }}</h2>
              <p class="receipt-view-page__meta">
                {{ receipt.studentName || '-' }} | {{ receipt.invoiceNumber || '-' }}
              </p>
            </div>
            <div class="receipt-view-page__amount">
              {{ receipt.amount.toFixed(2) }}
            </div>
          </div>

          <div class="receipt-view-page__grid">
            <article class="receipt-view-page__card">
              <span>{{ t('preschoolPaymentManagementPage.receiptLabels.issuedAt') }}</span>
              <strong>{{ formatDate(receipt.issuedAt) || receipt.issuedAt || '-' }}</strong>
            </article>
            <article class="receipt-view-page__card">
              <span>{{ t('preschoolPaymentManagementPage.receiptLabels.paymentMethod') }}</span>
              <strong>{{ receipt.paymentMethod || '-' }}</strong>
            </article>
            <article class="receipt-view-page__card">
              <span>{{ t('preschoolPaymentManagementPage.receiptLabels.paymentReference') }}</span>
              <strong>{{ receipt.paymentReference || '-' }}</strong>
            </article>
            <article class="receipt-view-page__card">
              <span>{{ t('preschoolPaymentManagementPage.receiptLabels.issuedBy') }}</span>
              <strong>{{ receipt.issuedBy || '-' }}</strong>
            </article>
          </div>

          <div class="receipt-view-page__note">
            <h3>{{ t('preschoolPaymentManagementPage.receiptLabels.notes') }}</h3>
            <p>{{ receipt.notes || '-' }}</p>
          </div>
        </template>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.receipt-view-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.receipt-view-page__shell {
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

.receipt-view-page__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.receipt-view-page__state {
  padding: 3rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  background: #fff;
}

.receipt-view-page__state--error {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fff1f2;
}

.receipt-view-page__hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.2rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, #0f2e63 0%, #12356f 45%, #0f2a58 100%);
  color: #fff;
}

.receipt-view-page__eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  color: #93c5fd;
}

.receipt-view-page__title {
  margin: 0.25rem 0 0;
  font-size: 1.7rem;
}

.receipt-view-page__meta {
  margin: 0.3rem 0 0;
  color: #dbeafe;
}

.receipt-view-page__amount {
  align-self: flex-start;
  padding: 0.8rem 1rem;
  border-radius: 9999px;
  font-size: 1.2rem;
  font-weight: 900;
  background: rgba(255,255,255,0.15);
}

.receipt-view-page__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.receipt-view-page__card,
.receipt-view-page__note {
  padding: 1rem;
  border: 1px solid #dbe3ef;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.receipt-view-page__card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.receipt-view-page__card span {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #64748b;
}

.receipt-view-page__card strong {
  font-size: 1rem;
  color: #0f172a;
}

.receipt-view-page__note h3 {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
}

.receipt-view-page__note p {
  margin: 0;
  color: #0f172a;
}

@media (max-width: 1024px) {
  .receipt-view-page__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .receipt-view-page__hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .receipt-view-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
