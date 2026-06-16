<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useCoachMatchRequests } from '../composables/useCoachMatchRequests'
import { useCoachTeams } from '../composables/useCoachTeams'
import { fetchSportTeams } from '@/modules/sport/services/sportApi'

defineOptions({ name: 'SportCoachMatchRequestPage' })

const route = useRoute()
const router = useRouter()
const { t, language } = useLanguage()
const { items: teams, loadTeams } = useCoachTeams()
const { createRequest, loading, error } = useCoachMatchRequests()
const opponentTeams = ref([])
const isKh = computed(() => language.value === 'KH')

const form = reactive({
  teamId: '',
  opponentTeamId: '',
  matchType: 'training',
  scheduledAt: '',
  venue: '',
  notes: '',
})

const pageTitle = computed(() => t('sportCoachTeamManagement.matchRequest.title'))
const pageSubtitle = computed(() => t('sportCoachTeamManagement.matchRequest.subtitle'))

async function submit() {
  await createRequest({
    team_id: form.teamId,
    opponent_team_id: form.opponentTeamId,
    match_type: form.matchType,
    scheduled_at: form.scheduledAt,
    venue: form.venue,
    notes: form.notes,
  })
  router.push({ name: 'dashboard-sport-coach-requests' })
}

onMounted(async () => {
  await loadTeams({ perPage: 100 })
  form.teamId = String(route.query.teamId || teams.value[0]?.id || '')

  fetchSportTeams({ perPage: 100 }).then((response) => {
    opponentTeams.value = response.items || []
  }).catch(() => {
    opponentTeams.value = []
  })
})
</script>

<template>
  <MainLayout>
    <section :class="['sport-coach-page', { 'sport-coach-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="sport-coach-page__panel">
        <template #title>
          {{ t('sportCoachTeamManagement.matchRequest.panelTitle') }}
        </template>
        <template #content>
          <div class="grid gap-4 md:grid-cols-2">
            <Select v-model="form.teamId" :options="teams" option-label="name" option-value="id" :placeholder="t('sportCoachTeamManagement.common.selectTeam')" />
            <Select v-model="form.opponentTeamId" :options="opponentTeams" option-label="name" option-value="id" :placeholder="t('sportCoachTeamManagement.common.selectOpponent')" />
            <Select v-model="form.matchType" :options="[{ label: t('sportCoachTeamManagement.common.trainingMatch'), value: 'training' }, { label: t('sportCoachTeamManagement.common.friendlyMatch'), value: 'friendly' }]" option-label="label" option-value="value" :placeholder="t('sportCoachTeamManagement.common.matchType')" />
            <InputText v-model="form.scheduledAt" :placeholder="t('sportCoachTeamManagement.common.scheduledAt')" />
          </div>
          <Textarea v-model="form.notes" class="mt-4 w-full" auto-resize rows="4" :placeholder="t('sportCoachTeamManagement.common.notes')" />
          <InputText v-model="form.venue" class="mt-4 w-full" :placeholder="t('sportCoachTeamManagement.common.venue')" />
          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="m-0 text-sm text-red-600">{{ error }}</p>
            <Button :label="t('sportCoachTeamManagement.actions.submitRequest')" :loading="loading" @click="submit" />
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
