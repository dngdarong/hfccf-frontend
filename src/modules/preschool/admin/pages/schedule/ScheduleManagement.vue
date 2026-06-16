<script setup>
// Keep schedule management on a dedicated page so conflict handling, archive
// actions, and weekly timetable filtering do not turn the Preschool dashboard
// into a monolithic CRUD screen.
import { computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolSchedules } from '@/modules/preschool/composables/usePreschoolSchedules'
import ScheduleDayTabs from '@/modules/preschool/shared/components/schedule/ScheduleDayTabs.vue'
import ScheduleEntryCard from '@/modules/preschool/shared/components/schedule/ScheduleEntryCard.vue'
import ScheduleEntryForm from '@/modules/preschool/shared/components/schedule/ScheduleEntryForm.vue'
import ScheduleConflictNotice from '@/modules/preschool/shared/components/schedule/ScheduleConflictNotice.vue'
import { PreschoolScheduleDay, PreschoolScheduleStatus } from '@/modules/preschool/services/scheduleConstants'

defineOptions({
  name: 'PreschoolScheduleManagementPage',
})

const { t } = useLanguage()
const {
  archiveSchedule,
  classOptions,
  conflicts,
  errorMessage,
  isTermLocked,
  isReportPeriodLocked,
  loadLookups,
  loadSchedules,
  pagination,
  saveSchedule,
  schedules,
  searchQuery,
  selectedClassId,
  selectedDayOfWeek,
  selectedSchedule,
  selectedStatus,
  selectedTeacherId,
  setSearchQuery,
  setSelectedClassId,
  setSelectedDayOfWeek,
  setSelectedSchedule,
  setSelectedStatus,
  setSelectedTeacherId,
  saving,
  teacherOptions,
  lockMessage,
  loading,
} = usePreschoolSchedules()

const dayOptions = computed(() => [
  { label: t('preschoolSchedulesShared.days.monday'), value: PreschoolScheduleDay.MONDAY },
  { label: t('preschoolSchedulesShared.days.tuesday'), value: PreschoolScheduleDay.TUESDAY },
  { label: t('preschoolSchedulesShared.days.wednesday'), value: PreschoolScheduleDay.WEDNESDAY },
  { label: t('preschoolSchedulesShared.days.thursday'), value: PreschoolScheduleDay.THURSDAY },
  { label: t('preschoolSchedulesShared.days.friday'), value: PreschoolScheduleDay.FRIDAY },
  { label: t('preschoolSchedulesShared.days.saturday'), value: PreschoolScheduleDay.SATURDAY },
  { label: t('preschoolSchedulesShared.days.sunday'), value: PreschoolScheduleDay.SUNDAY },
])

const statusOptions = computed(() => [
  { label: t('preschoolSchedulesShared.statuses.active'), value: PreschoolScheduleStatus.ACTIVE },
  { label: t('preschoolSchedulesShared.statuses.inactive'), value: PreschoolScheduleStatus.INACTIVE },
  { label: t('preschoolSchedulesShared.statuses.archived'), value: PreschoolScheduleStatus.ARCHIVED },
])

const visibleSchedules = computed(() => schedules.value || [])
const selectedScheduleId = computed(() => selectedSchedule.value?.id || '')
const selectedDayLabel = computed(() => {
  const option = dayOptions.value.find((item) => String(item.value) === String(selectedDayOfWeek.value))

  return option?.label || t('preschoolSchedulesPage.classView.title')
})

async function applyFilters() {
  await loadSchedules({
    page: 1,
    search: searchQuery.value,
    status: selectedStatus.value,
    classId: selectedClassId.value,
    teacherUserId: selectedTeacherId.value,
    dayOfWeek: selectedDayOfWeek.value,
  })
}

async function resetFilters() {
  setSearchQuery('')
  setSelectedStatus('')
  setSelectedClassId('')
  setSelectedTeacherId('')
  setSelectedDayOfWeek('')
  await loadSchedules({ page: 1, search: '', status: '', classId: '', teacherUserId: '', dayOfWeek: '' })
}

async function handleSave(payload) {
  await saveSchedule(payload, selectedScheduleId.value)
  setSelectedSchedule(null)
}

async function handleArchive(entry) {
  if (!entry?.id) return

  await archiveSchedule(entry.id)
  if (selectedScheduleId.value === String(entry.id)) {
    setSelectedSchedule(null)
  }
}

function handleEdit(entry) {
  setSelectedSchedule(entry)
}

