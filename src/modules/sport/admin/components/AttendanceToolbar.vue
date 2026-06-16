<script setup>
import Select from 'primevue/select'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

defineProps({
  teamId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  teamOptions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  teamsLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:teamId', 'update:date', 'shift-date', 'go-today', 'go-back'])

function handleTeamChange(value) {
  emit('update:teamId', value)
}

function handleDateChange(value) {
  emit('update:date', value)
}

function handleShiftDate(days) {
  emit('shift-date', days)
}

function handleGoToday() {
  emit('go-today')
}

function handleGoBack() {
  emit('go-back')
}
</script>

<template>
  <div class="att-toolbar">
    <label class="att-toolbar__field">
      <span class="att-toolbar__label">{{ t('sportAdminPlayerAttendancePage.filters.team') }}</span>
      <Select
        :model-value="teamId"
        :options="teamOptions"
        option-label="label"
        option-value="value"
        :placeholder="t('sportAdminPlayerAttendancePage.placeholders.team')"
        :disabled="loading || teamsLoading"
        class="min-w-[220px]"
        @update:model-value="handleTeamChange"
      />
    </label>

    <label class="att-toolbar__field">
      <span class="att-toolbar__label">{{ t('sportAdminPlayerAttendancePage.filters.date') }}</span>
      <div class="att-toolbar__date">
        <button
          type="button"
          class="att-toolbar__nav"
          :disabled="loading"
          @click="handleShiftDate(-1)"
        >
          &#8249;
        </button>
        <input
          :value="date"
          type="date"
          class="att-toolbar__date-input"
          :disabled="loading"
          @input="handleDateChange($event.target.value)"
        />
        <button
          type="button"
          class="att-toolbar__nav"
          :disabled="loading"
          @click="handleShiftDate(1)"
        >
          &#8250;
        </button>
      </div>
    </label>

    <Button type="button" variant="ghost" size="md" rounded="xl" :disabled="loading" @click="handleGoToday">
      Today
    </Button>

    <Button type="button" variant="ghost" size="md" rounded="xl" @click="handleGoBack">
      {{ t('sportAdminPlayerAttendancePage.actions.back') }}
    </Button>
  </div>
</template>

<style scoped>
.att-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  align-items: end;
  padding: 1rem 1.15rem;
  border-radius: 1.25rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 20px 54px -42px rgba(15, 23, 42, 0.45);
}

.att-toolbar__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.att-toolbar__label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.att-toolbar__date {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.att-toolbar__nav {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.75rem;
  border: 1px solid #dbe4f0;
  background: #fff;
  color: #475569;
  font-size: 1rem;
  font-weight: 700;
}

.att-toolbar__date-input {
  height: 2.4rem;
  border-radius: 0.75rem;
  border: 1px solid #dbe4f0;
  padding: 0 0.8rem;
  color: #0f172a;
  background: #fff;
}
</style>
