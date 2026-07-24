<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { useCoachPlayerRequests } from '../composables/useCoachPlayerRequests'
import { useCoachTeams } from '../composables/useCoachTeams'

defineOptions({ name: 'SportCoachAddPlayerRequestPage' })

const route = useRoute()
const router = useRouter()
const { t, language } = useLanguage()
const { items: teams, loadTeams } = useCoachTeams()
const { createRequest, loading, error } = useCoachPlayerRequests()
const isKh = computed(() => language.value === 'KH')

const form = reactive({
  teamId: '',
  name: '',
  jerseyNumber: '',
  primaryPosition: '',
  notes: '',
})

const pageTitle = computed(() => t('sportCoachTeamManagement.playerRequest.title'))
const pageSubtitle = computed(() => t('sportCoachTeamManagement.playerRequest.subtitle'))

async function submit() {
  const payload = {
    name: form.name,
    jersey_number: form.jerseyNumber,
    primary_position: form.primaryPosition,
    notes: form.notes,
  }

  await createRequest(form.teamId, payload)
  router.push({ name: 'dashboard-sport-coach-requests' })
}

onMounted(async () => {
  await loadTeams({ perPage: 100 })
  form.teamId = String(route.query.teamId || teams.value[0]?.id || '')
})
</script>

<template>
  <MainLayout>
    <section :class="['sport-coach-page', { 'sport-coach-page--kh': isKh }]">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <Card class="sport-coach-page__panel">
        <template #title>
          {{ t('sportCoachTeamManagement.playerRequest.panelTitle') }}
        </template>
        <template #content>
          <div class="grid gap-4 md:grid-cols-2">
            <Select v-model="form.teamId" :options="teams" option-label="name" option-value="id" :placeholder="t('sportCoachTeamManagement.common.selectTeam')" />
            <InputText v-model="form.name" :placeholder="t('sportCoachTeamManagement.common.playerName')" />
            <InputText v-model="form.jerseyNumber" :placeholder="t('sportCoachTeamManagement.common.jerseyNumber')" />
            <InputText v-model="form.primaryPosition" :placeholder="t('sportCoachTeamManagement.common.position')" />
          </div>
          <Textarea v-model="form.notes" class="mt-4 w-full" auto-resize rows="4" :placeholder="t('sportCoachTeamManagement.common.notes')" />
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

