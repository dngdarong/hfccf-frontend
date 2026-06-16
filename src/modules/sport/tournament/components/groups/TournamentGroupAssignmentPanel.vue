<script setup>
import { computed, reactive, watch } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'TournamentGroupAssignmentPanel',
})

const props = defineProps({
  teams: {
    type: Array,
    default: () => [],
  },
  groupOptions: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['assign'])
const { t } = useLanguage()
const selectedGroupMap = reactive({})

watch(
  () => [props.teams, props.groupOptions],
  ([teams = [], groupOptions = []]) => {
    const teamIds = new Set((Array.isArray(teams) ? teams : []).map((team) => String(team?.id || '').trim()).filter(Boolean))
    const availableGroupIds = new Set((Array.isArray(groupOptions) ? groupOptions : []).map((option) => String(option?.value || '').trim()).filter(Boolean))

    Object.keys(selectedGroupMap).forEach((teamId) => {
      if (!teamIds.has(teamId)) {
        delete selectedGroupMap[teamId]
      }
    })

    ;(Array.isArray(teams) ? teams : []).forEach((team) => {
      const teamId = String(team?.id || '').trim()
      if (teamId && groupOptions.length) {
        const currentGroupId = String(selectedGroupMap[teamId] || '').trim()
        if (!currentGroupId || !availableGroupIds.has(currentGroupId)) {
          selectedGroupMap[teamId] = groupOptions[0].value
        }
      }
      if (teamId && !selectedGroupMap[teamId] && groupOptions.length) {
        selectedGroupMap[teamId] = groupOptions[0].value
      }
    })
  },
  { immediate: true, deep: true },
)

const hasTeams = computed(() => props.teams.length > 0)

function assignTeam(teamId) {
  const groupId = selectedGroupMap[teamId]
  if (!groupId || props.disabled) return
  emit('assign', { teamId, groupId })
}
</script>

<template>
  <section class="assignment-panel">
    <div class="assignment-panel__head">
      <div>
        <p class="assignment-panel__eyebrow">{{ t('sportTournament.groups.assignment.title') }}</p>
        <p class="assignment-panel__subtitle">{{ t('sportTournament.groups.assignment.subtitle') }}</p>
      </div>
    </div>

    <div v-if="hasTeams" class="assignment-panel__list">
      <article v-for="team in teams" :key="team.id" class="assignment-panel__item">
        <div class="assignment-panel__copy">
          <div class="assignment-panel__title-row">
            <h4 class="assignment-panel__title">{{ team.name }}</h4>
            <span v-if="team.seeded || (team.seedRank !== null && team.seedRank !== undefined)" class="assignment-panel__badge">
              {{ t('sportTournament.groups.seeded') }} #{{ team.seedRank }}
            </span>
          </div>
          <p class="assignment-panel__text">{{ team.status || '-' }}</p>
        </div>

        <div class="assignment-panel__controls">
          <Select
            v-model="selectedGroupMap[team.id]"
            :options="groupOptions"
            option-label="label"
            option-value="value"
            append-to="self"
            :disabled="disabled || !groupOptions.length"
            class="assignment-panel__select"
          />
          <Button
            type="button"
            class="rounded-xl"
            severity="info"
            :label="t('sportTournament.groups.assignTeam')"
            :disabled="disabled || !selectedGroupMap[team.id]"
            @click="assignTeam(team.id)"
          />
        </div>
      </article>
    </div>

    <div v-else class="assignment-panel__empty">
      {{ t('sportTournament.groups.assignment.empty') }}
    </div>
  </section>
</template>

<style scoped>
.assignment-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.1rem;
  border: 1px solid #dce6f2;
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 25px 55px -40px rgba(15, 23, 42, 0.45);
}

.assignment-panel__eyebrow {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
}

.assignment-panel__subtitle {
  margin: 0.35rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
}

.assignment-panel__list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.assignment-panel__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  gap: 0.9rem;
  align-items: center;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(248, 250, 252, 0.96);
}

.assignment-panel__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.assignment-panel__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.assignment-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 0.98rem;
  line-height: 1.35;
  font-weight: 800;
}

.assignment-panel__badge {
  padding: 0.16rem 0.5rem;
  border-radius: 999px;
  background: rgba(0, 174, 239, 0.12);
  color: #0369a1;
  font-size: 0.72rem;
  font-weight: 800;
}

.assignment-panel__text {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.4;
}

.assignment-panel__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.7rem;
  align-items: center;
}

.assignment-panel__select {
  width: 100%;
}

.assignment-panel__empty {
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  border: 1px dashed #cbd5e1;
  background: rgba(248, 250, 252, 0.96);
  color: #64748b;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .assignment-panel__item {
    grid-template-columns: 1fr;
  }

  .assignment-panel__controls {
    grid-template-columns: 1fr;
  }
}
</style>
