<script setup>
// Keep the teacher timetable page read-only so admins can inspect weekly
// coverage without exposing schedule editing controls.
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useRoute, useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolTeacherSchedule } from '@/modules/preschool/composables/usePreschoolTeacherSchedule'
import ScheduleDayTabs from '@/modules/preschool/shared/components/schedule/ScheduleDayTabs.vue'
import WeeklyTimetableGrid from '@/modules/preschool/shared/components/schedule/WeeklyTimetableGrid.vue'
import { PreschoolScheduleDay } from '@/modules/preschool/services/scheduleConstants'

defineOptions({
  name: 'PreschoolTeacherSchedulePage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()
const {
  errorMessage,
  loadTeacherOptions,
  loadTeacherSchedule,
  loading,
  schedules,
  selectedTeacherId,
  setSelectedTeacherId,
  teacherOptions,
  teacherSummary,
} = usePreschoolTeacherSchedule()

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

  return option?.label || t('preschoolSchedulesPage.teacherView.title')
})

async function refreshTeacherSchedule() {
  await loadTeacherSchedule(selectedTeacherId.value)
}

async function handleTeacherChange(teacherId) {
  setSelectedTeacherId(teacherId)
  await loadTeacherSchedule(teacherId)
}

function goBack() {
  router.push({ name: 'dashboard-preschool-admin-schedules' })
}

onMounted(async () => {
  const teacherId = String(route.query.teacherId || '').trim()

  await loadTeacherOptions()

  if (teacherId) {
    setSelectedTeacherId(teacherId)
  }

  if (selectedTeacherId.value) {
    await loadTeacherSchedule(selectedTeacherId.value)
  }
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolSchedulesPage.teacherView.title')"
        :subtitle="t('preschoolSchedulesPage.teacherView.subtitle')"
      />

      <div
        v-if="errorMessage"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ errorMessage }}
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <Select
          :model-value="selectedTeacherId"
          :options="teacherOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSchedulesPage.filters.teacher')"
          @update:model-value="handleTeacherChange"
        />

        <div class="flex items-end gap-2">
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="goBack">
            {{ t('preschoolSchedulesPage.actions.back') }}
          </Button>
          <Button type="button" variant="primary" size="md" rounded="xl" @click="refreshTeacherSchedule">
            {{ t('preschoolSchedulesPage.actions.refresh') }}
          </Button>
        </div>
      </div>

      <div v-if="teacherSummary" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ teacherSummary.username }}
        </p>
        <h3 class="text-lg font-semibold text-slate-900">{{ teacherSummary.name }}</h3>
        <p class="text-sm text-slate-600">{{ teacherSummary.email }}</p>
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
