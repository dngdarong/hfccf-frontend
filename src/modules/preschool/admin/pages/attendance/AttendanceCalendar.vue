<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolAttendance, fetchPreschoolClasses } from '@/modules/preschool/services/preschoolApi'

defineOptions({ name: 'PreschoolAdminAttendanceCalendarPage' })

const { t } = useLanguage()
const router = useRouter()

const classOptions = ref([])
const selectedClassId = ref('')
const records = ref([])
const loading = ref(false)

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth()) // 0-indexed

const monthLabel = computed(() => {
  return new Date(viewYear.value, viewMonth.value, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
})

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// Build 6-row calendar grid (null = empty cell)
const calendarWeeks = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1).getDay()
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const weeks = []
  let day = 1
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const cellIndex = w * 7 + d
      if (cellIndex < firstDay || day > daysInMonth) {
        week.push(null)
      } else {
        week.push(day++)
      }
    }
    if (week.some((d) => d !== null)) weeks.push(week)
  }
  return weeks
})

// Map date string → { present, absent, late, excused, total }
const dayStats = computed(() => {
  const map = {}
  for (const r of records.value) {
    const date = r.attendanceDate?.slice(0, 10)
    if (!date) continue
    if (!map[date]) map[date] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
    const s = r.status
    if (s in map[date]) map[date][s]++
    map[date].total++
  }
  return map
})

