<script setup>
// Keep the classroom report page focused on class selection and loading so
// the detailed report table can remain a separate reusable component.
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import {
  PRESCHOOL_CLASSROOM_REPORT_PERIOD_TYPE_OPTIONS,
  usePreschoolClassroomReports,
} from '@/modules/preschool/composables/usePreschoolClassroomReports'
import ReportPeriodSelector from '@/modules/preschool/shared/components/report/ReportPeriodSelector.vue'
import ReportPeriodStatusBadge from '@/modules/preschool/shared/components/report/ReportPeriodStatusBadge.vue'
import ClassroomProgressTable from '@/modules/preschool/shared/components/report/ClassroomProgressTable.vue'

defineOptions({
  name: 'PreschoolClassroomReportsPage',
})

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()

const {
  classOptions,
  errorMessage,
  isTeacher,
  loadClassroomReport,
  loadLookupData,
  loadReportPeriodOptions,
  loading,
  reportBundle,
  reportPeriods,
  reportPeriodLockMessage,
  selectedReportPeriod,
  selectedClassId,
  selectedPeriodType,
  selectedPeriodLabel,
  setSelectedClassId,
  setSelectedPeriodType,
  setSelectedPeriodLabel,
} = usePreschoolClassroomReports()

const periodTypeOptions = PRESCHOOL_CLASSROOM_REPORT_PERIOD_TYPE_OPTIONS.map((option) => ({
  ...option,
  label: t(`preschoolReportsPage.periodTypes.${option.value}`),
}))

async function applyReport(classId = selectedClassId.value, periodLabel = selectedPeriodLabel.value, periodType = selectedPeriodType.value) {
  await loadClassroomReport(classId, periodLabel, periodType)
}

async function handleClassChange(classId) {
  setSelectedClassId(classId)
  setSelectedPeriodLabel('')
  await loadReportPeriodOptions(classId, selectedPeriodType.value)
  await applyReport(classId, selectedPeriodLabel.value || reportPeriods.value[0]?.label || '', selectedPeriodType.value)
}

async function handlePeriodTypeChange(periodType) {
  setSelectedPeriodType(periodType)
  setSelectedPeriodLabel('')
  await loadReportPeriodOptions(selectedClassId.value, periodType)
  await applyReport(selectedClassId.value, selectedPeriodLabel.value || reportPeriods.value[0]?.label || '', periodType)
}

function goBack() {
  router.push({
    name: isTeacher.value ? 'dashboard-preschool-teacher' : 'dashboard-preschool-admin-reports',
  })
}

onMounted(async () => {
  const classId = String(route.query.classId || '').trim()
  const periodLabel = String(route.query.period || '').trim()
  const periodType = String(route.query.periodType || 'term').trim() || 'term'

  if (classId) {
    setSelectedClassId(classId)
  }

  if (periodLabel) {
    setSelectedPeriodLabel(periodLabel)
  }
  setSelectedPeriodType(periodType)

  await loadLookupData()
  await loadReportPeriodOptions(selectedClassId.value, periodType)

  if (selectedClassId.value) {
    await loadClassroomReport(selectedClassId.value, selectedPeriodLabel.value || reportPeriods.value[0]?.label || '', periodType)
  }
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolClassroomReportsPage.title')"
        :subtitle="t('preschoolClassroomReportsPage.subtitle')"
      />

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <label class="space-y-2 text-sm font-medium text-slate-700">
              <span>{{ t('preschoolClassroomReportsPage.filters.periodType') }}</span>
              <Select
                :model-value="selectedPeriodType"
                :options="periodTypeOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                :placeholder="t('preschoolClassroomReportsPage.placeholders.periodType')"
                @update:model-value="handlePeriodTypeChange"
              />
            </label>

            <label class="space-y-2 text-sm font-medium text-slate-700">
              <span>{{ t('preschoolClassroomReportsPage.filters.class') }}</span>
              <Select
                :model-value="selectedClassId"
                :options="classOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                :placeholder="t('preschoolClassroomReportsPage.placeholders.class')"
                @update:model-value="handleClassChange"
              />
            </label>

            <div class="flex items-end gap-2">
              <Button type="button" variant="ghost" size="md" rounded="xl" @click="goBack">
                {{ t('preschoolClassroomReportsPage.actions.back') }}
              </Button>
            </div>
          </div>
        </div>

        <ReportPeriodSelector
          :label="t('preschoolClassroomReportsPage.filters.period')"
          :periods="reportPeriods"
          :model-value="selectedPeriodLabel"
          :placeholder="t('preschoolClassroomReportsPage.placeholders.period')"
          :loading="loading"
          @update:model-value="setSelectedPeriodLabel"
          @refresh="applyReport"
        />
      </div>

      <div v-if="selectedReportPeriod" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolReportsPage.selectedPeriod.title') }}</h3>
            <p class="text-sm text-slate-500">{{ t('preschoolReportsPage.selectedPeriod.subtitle') }}</p>
          </div>
          <ReportPeriodStatusBadge :status="selectedReportPeriod.status" />
        </div>
        <div
          v-if="reportPeriodLockMessage"
          class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {{ reportPeriodLockMessage }}
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <ClassroomProgressTable :report="reportBundle.report" :loading="loading" />
    </section>
  </MainLayout>
</template>
