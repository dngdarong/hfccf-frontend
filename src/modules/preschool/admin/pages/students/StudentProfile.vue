<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'
import { getAvatarInitials, resolveAvatarSource } from '@/utils/avatar'
import { fetchPreschoolStudent } from '@/modules/preschool/services/preschoolApi'
import { fetchPreschoolStudentPaymentSummary } from '@/modules/preschool/services/api/preschoolPaymentApi'
import { fetchStudentHealthSummary } from '@/modules/preschool/services/api/preschoolHealthApi'
import { fetchStudentGuardianCommunications } from '@/modules/preschool/services/api/preschoolGuardianCommunicationApi'
import { BACK_ROUTE_NAME } from './constants/studentProfileConstants'
import { buildInfoCards, getStatusLabel, getStatusClass, getStudentDisplayName } from './utils/studentProfileHelpers'
import GuardianCommunicationTimeline from '@/modules/preschool/admin/components/guardian/GuardianCommunicationTimeline.vue'

defineOptions({
  name: 'PreschoolAdminStudentProfilePage',
})

const { t } = useLanguage()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const errorMessage = ref('')
const student = ref(null)
const healthSummary = ref(null)
const paymentSummary = ref(null)
const communicationTimeline = ref(null)

const profileClasses = computed(() => student.value?.classes || [])
const avatarSrc = computed(() => resolveAvatarSource(student.value?.avatarUrl || ''))
const initials = computed(() => getAvatarInitials(getStudentDisplayName(student.value), '?'))

const statusLabel = computed(() => getStatusLabel(t, student.value))

const infoCards = computed(() => buildInfoCards(t, student.value, profileClasses.value))