function dayKey(day) {
  if (!day) return null
  return `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function dayColor(day) {
  const key = dayKey(day)
  const stat = dayStats.value[key]
  if (!stat || stat.total === 0) return 'bg-slate-50 border-slate-200 text-slate-400'
  const absentRate = (stat.absent + stat.late) / stat.total
  if (absentRate === 0) return 'bg-emerald-50 border-emerald-200'
  if (absentRate <= 0.25) return 'bg-yellow-50 border-yellow-200'
  if (absentRate <= 0.5) return 'bg-amber-50 border-amber-200'
  return 'bg-rose-50 border-rose-200'
}

function isFuture(day) {
  if (!day) return false
  const d = new Date(viewYear.value, viewMonth.value, day)
  return d > today
}

function isToday(day) {
  if (!day) return false
  return viewYear.value === today.getFullYear() && viewMonth.value === today.getMonth() && day === today.getDate()
}

function goToDay(day) {
  if (!day || !selectedClassId.value || isFuture(day)) return
  const date = dayKey(day)
  router.push({ name: 'dashboard-preschool-admin-attendance-students', query: { date, classId: selectedClassId.value } })
}

function shiftMonth(delta) {
  let m = viewMonth.value + delta
  let y = viewYear.value
  if (m < 0) { m = 11; y-- }
  if (m > 11) { m = 0; y++ }
  viewMonth.value = m
  viewYear.value = y
}

async function loadClasses() {
  try {
    const res = await fetchPreschoolClasses({ page: 1, perPage: 100 })
    classOptions.value = (res.items || []).map((c) => ({ label: c.name, value: c.id }))
  } catch { classOptions.value = [] }
}

async function loadMonth() {
  if (!selectedClassId.value) return
  loading.value = true
  try {
    const y = viewYear.value
    const m = String(viewMonth.value + 1).padStart(2, '0')
    const lastDay = new Date(y, viewMonth.value + 1, 0).getDate()
    const res = await fetchPreschoolAttendance({
      classId: selectedClassId.value,
      dateFrom: `${y}-${m}-01`,
      dateTo: `${y}-${m}-${lastDay}`,
      page: 1,
      perPage: 500,
    })
    records.value = res.items || []
  } catch { records.value = [] }
  finally { loading.value = false }
}

watch([selectedClassId, viewMonth, viewYear], () => {
  if (selectedClassId.value) loadMonth()
})

loadClasses()
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolAttendanceCalendarPage.title')"
        :subtitle="t('preschoolAttendanceCalendarPage.subtitle')"
      />

      <!-- Controls -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceCalendarPage.filters.class') }}</span>
            <Select
              v-model="selectedClassId"
              :options="classOptions"
              option-label="label"
              option-value="value"
              class="min-w-[180px]"
              :placeholder="t('preschoolAttendanceCalendarPage.placeholders.class')"
            />
          </label>

          <!-- Month nav -->
          <div class="flex items-end gap-1">
            <Button type="button" variant="ghost" size="md" rounded="xl" :title="t('preschoolAttendanceCalendarPage.actions.prevMonth')" @click="shiftMonth(-1)">‹</Button>
            <span class="flex h-10 items-center px-3 text-sm font-semibold text-slate-700">{{ monthLabel }}</span>
            <Button type="button" variant="ghost" size="md" rounded="xl" :title="t('preschoolAttendanceCalendarPage.actions.nextMonth')" @click="shiftMonth(1)">›</Button>
          </div>

          <Button type="button" variant="ghost" size="md" rounded="xl" @click="router.push({ name: 'dashboard-preschool-admin-attendance' })">
            {{ t('preschoolAttendanceCalendarPage.actions.back') }}
          </Button>
        </div>
      </div>

      <!-- Empty / loading states -->
      <div v-if="!selectedClassId" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAttendanceCalendarPage.messages.selectClass') }}
      </div>
      <div v-else-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAttendanceCalendarPage.messages.loading') }}
      </div>

      <!-- Calendar grid -->
      <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <!-- Day-of-week headers -->
        <div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          <div v-for="key in DAY_KEYS" :key="key" class="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ t(`preschoolAttendanceCalendarPage.days.${key}`) }}
          </div>
        </div>

        <!-- Weeks -->
        <div class="divide-y divide-slate-100">
          <div v-for="(week, wi) in calendarWeeks" :key="wi" class="grid grid-cols-7 divide-x divide-slate-100">
            <div
              v-for="(day, di) in week"
              :key="di"
              class="relative min-h-[80px] p-2 transition-colors"
              :class="[
                day ? dayColor(day) : 'bg-white',
                day && !isFuture(day) && selectedClassId ? 'cursor-pointer hover:brightness-95' : '',
                isToday(day) ? 'ring-2 ring-inset ring-violet-400' : '',
                isFuture(day) ? 'opacity-40' : '',
              ]"
              @click="goToDay(day)"
            >
              <template v-if="day">
                <span class="text-xs font-semibold" :class="isToday(day) ? 'text-violet-700' : 'text-slate-600'">
                  {{ day }}
                </span>

                <!-- Stats pills -->
                <template v-if="dayStats[dayKey(day)]">
                  <div class="mt-1 flex flex-wrap gap-0.5">
                    <span v-if="dayStats[dayKey(day)].present" class="rounded px-1 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                      {{ dayStats[dayKey(day)].present }}P
                    </span>
                    <span v-if="dayStats[dayKey(day)].absent" class="rounded px-1 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-700">
                      {{ dayStats[dayKey(day)].absent }}A
                    </span>
                    <span v-if="dayStats[dayKey(day)].late" class="rounded px-1 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700">
                      {{ dayStats[dayKey(day)].late }}L
                    </span>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-4 border-t border-slate-100 px-4 py-3">
          <span class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="inline-block h-3 w-3 rounded border border-emerald-200 bg-emerald-50" />
            {{ t('preschoolAttendanceCalendarPage.legend.allPresent') }}
          </span>
          <span class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="inline-block h-3 w-3 rounded border border-amber-200 bg-amber-50" />
            {{ t('preschoolAttendanceCalendarPage.legend.someAbsent') }}
          </span>
          <span class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="inline-block h-3 w-3 rounded border border-rose-200 bg-rose-50" />
            {{ t('preschoolAttendanceCalendarPage.legend.mostlyAbsent') }}
          </span>
          <span class="flex items-center gap-1.5 text-xs text-slate-500">
            <span class="inline-block h-3 w-3 rounded border border-slate-200 bg-slate-50" />
            {{ t('preschoolAttendanceCalendarPage.legend.noRecords') }}
          </span>
          <span class="ml-auto text-xs text-slate-400">Click a day to mark attendance</span>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
