<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolAttendance, fetchPreschoolClasses } from '@/modules/preschool/services/preschoolApi'

defineOptions({ name: 'PreschoolAdminAttendanceDashboardPage' })

const { t } = useLanguage()
const router = useRouter()

const records = ref([])
const classOptions = ref([])
const loading = ref(false)
const errorMessage = ref('')

const today = new Date()
const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
const filters = ref({
  classId: '',
  dateFrom: firstOfMonth,
  dateTo: today.toISOString().slice(0, 10),
})

const stats = computed(() => {
  const total = records.value.length
  const present = records.value.filter((r) => r.status === 'present').length
  const absent = records.value.filter((r) => r.status === 'absent').length
  const late = records.value.filter((r) => r.status === 'late').length
  const excused = records.value.filter((r) => r.status === 'excused').length
  const rate = total ? Math.round((present / total) * 100) : 0
  return { total, present, absent, late, excused, rate }
})

const classSummary = computed(() => {
  const map = {}
  for (const r of records.value) {
    const key = r.classId || 'unknown'
    if (!map[key]) map[key] = { name: r.className || key, total: 0, present: 0, absent: 0, late: 0, excused: 0 }
    map[key].total++
    if (r.status === 'present') map[key].present++
    else if (r.status === 'absent') map[key].absent++
    else if (r.status === 'late') map[key].late++
    else if (r.status === 'excused') map[key].excused++
  }
  return Object.values(map)
    .map((c) => ({ ...c, rate: c.total ? Math.round((c.present / c.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)
})

const statCards = computed(() => [
  { label: t('preschoolAttendanceDashboardPage.cards.rate'), value: `${stats.value.rate}%`, caption: t('preschoolAttendanceDashboardPage.cards.rateCaption'), color: 'text-violet-700', bg: 'bg-violet-50' },
  { label: t('preschoolAttendanceDashboardPage.cards.total'), value: stats.value.total, caption: t('preschoolAttendanceDashboardPage.cards.totalCaption'), color: 'text-slate-700', bg: 'bg-slate-50' },
  { label: t('preschoolAttendanceDashboardPage.cards.present'), value: stats.value.present, caption: t('preschoolAttendanceDashboardPage.cards.presentCaption'), color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: t('preschoolAttendanceDashboardPage.cards.absent'), value: stats.value.absent, caption: t('preschoolAttendanceDashboardPage.cards.absentCaption'), color: 'text-rose-700', bg: 'bg-rose-50' },
  { label: t('preschoolAttendanceDashboardPage.cards.late'), value: stats.value.late, caption: t('preschoolAttendanceDashboardPage.cards.lateCaption'), color: 'text-amber-700', bg: 'bg-amber-50' },
  { label: t('preschoolAttendanceDashboardPage.cards.excused'), value: stats.value.excused, caption: t('preschoolAttendanceDashboardPage.cards.excusedCaption'), color: 'text-sky-700', bg: 'bg-sky-50' },
])

function rateColor(rate) {
  if (rate >= 90) return 'text-emerald-600'
  if (rate >= 75) return 'text-amber-600'
  return 'text-rose-600'
}

async function loadClasses() {
  try {
    const res = await fetchPreschoolClasses({ page: 1, perPage: 100 })
    classOptions.value = (res.items || []).map((c) => ({ label: c.name, value: c.id }))
  } catch { classOptions.value = [] }
}

async function loadData() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await fetchPreschoolAttendance({
      classId: filters.value.classId,
      dateFrom: filters.value.dateFrom,
      dateTo: filters.value.dateTo,
      page: 1,
      perPage: 500,
    })
    records.value = res.items || []
  } catch (e) {
    errorMessage.value = e?.message || t('preschoolAttendanceDashboardPage.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadClasses()
  await loadData()
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolAttendanceDashboardPage.title')"
        :subtitle="t('preschoolAttendanceDashboardPage.subtitle')"
      />

      <!-- Filters -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-end gap-3">
          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceDashboardPage.filters.class') }}</span>
            <select v-model="filters.classId" class="h-10 min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
              <option value="">{{ t('preschoolAttendanceDashboardPage.filters.allClasses') }}</option>
              <option v-for="c in classOptions" :key="c.value" :value="c.value">{{ c.label }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceDashboardPage.filters.dateFrom') }}</span>
            <input v-model="filters.dateFrom" type="date" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ t('preschoolAttendanceDashboardPage.filters.dateTo') }}</span>
            <input v-model="filters.dateTo" type="date" class="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300">
          </label>
          <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="loadData">
            {{ t('preschoolAttendanceDashboardPage.actions.apply') }}
          </Button>
          <Button type="button" variant="ghost" size="md" rounded="xl" @click="router.push({ name: 'dashboard-preschool-admin-attendance' })">
            {{ t('preschoolAttendanceDashboardPage.actions.back') }}
          </Button>
        </div>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ errorMessage }}</div>

      <!-- Stat cards -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div v-for="card in statCards" :key="card.label" class="rounded-2xl border border-slate-200 p-4 shadow-sm" :class="card.bg">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.label }}</p>
          <p class="mt-2 text-3xl font-bold" :class="card.color">{{ card.value }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ card.caption }}</p>
        </div>
      </div>

      <!-- Class breakdown -->
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-4 py-3">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolAttendanceDashboardPage.breakdown.title') }}</h3>
        </div>
        <div v-if="loading" class="px-4 py-8 text-center text-sm text-slate-400">{{ t('preschoolAttendanceDashboardPage.messages.loadFailed') }}</div>
        <div v-else-if="!classSummary.length" class="px-4 py-8 text-center text-sm text-slate-400">{{ t('preschoolAttendanceDashboardPage.breakdown.empty') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3 font-semibold">{{ t('preschoolAttendanceDashboardPage.breakdown.columns.class') }}</th>
                <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceDashboardPage.breakdown.columns.total') }}</th>
                <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceDashboardPage.breakdown.columns.present') }}</th>
                <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceDashboardPage.breakdown.columns.absent') }}</th>
                <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceDashboardPage.breakdown.columns.late') }}</th>
                <th class="px-4 py-3 text-right font-semibold">{{ t('preschoolAttendanceDashboardPage.breakdown.columns.rate') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="row in classSummary" :key="row.name">
                <td class="px-4 py-3 font-medium text-slate-900">{{ row.name }}</td>
                <td class="px-4 py-3 text-right text-slate-600">{{ row.total }}</td>
                <td class="px-4 py-3 text-right text-emerald-600">{{ row.present }}</td>
                <td class="px-4 py-3 text-right text-rose-600">{{ row.absent }}</td>
                <td class="px-4 py-3 text-right text-amber-600">{{ row.late }}</td>
                <td class="px-4 py-3 text-right font-semibold" :class="rateColor(row.rate)">{{ row.rate }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </MainLayout>
</template>
