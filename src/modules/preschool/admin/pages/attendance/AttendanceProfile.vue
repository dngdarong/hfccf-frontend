<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { formatDate } from '@/utils/date'
import {
  fetchPreschoolAttendance,
  fetchPreschoolClasses,
  fetchPreschoolStudents,
} from '@/modules/preschool/services/preschoolApi'

defineOptions({ name: 'PreschoolAdminAttendanceProfilePage' })

const { t } = useLanguage()
const router = useRouter()

const classOptions = ref([])
const studentOptions = ref([])
const selectedClassId = ref('')
const selectedStudentId = ref('')
const records = ref([])
const loading = ref(false)
const loadingStudents = ref(false)
const errorMessage = ref('')

const STATUS_STYLE = {
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-rose-50 text-rose-700',
  late: 'bg-amber-50 text-amber-700',
  excused: 'bg-sky-50 text-sky-700',
}

const stats = computed(() => {
  const total = records.value.length
  const present = records.value.filter((r) => r.status === 'present').length
  const absent = records.value.filter((r) => r.status === 'absent').length
  const late = records.value.filter((r) => r.status === 'late').length
  const excused = records.value.filter((r) => r.status === 'excused').length
  const rate = total ? Math.round((present / total) * 100) : 0
  return { total, present, absent, late, excused, rate }
})

const monthlyBreakdown = computed(() => {
  const map = {}
  for (const r of records.value) {
    const d = r.attendanceDate?.slice(0, 7) // YYYY-MM
    if (!d) continue
    if (!map[d]) map[d] = { month: d, total: 0, present: 0, absent: 0, late: 0 }
    map[d].total++
    if (r.status === 'present') map[d].present++
    else if (r.status === 'absent') map[d].absent++
    else if (r.status === 'late') map[d].late++
  }
  return Object.values(map)
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((m) => ({ ...m, rate: m.total ? Math.round((m.present / m.total) * 100) : 0 }))
})

const sortedRecords = computed(() =>
  [...records.value].sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate)),
)

async function loadStudents() {
  loadingStudents.value = true
  try {
    const res = await fetchPreschoolStudents({
      page: 1,
      perPage: 200,
      classId: selectedClassId.value,
    })
    studentOptions.value = (res.items || []).map((s) => ({
      label: `${s.fullName || s.name}${(s.publicId || s.studentCode) ? ` (${s.publicId || s.studentCode})` : ''}`,
      value: s.id,
    }))
    if (selectedStudentId.value && !studentOptions.value.some((option) => String(option.value) === String(selectedStudentId.value))) {
      selectedStudentId.value = ''
      records.value = []
    }
  } catch { studentOptions.value = [] }
  finally { loadingStudents.value = false }
}

async function loadClasses() {
  try {
    const res = await fetchPreschoolClasses({ page: 1, perPage: 200 })
    classOptions.value = (res.items || []).map((c) => ({
      label: c.name,
      value: c.id,
    }))
  } catch {
    classOptions.value = []
  }
}

