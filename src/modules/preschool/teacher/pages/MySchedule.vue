<script setup>
// Keep the teacher self-schedule page dedicated to read-only viewing so the
// teacher flow stays discoverable without mixing in admin controls.
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolTeacherSchedule } from '@/modules/preschool/composables/usePreschoolTeacherSchedule'
import ScheduleDayTabs from '@/modules/preschool/shared/components/schedule/ScheduleDayTabs.vue'
import WeeklyTimetableGrid from '@/modules/preschool/shared/components/schedule/WeeklyTimetableGrid.vue'
import { PreschoolScheduleDay } from '@/modules/preschool/services/scheduleConstants'

defineOptions({
  name: 'TeacherPreschoolSchedulePage',
})

const router = useRouter()
const { t } = useLanguage()
const {
  errorMessage,
  isTermLocked,
  isReportPeriodLocked,
  loadMySchedule,
  loading,
  lockMessage,
  schedules,
  teacherSummary,
} =
  usePreschoolTeacherSchedule()

const dayOptions = computed(() => [
  { label: t('preschoolSchedulesShared.days.monday'), value: PreschoolScheduleDay.MONDAY },
  { label: t('preschoolSchedulesShared.days.tuesday'), value: PreschoolScheduleDay.TUESDAY },
  { label: t('preschoolSchedulesShared.days.wednesday'), value: PreschoolScheduleDay.WEDNESDAY },
  { label: t('preschoolSchedulesShared.days.thursday'), value: PreschoolScheduleDay.THURSDAY },
  { label: t('preschoolSchedulesShared.days.friday'), value: PreschoolScheduleDay.FRIDAY },
  { label: t('preschoolSchedulesShared.days.saturday'), value: PreschoolScheduleDay.SATURDAY },
  { label: t('preschoolSchedulesShared.days.sunday'), value: PreschoolScheduleDay.SUNDAY },
])

const selectedDayOfWeek = ref('')
const visibleEntries = computed(() =>
  selectedDayOfWeek.value
    ? schedules.value.filter((entry) => String(entry.dayOfWeek) === String(selectedDayOfWeek.value))
    : schedules.value,
)
const selectedDayLabel = computed(() => {
  const option = dayOptions.value.find((item) => String(item.value) === String(selectedDayOfWeek.value))

  return option?.label || t('preschoolSchedulesPage.myView.title')
})

function goBack() {
  router.push({ name: 'dashboard-preschool-teacher' })
}

onMounted(() => {
  loadMySchedule()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolSchedulesPage.myView.title')"
        :subtitle="t('preschoolSchedulesPage.myView.subtitle')"
      />

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="(isTermLocked || isReportPeriodLocked) && lockMessage"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        {{ lockMessage }}
      </div>

      <div class="flex items-end justify-between gap-2">
        <div class="text-sm text-slate-600">
          {{ teacherSummary?.name || t('preschoolSchedulesPage.myView.title') }}
        </div>
        <div class="flex gap-2">
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goBack">
            {{ t('preschoolSchedulesPage.actions.back') }}
          </Button>
          <Button type="button" variant="primary" size="md" rounded="xl" @click="loadMySchedule">
            {{ t('preschoolSchedulesPage.actions.refresh') }}
          </Button>
        </div>
      </div>

      <ScheduleDayTabs
        :days="dayOptions"
        :model-value="selectedDayOfWeek"
        @update:model-value="selectedDayOfWeek = $event"
      />

      <WeeklyTimetableGrid
        :loading="loading"
        :loading-label="t('preschoolSchedulesShared.loading.grid')"
        :day-label="selectedDayLabel"
        :entries="visibleEntries"
        :empty-label="t('preschoolSchedulesPage.empty')"
      />
    </section>
  </MainLayout>
</template>
