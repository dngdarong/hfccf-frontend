<script setup>
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineProps({
  selectedTeamId: {
    type: String,
    required: true,
  },
  dateFrom: {
    type: String,
    required: true,
  },
  dateTo: {
    type: String,
    required: true,
  },
  searchQuery: {
    type: String,
    required: true,
  },
  teamOptions: {
    type: Array,
    required: true,
  },
  teamsLoading: {
    type: Boolean,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:selectedTeamId', 'update:dateFrom', 'update:dateTo', 'update:searchQuery', 'apply', 'reset', 'back'])

const { t } = useLanguage()

function handleApply() {
  emit('apply')
}

function handleReset() {
  emit('reset')
}

function handleBack() {
  emit('back')
}
</script>

<template>
  <div class="att-history-filter-bar">
    <label class="att-history-filter-field">
      <span class="att-history-filter-label">{{ t('sportAdminAttendanceHistoryPage.filters.team') }}</span>
      <select
        :value="selectedTeamId"
        class="att-history-filter-input"
        :disabled="teamsLoading"
        @change="emit('update:selectedTeamId', $event.target.value)"
      >
        <option value="">{{ t('sportAdminAttendanceHistoryPage.placeholders.team') }}</option>
        <option v-for="team in teamOptions" :key="team.value" :value="team.value">
          {{ team.label }}
        </option>
      </select>
    </label>

    <label class="att-history-filter-field">
      <span class="att-history-filter-label">{{ t('sportAdminAttendanceHistoryPage.filters.from') }}</span>
      <input
        :value="dateFrom"
        type="date"
        class="att-history-filter-input"
        @input="emit('update:dateFrom', $event.target.value)"
      >
    </label>

    <label class="att-history-filter-field">
      <span class="att-history-filter-label">{{ t('sportAdminAttendanceHistoryPage.filters.to') }}</span>
      <input
        :value="dateTo"
        type="date"
        class="att-history-filter-input"
        @input="emit('update:dateTo', $event.target.value)"
      >
    </label>

    <label class="att-history-filter-field att-history-filter-field--wide">
      <span class="att-history-filter-label">{{ t('sportAdminAttendanceHistoryPage.filters.search') }}</span>
      <input
        :value="searchQuery"
        type="search"
        class="att-history-filter-input"
        :placeholder="t('sportAdminAttendanceHistoryPage.placeholders.search')"
        @input="emit('update:searchQuery', $event.target.value)"
        @keyup.enter="handleApply"
      >
    </label>

    <Button type="button" variant="primary" size="md" rounded="xl" :disabled="loading" @click="handleApply">
      {{ t('sportAdminAttendanceHistoryPage.actions.apply') }}
    </Button>

    <Button type="button" variant="ghost" size="md" rounded="xl" :disabled="loading" @click="handleReset">
      {{ t('sportAdminAttendanceHistoryPage.actions.reset') }}
    </Button>

    <Button type="button" variant="ghost" size="md" rounded="xl" @click="handleBack">
      {{ t('sportAdminAttendanceHistoryPage.actions.back') }}
    </Button>
  </div>
</template>

<style scoped>
.att-history-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: end;
  padding: 1rem 1.15rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 20px 54px -42px rgba(15, 23, 42, 0.45);
}

.att-history-filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.att-history-filter-field--wide {
  min-width: 260px;
  flex: 1 1 260px;
}

.att-history-filter-label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.att-history-filter-input {
  height: 2.55rem;
  border-radius: 0.75rem;
  border: 1px solid #dbe4f0;
  padding: 0 0.85rem;
  color: #0f172a;
  background: #fff;
}
</style>
