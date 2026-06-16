<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchSportCoaches, fetchSportTeams } from '@/modules/sport/services/sportApi'
import { useSportApprovals } from '@/modules/sport/admin/composables/useSportApprovals'

defineOptions({ name: 'SportCoachTeamAssignmentsPage' })

const { t, language } = useLanguage()
const { listCoachTeamAssignments, saveCoachTeamAssignment, deactivateCoachTeamAssignment } = useSportApprovals()
const assignments = ref([])
const coaches = ref([])
const teams = ref([])
const loading = ref(false)
const error = ref('')
const isKh = computed(() => language.value === 'KH')

const form = reactive({
  coachUserId: '',
  teamId: '',
  status: 'active',
})

const pageTitle = computed(() => t('sportCoachTeamManagement.assignments.title'))
const pageSubtitle = computed(() => t('sportCoachTeamManagement.assignments.subtitle'))

function tone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'success'
  if (value === 'inactive') return 'danger'
  return 'info'
}

async function refresh() {
  loading.value = true
  error.value = ''
  try {
    const [assignmentResponse, coachResponse, teamResponse] = await Promise.all([
      listCoachTeamAssignments(),
      fetchSportCoaches({ perPage: 100 }),
      fetchSportTeams({ perPage: 100 }),
    ])

    assignments.value = assignmentResponse.items || assignmentResponse.data || []
    coaches.value = coachResponse.items || []
    teams.value = teamResponse.items || []
  } catch (exception) {
    error.value = exception?.message || t('sportCoachTeamManagement.common.loadError')
  } finally {
    loading.value = false
  }
}

async function submit() {
  await saveCoachTeamAssignment({
    coach_user_id: form.coachUserId,
    team_id: form.teamId,
    status: form.status,
  })
  await refresh()
}

async function deactivate(row) {
  const id = String(row?.id || '').trim()
  if (!id) return
  await deactivateCoachTeamAssignment(id)
  await refresh()
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <MainLayout>
    <section :class="['sport-coach-page', { 'sport-coach-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="sport-coach-page__panel">
        <template #title>{{ t('sportCoachTeamManagement.assignments.formTitle') }}</template>
        <template #content>
          <div class="grid gap-4 md:grid-cols-3">
            <Select v-model="form.coachUserId" :options="coaches" option-label="fullName" option-value="id" :placeholder="t('sportCoachTeamManagement.common.selectCoach')" />
            <Select v-model="form.teamId" :options="teams" option-label="name" option-value="id" :placeholder="t('sportCoachTeamManagement.common.selectTeam')" />
            <Select v-model="form.status" :options="[{ label: t('sportCoachTeamManagement.common.active'), value: 'active' }, { label: t('sportCoachTeamManagement.common.inactive'), value: 'inactive' }]" option-label="label" option-value="value" />
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="m-0 text-sm text-red-600">{{ error }}</p>
            <Button :label="t('sportCoachTeamManagement.actions.saveAssignment')" :loading="loading" @click="submit" />
          </div>
        </template>
      </Card>

      <Card class="sport-coach-page__panel">
        <template #title>{{ t('sportCoachTeamManagement.assignments.listTitle') }}</template>
        <template #content>
          <DataTable :value="assignments" :loading="loading" data-key="id" striped-rows>
            <Column field="coach.name" :header="t('sportCoachTeamManagement.common.coach')" />
            <Column field="team.name" :header="t('sportCoachTeamManagement.common.team')" />
            <Column field="status" :header="t('sportCoachTeamManagement.common.status')">
              <template #body="{ data }">
                <StatusBadge :status="tone(data.status)" :label="data.status" size="sm" />
              </template>
            </Column>
            <Column :header="t('sportCoachTeamManagement.common.actions')">
              <template #body="{ data }">
                <Button size="small" text :label="t('sportCoachTeamManagement.actions.deactivate')" @click="deactivate(data)" />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </section>
  </MainLayout>
</template>

<style scoped>
.sport-coach-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-coach-page__panel {
  border-radius: 1.5rem;
  border: 1px solid #dbe6f4;
  box-shadow: 0 24px 48px -38px rgba(15, 23, 42, 0.45);
}

.sport-coach-page--kh {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>
