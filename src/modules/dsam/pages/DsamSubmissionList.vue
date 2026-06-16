<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { dsamSubmissionApi } from '../services/dsamSubmissionApi'
import RiskBadge from '../components/shared/RiskBadge.vue'

defineOptions({ name: 'DsamSubmissionListPage' })

const router  = useRouter()
const items   = ref([])
const loading = ref(false)
const total   = ref(0)

const filters = ref({ status: null, risk_level: null })

const statusOptions   = ['draft','in_progress','submitted','under_review','approved','rejected'].map(v => ({ label: v, value: v }))
const riskOptions     = ['low','medium','high','critical'].map(v => ({ label: v, value: v }))
const statusSeverity  = { draft: 'secondary', in_progress: 'warn', submitted: 'info', under_review: 'warn', approved: 'success', rejected: 'danger' }

async function load() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.status)     params.status     = filters.value.status
    if (filters.value.risk_level) params.risk_level = filters.value.risk_level
    const res = await dsamSubmissionApi.list(params)
    items.value = res.data.data ?? []
    total.value = res.data.meta?.total ?? items.value.length
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="flex flex-col gap-6">
      <HeaderSection title="Assessments">
        <template #actions>
          <Button
            label="Start Assessment"
            icon="pi pi-plus"
            @click="router.push({ name: 'dsam-wizard' })"
          />
        </template>
      </HeaderSection>

      <!-- Filters -->
      <div class="flex gap-3">
        <Select
          v-model="filters.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          placeholder="All statuses"
          show-clear
          class="w-44"
          @change="load"
        />
        <Select
          v-model="filters.risk_level"
          :options="riskOptions"
          option-label="label"
          option-value="value"
          placeholder="All risk levels"
          show-clear
          class="w-44"
          @change="load"
        />
      </div>

      <DataTable :value="items" :loading="loading" class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <Column header="Student">
          <template #body="{ data }">
            <div>
              <p class="font-medium text-slate-800">{{ data.student?.full_name }}</p>
              <p class="text-xs text-slate-400">{{ data.student?.student_code }}</p>
            </div>
          </template>
        </Column>
        <Column header="Form">
          <template #body="{ data }">
            <span class="text-sm text-slate-700">{{ data.form_template?.name }}</span>
          </template>
        </Column>
        <Column header="Year" field="academic_year.name" />
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="statusSeverity[data.status] ?? 'secondary'" :value="data.status?.replace('_', ' ')" />
          </template>
        </Column>
        <Column header="Score">
          <template #body="{ data }">
            {{ data.score_percentage != null ? data.score_percentage.toFixed(1) + '%' : '—' }}
          </template>
        </Column>
        <Column header="Risk">
          <template #body="{ data }">
            <RiskBadge :level="data.risk_level" size="sm" />
          </template>
        </Column>
        <Column header="Actions">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button
                v-if="data.can_edit"
                icon="pi pi-pencil"
                size="sm"
                severity="secondary"
                title="Continue"
                @click="router.push({ name: 'dsam-wizard', query: { submission: data.uuid } })"
              />
              <Button
                icon="pi pi-eye"
                size="sm"
                severity="secondary"
                title="View"
                @click="router.push({ name: 'dsam-submission-detail', params: { id: data.uuid } })"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </MainLayout>
</template>
