<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentFormApi } from '../services/assessmentFormApi'
import { useToast } from 'primevue/usetoast'

defineOptions({ name: 'AssessmentScoringManagerPage' })

const route = useRoute()
const { t } = useLanguage()
const toast = useToast()

const scoringRules = ref([])
const riskLevels = ref([])
const isLoading = ref(false)

async function load() {
  isLoading.value = true
  try {
    const res = await assessmentFormApi.getScoring(route.params.id)
    scoringRules.value = res.data.data?.scoring_rules ?? []
    riskLevels.value = res.data.data?.risk_levels ?? []
  } finally {
    isLoading.value = false
  }
}

async function save() {
  await assessmentFormApi.updateScoring(route.params.id, {
    scoring_rules: scoringRules.value,
    risk_levels: riskLevels.value,
  })
  toast.add({ severity: 'success', summary: t('common.success'), life: 3000 })
}

onMounted(load)
</script>

<template>
  <MainLayout>
    <div class="scoring-manager">
      <HeaderSection :title="t('scoring.title')">
        <template #actions>
          <Button :label="t('common.save')" icon="pi pi-save" @click="save" />
        </template>
      </HeaderSection>

      <div class="scoring-guidance">
        <p class="scoring-guidance__item">
          <span class="scoring-guidance__icon">📊</span>
          <strong>Scoring rules:</strong> Define how points are calculated for each question or section
        </p>
        <p class="scoring-guidance__item">
          <span class="scoring-guidance__icon">⚠️</span>
          <strong>Risk levels:</strong> Categorize performance scores into risk tiers for identification
        </p>
        <p class="scoring-guidance__item">
          <span class="scoring-guidance__icon">💾</span>
          <strong>Save settings:</strong> Click Save to apply changes to this form's scoring logic
        </p>
      </div>

      <div class="scoring-manager__section">
        <h3>{{ t('scoring.scoringRules') }}</h3>
        <DataTable :value="scoringRules" :loading="isLoading">
          <Column field="rule_type" :header="t('scoring.ruleType')" />
          <Column field="max_score" :header="t('scoring.maxScore')" />
          <Column field="pass_score" :header="t('scoring.passScore')" />
          <Column field="weight" :header="t('scoring.weight')" />
        </DataTable>
      </div>

      <div class="scoring-manager__section">
        <h3>{{ t('scoring.riskLevels') }}</h3>
        <DataTable :value="riskLevels" :loading="isLoading">
          <Column field="level_name" :header="t('scoring.levelName')" />
          <Column field="min_score" :header="t('scoring.minScore')" />
          <Column field="max_score" :header="t('scoring.maxScore')" />
          <Column field="color" :header="t('scoring.color')" />
        </DataTable>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.scoring-manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.scoring-guidance {
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scoring-guidance__item {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: #1e40af;
}

.scoring-guidance__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.scoring-manager__section {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1.25rem;
}

.scoring-manager__section h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .scoring-guidance {
    gap: 0.5rem;
    padding: 1rem;
  }

  .scoring-guidance__item {
    font-size: 0.9rem;
  }
}
</style>
