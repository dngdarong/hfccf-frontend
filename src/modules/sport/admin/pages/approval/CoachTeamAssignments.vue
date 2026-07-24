<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import Pagination from '@/components/data-display/Pagination.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchSportCoaches, fetchSportTeams } from '@/modules/sport/services/sportApi'
import { useSportApprovals } from '@/modules/sport/admin/composables/useSportApprovals'
import {
  coachDisplayName,
  resolveAssignmentErrorMessage,
  teamDisplayName,
} from './utils/coachTeamAssignmentsHelpers'

defineOptions({ name: 'SportCoachTeamAssignmentsPage' })

const { t, language } = useLanguage()
const {
  createCoachTeamAssignment,
  listCoachTeamAssignments,
  updateCoachTeamAssignment,
  deactivateCoachTeamAssignment,
} = useSportApprovals()
const assignments = ref([])
const currentPage = ref(1)
const pageSize = 5
const coaches = ref([])
const teams = ref([])
const loading = ref(false)
const error = ref('')
const editingAssignmentId = ref('')
const isKh = computed(() => language.value === 'KH')
const totalPages = computed(() => Math.max(Math.ceil(assignments.value.length / pageSize), 1))
const paginatedAssignments = computed(() => assignments.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))

const form = reactive({
  coachUserId: '',
  teamId: '',
  status: 'active',
})

const pageTitle = computed(() => t('sportCoachTeamManagement.assignments.title'))
const pageSubtitle = computed(() => t('sportCoachTeamManagement.assignments.subtitle'))
const formTitle = computed(() =>
  editingAssignmentId.value
    ? `${t('common.edit')} assignment`
    : t('sportCoachTeamManagement.assignments.formTitle'),
)
const submitLabel = computed(() =>
  editingAssignmentId.value
    ? t('sportCoachTeamManagement.actions.updateAssignment')
    : t('sportCoachTeamManagement.actions.saveAssignment'),
)

function tone(status) {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'success'
  if (value === 'inactive') return 'danger'
  return 'info'
}

function normalizeAssignmentUserId(row = {}) {
  return String(row?.coachUserId || row?.coach_user_id || row?.coach?.id || '').trim()
}

function normalizeAssignmentTeamId(row = {}) {
  return String(row?.teamId || row?.team_id || row?.team?.id || '').trim()
}

function resetForm() {
  editingAssignmentId.value = ''
  form.coachUserId = ''
  form.teamId = ''
  form.status = 'active'
}

function startEdit(row = {}) {
  editingAssignmentId.value = String(row?.id || row?.assignmentId || '').trim()
  form.coachUserId = normalizeAssignmentUserId(row)
  form.teamId = normalizeAssignmentTeamId(row)
  form.status = String(row?.status || 'active').trim() || 'active'
}

function cancelEdit() {
  resetForm()
  error.value = ''
}

function hasDuplicateActiveAssignment(coachUserId, teamId) {
  const targetCoachUserId = String(coachUserId || '').trim()
  const targetTeamId = String(teamId || '').trim()
  const currentId = String(editingAssignmentId.value || '').trim()

  if (!targetCoachUserId || !targetTeamId) return false

  return assignments.value.some((row) => {
    const rowId = String(row?.id || row?.assignmentId || '').trim()
    if (currentId && rowId === currentId) return false

    return (
      String(row?.status || '').toLowerCase() === 'active' &&
      normalizeAssignmentUserId(row) === targetCoachUserId &&
      normalizeAssignmentTeamId(row) === targetTeamId
    )
  })
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
    currentPage.value = 1
    coaches.value = (coachResponse.items || []).map((coach) => ({
      ...coach,
      id: String(coach?.id ?? '').trim(),
    }))
    teams.value = (teamResponse.items || []).map((team) => ({
      ...team,
      id: String(team?.id ?? '').trim(),
    }))
  } catch (exception) {
    error.value = exception?.message || t('sportCoachTeamManagement.common.loadError')
  } finally {
    loading.value = false
  }
}

async function submit() {
  const coachUserId = String(form.coachUserId || '').trim()
  const teamId = String(form.teamId || '').trim()

  if (hasDuplicateActiveAssignment(coachUserId, teamId)) {
    error.value = t('sportAdminSharedMessages.errors.assignmentExists')
    return
  }

  loading.value = true
  error.value = ''
  try {
    const payload = {
      coach_user_id: coachUserId,
      team_id: teamId,
      status: form.status,
    }

    if (editingAssignmentId.value) {
      await updateCoachTeamAssignment(editingAssignmentId.value, payload)
    } else {
      await createCoachTeamAssignment(payload)
    }
    resetForm()
    await refresh()
  } catch (exception) {
    error.value = resolveAssignmentErrorMessage(exception, t)
  } finally {
    loading.value = false
  }
}

async function deactivate(row) {
  const id = String(row?.id || '').trim()
  if (!id) return

  loading.value = true
  error.value = ''
  try {
    await deactivateCoachTeamAssignment(id)
    await refresh()
  } catch (exception) {
    error.value = resolveAssignmentErrorMessage(exception, t)
  } finally {
    loading.value = false
  }
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
        <template #title>{{ formTitle }}</template>
        <template #content>
          <div class="grid gap-4 md:grid-cols-3">
            <Select v-model="form.coachUserId" :options="coaches" option-label="fullName" option-value="id" :placeholder="t('sportCoachTeamManagement.common.selectCoach')" />
            <Select v-model="form.teamId" :options="teams" option-label="name" option-value="id" :placeholder="t('sportCoachTeamManagement.common.selectTeam')" />
            <Select v-model="form.status" :options="[{ label: t('sportCoachTeamManagement.common.active'), value: 'active' }, { label: t('sportCoachTeamManagement.common.inactive'), value: 'inactive' }]" option-label="label" option-value="value" />
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="m-0 text-sm text-red-600">{{ error }}</p>
            <div class="flex flex-wrap items-center justify-end gap-2">
              <Button
                v-if="editingAssignmentId"
                outlined
                :label="t('sportCoachTeamManagement.actions.cancel')"
                :disabled="loading"
                @click="cancelEdit"
              />
              <Button :label="submitLabel" :loading="loading" @click="submit" />
            </div>
          </div>
        </template>
      </Card>

      <Card class="sport-coach-page__panel">
        <template #title>{{ t('sportCoachTeamManagement.assignments.listTitle') }}</template>
        <template #content>
          <DataTable :value="paginatedAssignments" :loading="loading" data-key="id" striped-rows>
            <Column :header="t('sportCoachTeamManagement.common.coach')">
              <template #body="{ data }">
                {{ coachDisplayName(data) }}
              </template>
            </Column>
            <Column :header="t('sportCoachTeamManagement.common.team')">
              <template #body="{ data }">
                {{ teamDisplayName(data) }}
              </template>
            </Column>
            <Column field="status" :header="t('sportCoachTeamManagement.common.status')">
              <template #body="{ data }">
                <StatusBadge :status="tone(data.status)" :label="data.status" size="sm" />
              </template>
            </Column>
            <Column :header="t('sportCoachTeamManagement.common.actions')">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-2">
                  <Button size="small" outlined :label="t('common.edit')" @click="startEdit(data)" />
                  <Button size="small" text :label="t('sportCoachTeamManagement.actions.deactivate')" @click="deactivate(data)" />
                </div>
              </template>
            </Column>
          </DataTable>
          <div v-if="totalPages > 1" class="mt-4 flex justify-end">
            <Pagination v-model="currentPage" :total-pages="totalPages" />
          </div>
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