async function loadProfile() {
  if (!selectedStudentId.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await fetchPreschoolAttendance({ studentId: selectedStudentId.value, page: 1, perPage: 500 })
    records.value = res.items || []
  } catch (e) {
    errorMessage.value = e?.message || t('preschoolAttendanceProfilePage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

watch(selectedClassId, async () => {
  selectedStudentId.value = ''
  records.value = []
  errorMessage.value = ''
  await loadStudents()
})

onMounted(async () => {
  await loadClasses()
  await loadStudents()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolAttendanceProfilePage.title')"
        :subtitle="t('preschoolAttendanceProfilePage.subtitle')"
      />

      <!-- Filters -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceProfilePage.filters.class') }}</span>
            <Select
              v-model="selectedClassId"
              :options="classOptions"
              option-label="label"
              option-value="value"
              class="min-w-[220px]"
              :placeholder="t('preschoolAttendanceProfilePage.placeholders.class')"
              :loading="false"
              show-clear
            />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceProfilePage.filters.student') }}</span>
            <Select
              v-model="selectedStudentId"
              :options="studentOptions"
              option-label="label"
              option-value="value"
              class="min-w-[220px]"
              :placeholder="t('preschoolAttendanceProfilePage.placeholders.student')"
              :loading="loadingStudents"
            />
          </label>
          <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" :disabled="!selectedStudentId" @click="loadProfile">
            {{ t('preschoolAttendanceProfilePage.actions.load') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="router.push({ name: 'dashboard-preschool-admin-attendance' })">
            {{ t('preschoolAttendanceProfilePage.actions.back') }}
          </Button>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</div>

      <!-- Empty state -->
      <div v-if="!selectedStudentId" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAttendanceProfilePage.messages.selectStudent') }}
      </div>
      <div v-else-if="loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolReportsShared.loading') }}
      </div>

      <template v-else-if="records.length">
        <!-- Stat cards -->
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div class="rounded-2xl border border-violet-200 bg-violet-50 p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-violet-500">{{ t('preschoolAttendanceProfilePage.cards.rate') }}</p>
            <p class="mt-2 text-3xl font-bold text-violet-700">{{ stats.rate }}%</p>
            <p class="mt-1 text-xs text-violet-400">{{ t('preschoolAttendanceProfilePage.cards.rateCaption') }}</p>
          </div>
          <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-500">{{ t('preschoolAttendanceProfilePage.cards.present') }}</p>
            <p class="mt-2 text-3xl font-bold text-emerald-700">{{ stats.present }}</p>
          </div>
          <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-rose-500">{{ t('preschoolAttendanceProfilePage.cards.absent') }}</p>
            <p class="mt-2 text-3xl font-bold text-rose-700">{{ stats.absent }}</p>
          </div>
          <div class="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-amber-500">{{ t('preschoolAttendanceProfilePage.cards.late') }}</p>
            <p class="mt-2 text-3xl font-bold text-amber-700">{{ stats.late }}</p>
          </div>
          <div class="rounded-2xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-sky-500">{{ t('preschoolAttendanceProfilePage.cards.excused') }}</p>
            <p class="mt-2 text-3xl font-bold text-sky-700">{{ stats.excused }}</p>
          </div>
        </div>

        <!-- Monthly breakdown -->
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-4 py-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolAttendanceProfilePage.breakdown.title') }}</h3>
          </div>
          <div v-if="!monthlyBreakdown.length" class="px-4 py-6 text-center text-sm text-slate-400">{{ t('preschoolAttendanceProfilePage.breakdown.empty') }}</div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 text-sm">
              <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceProfilePage.breakdown.columns.month') }}</th>
                  <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceProfilePage.breakdown.columns.total') }}</th>
                  <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceProfilePage.breakdown.columns.present') }}</th>
                  <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceProfilePage.breakdown.columns.absent') }}</th>
                  <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceProfilePage.breakdown.columns.late') }}</th>
                  <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceProfilePage.breakdown.columns.rate') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="row in monthlyBreakdown" :key="row.month">
                  <td class="px-4 py-3 font-medium text-slate-900">{{ row.month }}</td>
                  <td class="px-4 py-3 text-right text-slate-600">{{ row.total }}</td>
                  <td class="px-4 py-3 text-right text-emerald-600">{{ row.present }}</td>
                  <td class="px-4 py-3 text-right text-rose-600">{{ row.absent }}</td>
                  <td class="px-4 py-3 text-right text-amber-600">{{ row.late }}</td>
                  <td class="px-4 py-3 text-right font-semibold" :class="row.rate >= 90 ? 'text-emerald-600' : row.rate >= 75 ? 'text-amber-600' : 'text-rose-600'">
                    {{ row.rate }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Full record list -->
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="border-b border-slate-100 px-4 py-3">
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolAttendanceProfilePage.history.title') }}</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100 text-sm">
              <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th class="w-12 px-4 py-3 font-semibold">{{ t('preschoolAttendanceProfilePage.history.columns.no') }}</th>
                  <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceProfilePage.history.columns.date') }}</th>
                  <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceProfilePage.history.columns.status') }}</th>
                  <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceProfilePage.history.columns.class') }}</th>
                  <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceProfilePage.history.columns.note') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="(record, i) in sortedRecords" :key="record.id">
                  <td class="px-4 py-3 text-slate-400 tabular-nums">{{ i + 1 }}</td>
                  <td class="px-4 py-3 text-slate-700">{{ formatDate(record.attendanceDate) || record.attendanceDate }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="STATUS_STYLE[record.status] || 'bg-slate-100 text-slate-600'">
                      {{ t(`preschoolAttendanceStatus.${record.status}`) || record.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-600">{{ record.className || '—' }}</td>
                  <td class="px-4 py-3 text-slate-500">{{ record.note || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <div v-else-if="selectedStudentId && !loading" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolAttendanceProfilePage.history.empty') }}
      </div>
    </section>
  </MainLayout>
</template>