onMounted(async () => {
  await loadLookups()
  await loadSchedules()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolSchedulesPage.management.title')"
        :subtitle="t('preschoolSchedulesPage.management.subtitle')"
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

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label class="space-y-2 text-sm font-medium text-slate-700 xl:col-span-2">
                <span>{{ t('preschoolSchedulesPage.filters.search') }}</span>
                <InputText v-model="searchQuery" class="w-full" :placeholder="t('preschoolSchedulesPage.filters.search')" />
              </label>

              <label class="space-y-2 text-sm font-medium text-slate-700">
                <span>{{ t('preschoolSchedulesPage.filters.class') }}</span>
                <Select
                  v-model="selectedClassId"
                  :options="classOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                  :placeholder="t('preschoolSchedulesPage.filters.class')"
                />
              </label>

              <label class="space-y-2 text-sm font-medium text-slate-700">
                <span>{{ t('preschoolSchedulesPage.filters.teacher') }}</span>
                <Select
                  v-model="selectedTeacherId"
                  :options="teacherOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                  :placeholder="t('preschoolSchedulesPage.filters.teacher')"
                />
              </label>

              <label class="space-y-2 text-sm font-medium text-slate-700">
                <span>{{ t('preschoolSchedulesPage.filters.status') }}</span>
                <Select
                  v-model="selectedStatus"
                  :options="statusOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                  :placeholder="t('preschoolSchedulesPage.filters.status')"
                />
              </label>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="primary" size="md" rounded="xl" @click="applyFilters">
                {{ t('preschoolSchedulesPage.filters.apply') }}
              </Button>
              <Button type="button" variant="ghost" size="md" rounded="xl" @click="resetFilters">
                {{ t('preschoolSchedulesPage.filters.reset') }}
              </Button>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-semibold text-slate-900">{{ selectedDayLabel }}</h3>
              <ScheduleDayTabs
                :days="dayOptions"
                :model-value="selectedDayOfWeek"
                @update:model-value="async (value) => { setSelectedDayOfWeek(value); await applyFilters() }"
              />
            </div>

            <div class="mt-4">
              <ScheduleConflictNotice
                :conflicts="conflicts"
                :title="t('preschoolSchedulesShared.conflicts.title')"
                :subtitle="t('preschoolSchedulesShared.conflicts.subtitle')"
              />
            </div>

            <div class="mt-4">
              <div
                v-if="loading"
                class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
              >
                {{ t('preschoolSchedulesPage.loading') }}
              </div>

              <div
                v-else-if="!visibleSchedules.length"
                class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500"
              >
                <p class="font-medium text-slate-700">{{ t('preschoolSchedulesPage.empty') }}</p>
                <p class="mt-1">{{ t('preschoolSchedulesPage.emptyDescription') }}</p>
              </div>

              <div v-else class="grid gap-3 md:grid-cols-2">
                <ScheduleEntryCard
                  v-for="entry in visibleSchedules"
                  :key="entry.id"
                  :entry="entry"
                  :day-label="dayOptions.find((day) => String(day.value) === String(entry.dayOfWeek))?.label || ''"
                  :show-actions="true"
                  :edit-label="t('preschoolSchedulesPage.actions.update')"
                  :archive-label="t('preschoolSchedulesPage.actions.archive')"
                  :is-locked="isTermLocked || isReportPeriodLocked"
                  @edit="handleEdit"
                  @archive="handleArchive"
                />
              </div>

              <div v-if="pagination.totalPages > 1" class="mt-4 flex justify-end">
                <Pagination
                  v-model="pagination.page"
                  :total-pages="pagination.totalPages"
                  @change="
                    async (page) =>
                      loadSchedules({
                        page,
                        search: searchQuery,
                        status: selectedStatus,
                        classId: selectedClassId,
                        teacherUserId: selectedTeacherId,
                        dayOfWeek: selectedDayOfWeek,
                      })
                  "
                />
              </div>
            </div>
          </div>
        </section>

        <div class="space-y-4">
          <ScheduleEntryForm
            :entry="selectedSchedule"
            :class-options="classOptions"
            :teacher-options="teacherOptions"
            :day-options="dayOptions"
            :status-options="statusOptions"
            :conflicts="conflicts"
            :saving="saving"
            :title="selectedScheduleId ? t('preschoolSchedulesPage.actions.update') : t('preschoolSchedulesPage.actions.create')"
            :subtitle="t('preschoolSchedulesPage.form.subtitle')"
            :submit-label="selectedScheduleId ? t('preschoolSchedulesPage.actions.update') : t('preschoolSchedulesPage.actions.create')"
            :cancel-label="t('preschoolSchedulesPage.actions.cancel')"
            :empty-class-label="t('preschoolSchedulesPage.form.placeholders.class')"
            :empty-teacher-label="t('preschoolSchedulesPage.form.placeholders.teacher')"
            :field-labels="{
              classLabel: t('preschoolSchedulesPage.form.labels.class'),
              teacherLabel: t('preschoolSchedulesPage.form.labels.teacher'),
              dayLabel: t('preschoolSchedulesPage.form.labels.day'),
              statusLabel: t('preschoolSchedulesPage.form.labels.status'),
              startTimeLabel: t('preschoolSchedulesPage.form.labels.startTime'),
              endTimeLabel: t('preschoolSchedulesPage.form.labels.endTime'),
              roomLabel: t('preschoolSchedulesPage.form.labels.room'),
              activityLabel: t('preschoolSchedulesPage.form.labels.activity'),
              notesLabel: t('preschoolSchedulesPage.form.labels.notes'),
              effectiveFromLabel: t('preschoolSchedulesPage.form.labels.effectiveFrom'),
              effectiveUntilLabel: t('preschoolSchedulesPage.form.labels.effectiveUntil'),
            }"
            :placeholders="{
              day: t('preschoolSchedulesPage.form.placeholders.day'),
              status: t('preschoolSchedulesPage.form.placeholders.status'),
              room: t('preschoolSchedulesPage.form.placeholders.room'),
              activity: t('preschoolSchedulesPage.form.placeholders.activity'),
            }"
            :conflict-title="t('preschoolSchedulesShared.conflicts.title')"
            :conflict-subtitle="t('preschoolSchedulesShared.conflicts.subtitle')"
            :is-locked="isTermLocked || isReportPeriodLocked"
            :lock-message="lockMessage"
            @submit="handleSave"
            @cancel="setSelectedSchedule(null)"
          />
          <div class="flex justify-end">
            <Button type="button" variant="ghost" size="md" rounded="xl" @click="loadSchedules">
              {{ t('preschoolSchedulesPage.actions.refresh') }}
            </Button>
          </div>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
