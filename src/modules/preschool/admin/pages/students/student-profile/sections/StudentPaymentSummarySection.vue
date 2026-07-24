<script setup>
import Button from '@/components/buttons/Button.vue'
import { formatDate } from '@/utils/date'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'StudentPaymentSummarySection',
})

defineProps({
  paymentSummary: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['open-payments'])
const { t } = useLanguage()
</script>

<template>
  <div v-if="paymentSummary" class="student-profile-page__payments">
    <div class="student-profile-page__health-header">
      <div>
        <p class="student-profile-page__panel-eyebrow">{{ t('preschoolStudentProfilePage.actions.paymentSummary') }}</p>
        <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.paymentSummary.title') }}</h3>
      </div>
      <Button type="button" variant="secondary" size="sm" rounded="xl" @click="emit('open-payments')">
        {{ t('preschoolStudentProfilePage.actions.paymentSummary') }}
      </Button>
    </div>

    <div class="student-profile-page__payments-grid">
      <div class="student-profile-page__payment-chip">
        <span>{{ t('preschoolStudentProfilePage.paymentSummary.outstandingBalance') }}</span>
        <strong>${{ Number(paymentSummary.summary?.outstandingBalance || 0).toFixed(2) }}</strong>
      </div>
      <div class="student-profile-page__payment-chip">
        <span>{{ t('preschoolStudentProfilePage.paymentSummary.totalBilled') }}</span>
        <strong>${{ Number(paymentSummary.summary?.totalBilled || 0).toFixed(2) }}</strong>
      </div>
      <div class="student-profile-page__payment-chip">
        <span>{{ t('preschoolStudentProfilePage.paymentSummary.totalPaid') }}</span>
        <strong>${{ Number(paymentSummary.summary?.totalPaid || 0).toFixed(2) }}</strong>
      </div>
    </div>

    <div class="student-profile-page__payment-columns">
      <div class="student-profile-page__payment-column">
        <h4>{{ t('preschoolStudentProfilePage.paymentSummary.invoices') }}</h4>
        <div v-if="paymentSummary.recentInvoices?.length" class="student-profile-page__payment-list">
          <article v-for="invoice in paymentSummary.recentInvoices" :key="invoice.id" class="student-profile-page__payment-card">
            <div>
              <p class="student-profile-page__payment-card-title">{{ invoice.invoiceNumber || invoice.number || '-' }}</p>
              <p class="student-profile-page__payment-card-meta">{{ invoice.status || '-' }} · {{ formatDate(invoice.issueDate) || invoice.issueDate || '-' }}</p>
            </div>
            <strong>${{ Number(invoice.balanceDue || 0).toFixed(2) }}</strong>
          </article>
        </div>
        <div v-else class="student-profile-page__empty-inline">
          {{ t('preschoolStudentProfilePage.paymentSummary.noInvoices') }}
        </div>
      </div>

      <div class="student-profile-page__payment-column">
        <h4>{{ t('preschoolStudentProfilePage.paymentSummary.receipts') }}</h4>
        <div v-if="paymentSummary.recentReceipts?.length" class="student-profile-page__payment-list">
          <article v-for="receipt in paymentSummary.recentReceipts" :key="receipt.id" class="student-profile-page__payment-card">
            <div>
              <p class="student-profile-page__payment-card-title">{{ receipt.receiptNumber || receipt.number || '-' }}</p>
              <p class="student-profile-page__payment-card-meta">{{ receipt.paymentMethod || '-' }} · {{ formatDate(receipt.issuedAt) || receipt.issuedAt || '-' }}</p>
            </div>
            <strong>${{ Number(receipt.amount || 0).toFixed(2) }}</strong>
          </article>
        </div>
        <div v-else class="student-profile-page__empty-inline">
          {{ t('preschoolStudentProfilePage.paymentSummary.noReceipts') }}
        </div>
      </div>
    </div>
  </div>
</template>
