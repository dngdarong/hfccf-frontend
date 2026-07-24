<script setup>
import { computed, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import AttendanceReportPanel from './components/AttendanceReportPanel.vue'
import StudentSummaryReportPanel from './components/StudentSummaryReportPanel.vue'

defineOptions({ name: 'PreschoolReportsDashboardPage' })

const { t } = useLanguage()

const selectedReport = ref(null)

const REPORT_TYPES = [
  {
    key: 'attendance',
    icon: 'pi-calendar-check',
    accent: 'card--emerald',
  },
  {
    key: 'student-summary',
    icon: 'pi-user-check',
    accent: 'card--blue',
  },
]

const reportTypeOptions = computed(() =>
  REPORT_TYPES.map(type => ({
    ...type,
    label: t(`preschoolReportsPage.reportTypes.${type.key}`) || type.key,
    description: t(`preschoolReportsPage.reportTypeDesc.${type.key}`) || '',
  })),
)

function selectReport(reportKey) {
  selectedReport.value = selectedReport.value === reportKey ? null : reportKey
}
</script>

<template>
  <MainLayout>
    <section class="space-y-5">
      <HeaderSection
        :title="t('preschoolReportsPage.title')"
        :subtitle="t('preschoolReportsPage.subtitle')"
      />

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <button
          v-for="reportType in reportTypeOptions"
          :key="reportType.key"
          type="button"
          class="report-card"
          :class="[reportType.accent, { 'report-card--active': selectedReport === reportType.key }]"
          @click="selectReport(reportType.key)"
        >
          <div class="report-card__icon-wrap">
            <i :class="['pi', reportType.icon]" aria-hidden="true" />
          </div>
          <div class="report-card__body">
            <h3 class="report-card__title">{{ reportType.label }}</h3>
            <p class="report-card__desc">{{ reportType.description }}</p>
          </div>
          <i class="pi pi-arrow-right report-card__arrow" aria-hidden="true" />
        </button>
      </div>

      <!-- Report Panels -->
      <AttendanceReportPanel v-if="selectedReport === 'attendance'" />
      <StudentSummaryReportPanel v-if="selectedReport === 'student-summary'" />
    </section>
  </MainLayout>
</template>

<style scoped>
.report-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1.1rem;
  border-radius: 1.15rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  text-align: left;
  width: 100%;
  box-shadow: 0 12px 32px -24px rgba(15, 23, 42, 0.3);
  transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease, background 0.14s ease;
  cursor: pointer;
}

.report-card:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -24px rgba(15, 23, 42, 0.38); }

.report-card--active {
  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 18px 40px -24px rgba(15, 23, 42, 0.38);
  transform: translateY(-2px);
}

.report-card__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
  font-size: 1.05rem;
}

.report-card__body { flex: 1; min-width: 0; }
.report-card__title { margin: 0 0 0.25rem; font-size: 0.9rem; font-weight: 700; color: #0f172a; }
.report-card__desc { margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.5; }
.report-card__arrow { font-size: 0.75rem; color: #cbd5e1; align-self: center; flex-shrink: 0; transition: transform 0.14s; }
.report-card:hover .report-card__arrow { transform: translateX(3px); color: #94a3b8; }

.card--emerald .report-card__icon-wrap { background: #d1fae5; color: #065f46; }
.card--emerald:hover { border-color: #6ee7b7; }
.card--emerald.report-card--active { border-color: #6ee7b7; }
.card--blue .report-card__icon-wrap { background: #dbeafe; color: #1e40af; }
.card--blue:hover { border-color: #93c5fd; }
.card--blue.report-card--active { border-color: #93c5fd; }
</style>