async function loadStudent() {
  const studentId = String(route.params.id || '').trim()
  if (!studentId) {
    errorMessage.value = t('preschoolStudentProfilePage.messages.notFound')
    student.value = null
    paymentSummary.value = null
    communicationTimeline.value = null
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const [response, healthResponse, paymentResponse, communications] = await Promise.all([
      fetchPreschoolStudent(studentId),
      fetchStudentHealthSummary(studentId).catch(() => null),
      fetchPreschoolStudentPaymentSummary(studentId).catch(() => null),
      fetchStudentGuardianCommunications(studentId, { perPage: 5 }).catch(() => null),
    ])
    if (!response) {
      student.value = null
      paymentSummary.value = null
      communicationTimeline.value = null
      errorMessage.value = t('preschoolStudentProfilePage.messages.notFound')
      return
    }

    student.value = response
    healthSummary.value = healthResponse
    paymentSummary.value = paymentResponse
    communicationTimeline.value = communications
  } catch (error) {
    student.value = null
    paymentSummary.value = null
    communicationTimeline.value = null
    errorMessage.value = error?.message || t('preschoolStudentProfilePage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: BACK_ROUTE_NAME })
}

function goToHealthRecords() {
  const studentId = String(route.params.id || '').trim()
  if (!studentId) return
  router.push({ name: 'dashboard-preschool-admin-health-student', params: { id: studentId } })
}

function goToPayments() {
  const studentId = String(route.params.id || '').trim()
  if (!studentId) return
  router.push({ name: 'dashboard-preschool-admin-payment', query: { studentId } })
}

function goToCommunications() {
  const studentId = String(route.params.id || '').trim()
  if (!studentId) return
  router.push({ name: 'dashboard-preschool-admin-guardian-communications', query: { studentId } })
}

watch(() => route.params.id, () => {
  loadStudent()
})

onMounted(loadStudent)
</script>

<template>
  <MainLayout>
    <section class="student-profile-page">
      <HeaderSection
        :title="t('preschoolStudentProfilePage.title')"
        :subtitle="t('preschoolStudentProfilePage.subtitle')"
      />

      <div class="student-profile-page__shell">
        <div class="student-profile-page__toolbar">
          <Button type="button" variant="ghost" rounded="xl" @click="goBack">
            {{ t('preschoolStudentProfilePage.actions.back') }}
          </Button>
          <Button type="button" variant="secondary" rounded="xl" @click="goToHealthRecords">
            {{ t('preschoolStudentProfilePage.actions.health') }}
          </Button>
          <Button type="button" variant="secondary" rounded="xl" @click="goToCommunications">
            {{ t('preschoolGuardianCommunicationPage.title') }}
          </Button>
        </div>

        <div v-if="loading" class="student-profile-page__state">
          {{ t('preschoolStudentProfilePage.messages.loading') }}
        </div>

        <div v-else-if="errorMessage" class="student-profile-page__state student-profile-page__state--error">
          {{ errorMessage }}
        </div>

        <template v-else-if="student">
          <div class="student-profile-page__hero">
            <div class="student-profile-page__avatar-wrap">
              <div class="student-profile-page__avatar">
                <img v-if="avatarSrc" :src="avatarSrc" :alt="student.fullName || student.name || 'Student avatar'" class="student-profile-page__avatar-img" />
                <span v-else class="student-profile-page__avatar-initials">{{ initials }}</span>
              </div>
            </div>

            <div class="student-profile-page__hero-content">
              <div class="student-profile-page__hero-row">
                <div>
                  <p class="student-profile-page__eyebrow">{{ t('preschoolStudentProfilePage.hero.eyebrow') }}</p>
                  <h2 class="student-profile-page__name">{{ student.fullName || student.name || '-' }}</h2>
                  <p class="student-profile-page__code">
                    {{ student.publicId || student.studentCode || '-' }}
                  </p>
                </div>
                <span class="student-profile-page__status" :class="getStatusClass(student.status)">
                  {{ statusLabel }}
                </span>
              </div>

              <p class="student-profile-page__summary">
                {{ t('preschoolStudentProfilePage.hero.summary') }}
              </p>
            </div>
          </div>

          <div class="student-profile-page__cards">
            <article v-for="card in infoCards" :key="card.key" class="student-profile-page__card">
              <p class="student-profile-page__card-label">{{ card.label }}</p>
              <p class="student-profile-page__card-value">{{ card.value }}</p>
            </article>
          </div>

          <div v-if="healthSummary" class="student-profile-page__health">
            <div class="student-profile-page__health-header">
              <div>
                <p class="student-profile-page__panel-eyebrow">{{ t('preschoolHealthPage.profile.medicalProfile') }}</p>
                <h3 class="student-profile-page__panel-title">{{ t('preschoolHealthPage.dashboard.summaryTitle') }}</h3>
              </div>
              <Button type="button" variant="secondary" size="sm" rounded="xl" @click="goToHealthRecords">
                {{ t('preschoolStudentProfilePage.actions.health') }}
              </Button>
            </div>
            <div class="student-profile-page__health-grid">
              <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.allergies') }}: {{ healthSummary.counts.allergies }}</div>
              <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.vaccinations') }}: {{ healthSummary.counts.vaccinations }}</div>
              <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.medications') }}: {{ healthSummary.counts.medications }}</div>
              <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.incidents') }}: {{ healthSummary.counts.incidents }}</div>
              <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.contacts') }}: {{ healthSummary.counts.emergencyContacts }}</div>
              <div class="student-profile-page__health-chip">{{ t('preschoolHealthPage.summary.checks') }}: {{ healthSummary.counts.healthChecks }}</div>
            </div>
          </div>

          <div v-if="paymentSummary" class="student-profile-page__payments">
            <div class="student-profile-page__health-header">
              <div>
                <p class="student-profile-page__panel-eyebrow">{{ t('preschoolStudentProfilePage.actions.paymentSummary') }}</p>
                <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.paymentSummary.title') }}</h3>
              </div>
              <Button type="button" variant="secondary" size="sm" rounded="xl" @click="goToPayments">
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

          <div v-if="communicationTimeline" class="student-profile-page__communications">
            <GuardianCommunicationTimeline
              compact
              :title="t('preschoolGuardianCommunicationPage.timelineTitle')"
              :subtitle="t('preschoolGuardianCommunicationPage.timelineSubtitle')"
              :communications="communicationTimeline.items || []"
              :summary="communicationTimeline.summary || {}"
              :empty-text="t('preschoolGuardianCommunicationPage.messages.noCommunicationYet')"
            />
          </div>

          <div class="student-profile-page__content-grid">
            <section class="student-profile-page__panel">
              <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.personal') }}</h3>
              <dl class="student-profile-page__details">
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.signature') }}</dt>
                  <dd>{{ student.publicId || student.studentCode || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.gender') }}</dt>
                  <dd>{{ student.gender ? t(`preschoolStudentInfoPage.options.${student.gender}`) : '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.dateOfBirth') }}</dt>
                  <dd>{{ formatDate(student.dateOfBirth) || student.dateOfBirth || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.address') }}</dt>
                  <dd>{{ student.address || '-' }}</dd>
                </div>
              </dl>
            </section>

            <section class="student-profile-page__panel">
              <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.guardian') }}</h3>
              <dl class="student-profile-page__details">
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.guardianName') }}</dt>
                  <dd>{{ student.guardianName || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.guardianPhone') }}</dt>
                  <dd>{{ student.guardianPhone || '-' }}</dd>
                </div>
              </dl>
            </section>

            <section class="student-profile-page__panel student-profile-page__panel--wide">
              <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.enrollment') }}</h3>
              <div v-if="profileClasses.length" class="student-profile-page__class-list">
                <div v-for="classItem in profileClasses" :key="classItem.id" class="student-profile-page__class-chip">
                  <p class="student-profile-page__class-name">{{ classItem.name || classItem.code || '-' }}</p>
                  <p class="student-profile-page__class-meta">{{ classItem.level || classItem.code || '-' }}</p>
                </div>
              </div>
              <div v-else class="student-profile-page__empty-inline">
                {{ t('preschoolStudentProfilePage.messages.noClasses') }}
              </div>
            </section>

            <section class="student-profile-page__panel student-profile-page__panel--wide">
              <h3 class="student-profile-page__panel-title">{{ t('preschoolStudentProfilePage.sections.record') }}</h3>
              <dl class="student-profile-page__details student-profile-page__details--four">
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.status') }}</dt>
                  <dd>{{ statusLabel }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.createdAt') }}</dt>
                  <dd>{{ formatDate(student.createdAt) || student.createdAt || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.updatedAt') }}</dt>
                  <dd>{{ formatDate(student.updatedAt) || student.updatedAt || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ t('preschoolStudentProfilePage.fields.classesCount') }}</dt>
                  <dd>{{ student.classesCount || profileClasses.length || 0 }}</dd>
                </div>
              </dl>
            </section>
          </div>
        </template>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.student-profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.student-profile-page__shell {
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

.student-profile-page__toolbar {
  display: flex;
  justify-content: flex-end;
}

.student-profile-page__state {
  padding: 3rem 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 1rem;
  background: #fff;
}

.student-profile-page__state--error {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fff1f2;
}

.student-profile-page__hero {
  display: flex;
  gap: 1.2rem;
  align-items: center;
  padding: 1.2rem;
  border-radius: 1.4rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(135deg, #0f2e63 0%, #12356f 45%, #0f2a58 100%);
  color: #fff;
}

.student-profile-page__avatar-wrap {
  flex-shrink: 0;
}

.student-profile-page__avatar {
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 9999px;
  overflow: hidden;
  background: linear-gradient(135deg, #c4b5fd, #7c3aed);
  border: 4px solid rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 18px 30px -18px rgba(15, 23, 42, 0.5);
}

.student-profile-page__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-profile-page__avatar-initials {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.student-profile-page__hero-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.student-profile-page__hero-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.student-profile-page__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #93c5fd;
}

.student-profile-page__name {
  margin: 0.3rem 0 0;
  font-size: clamp(1.5rem, 2.2vw, 2.1rem);
  line-height: 1.1;
  font-weight: 800;
}

.student-profile-page__code {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #bfdbfe;
}

.student-profile-page__summary {
  margin: 0;
  max-width: 62rem;
  font-size: 0.95rem;
  color: #dbeafe;
}

.student-profile-page__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  padding: 0.5rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.student-profile-page__cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.student-profile-page__health {
  border-radius: 1.25rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
  padding: 1rem 1.05rem 1.1rem;
}

.student-profile-page__communications {
  border-radius: 1.25rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
  padding: 1rem 1.05rem 1.1rem;
}

.student-profile-page__health-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.student-profile-page__panel-eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7c3aed;
}

.student-profile-page__health-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.student-profile-page__health-chip {
  padding: 0.75rem 0.9rem;
  border-radius: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
}

.student-profile-page__card,
.student-profile-page__panel {
  border-radius: 1.25rem;
  border: 1px solid #dbe3ef;
  background: #fff;
  box-shadow: 0 16px 32px -26px rgba(15, 23, 42, 0.45);
}

.student-profile-page__card {
  padding: 1rem 1.05rem;
}

.student-profile-page__card-label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.student-profile-page__card-value {
  margin: 0.35rem 0 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.student-profile-page__content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.student-profile-page__panel {
  padding: 1rem 1.05rem 1.1rem;
}

.student-profile-page__panel--wide {
  grid-column: 1 / -1;
}

.student-profile-page__panel-title {
  margin: 0 0 0.9rem;
  font-size: 0.92rem;
  font-weight: 800;
  color: #0f172a;
}

.student-profile-page__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem 1rem;
}

.student-profile-page__details--four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.student-profile-page__details dt {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #94a3b8;
}

.student-profile-page__details dd {
  margin: 0.3rem 0 0;
  font-size: 0.98rem;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
}

.student-profile-page__class-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.student-profile-page__class-chip {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  padding: 0.9rem 1rem;
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
}

.student-profile-page__class-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.student-profile-page__class-meta {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.student-profile-page__empty-inline {
  padding: 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  font-size: 0.875rem;
  color: #64748b;
}

@media (max-width: 1024px) {
  .student-profile-page__cards,
  .student-profile-page__content-grid,
  .student-profile-page__details--four,
  .student-profile-page__class-list,
  .student-profile-page__health-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .student-profile-page__hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .student-profile-page__hero-row {
    flex-direction: column;
  }

  .student-profile-page__cards,
  .student-profile-page__content-grid,
  .student-profile-page__details,
  .student-profile-page__details--four,
  .student-profile-page__class-list,
  .student-profile-page__health-grid {
    grid-template-columns: 1fr;
  }
}
</style>
