<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  roleFilter: {
    type: String,
    default: '',
  },
  divisionFilter: {
    type: String,
    default: '',
  },
  teamFilter: {
    type: String,
    default: '',
  },
  statusFilter: {
    type: String,
    default: '',
  },
  roleOptions: {
    type: Array,
    default: () => [],
  },
  divisionOptions: {
    type: Array,
    default: () => [],
  },
  teamOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  /**
   * Controls where status labels are localized from.
   * Default stays on `common.status.*` for user/account screens.
   * Sport/player screens can override (ex: `sportPlayerInformation.status`).
   */
  statusKeyPrefix: {
    type: String,
    default: 'common.status',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showRoleFilter: {
    type: Boolean,
    default: true,
  },
  showDivisionFilter: {
    type: Boolean,
    default: false,
  },
  showTeamFilter: {
    type: Boolean,
    default: false,
  },
  showStatusFilter: {
    type: Boolean,
    default: true,
  },
  showClearButton: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'update:roleFilter',
  'update:divisionFilter',
  'update:teamFilter',
  'update:statusFilter',
  'clear',
])
const { t, te } = useLanguage()

const hasRoleOptions = computed(() => props.showRoleFilter && props.roleOptions.length > 0)
const hasDivisionOptions = computed(
  () => props.showDivisionFilter && props.divisionOptions.length > 0,
)
const hasTeamOptions = computed(() => props.showTeamFilter && props.teamOptions.length > 0)
const hasStatusOptions = computed(() => props.showStatusFilter && props.statusOptions.length > 0)
const hasActiveFilters = computed(
  () => Boolean(props.roleFilter || props.divisionFilter || props.teamFilter || props.statusFilter),
)

function normalizeKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function roleLabel(role) {
  const key = `common.role.${normalizeKey(role)}`
  // Avoid `[intlify] Not found ...` warnings by checking key existence first.
  return te(key) ? t(key) : role
}

function statusLabel(status) {
  // Allow each domain to own its own status vocabulary (users != players).
  const key = `${props.statusKeyPrefix}.${normalizeKey(status)}`
  return te(key) ? t(key) : status
}

function divisionLabel(division) {
  const key = `common.division.${normalizeKey(division)}`
  return te(key) ? t(key) : division
}

function teamLabel(team) {
  const key = `common.team.${normalizeKey(team)}`
  return te(key) ? t(key) : team
}

const mappedRoleOptions = computed(() => [
  { label: t('common.allRoles'), value: '' },
  ...props.roleOptions.map((role) => ({
    label: roleLabel(role),
    value: role,
  })),
])

const mappedDivisionOptions = computed(() => [
  { label: t('common.allDivisions') || 'All Divisions', value: '' },
  ...props.divisionOptions.map((division) => ({
    label: divisionLabel(division),
    value: division,
  })),
])

const mappedTeamOptions = computed(() => [
  { label: t('common.allTeams') || 'All Teams', value: '' },
  ...props.teamOptions.map((team) => ({
    label: teamLabel(team),
    value: team,
  })),
])

const mappedStatusOptions = computed(() => [
  { label: t('common.allStatus'), value: '' },
  ...props.statusOptions.map((status) => ({
    label: statusLabel(status),
    value: status,
  })),
])

const selectPt = {
  root: {
    class: [
      '!min-h-[2.9rem]',
      '!rounded-[0.9rem]',
      '!border',
      '!border-surface-300',
      '!bg-white',
      '!shadow-none',
      'transition-all',
      'duration-200',
      'hover:enabled:!border-surface-400',
      'focus-within:!border-brand-400',
      'focus-within:!shadow-focus',
      'max-sm:!min-h-11',
    ],
  },
  label: {
    class:
      '!flex !min-h-[2.9rem] !items-center !bg-transparent !px-[0.9rem] !py-[0.8rem] !text-[0.9rem] !text-surface-900 max-sm:!min-h-11 max-sm:!text-[0.88rem]',
  },
  dropdown: {
    class: '!w-[2.8rem] !bg-transparent !text-surface-500',
  },
  overlay: {
    class:
      '!mt-[0.3rem] !rounded-[0.9rem] !border !border-surface-200 !bg-white !shadow-[0_12px_24px_-18px_rgba(15,23,42,0.16)]',
  },
  listContainer: {
    class: '!bg-white !p-[0.35rem]',
  },
  option: {
    class:
      '!rounded-[0.65rem] !bg-white !text-surface-900 hover:!bg-slate-50 data-[p-selected=true]:!bg-brand-50 data-[p-selected=true]:!text-brand-700',
  },
}

function clearFilters() {
  emit('update:roleFilter', '')
  emit('update:divisionFilter', '')
  emit('update:teamFilter', '')
  emit('update:statusFilter', '')
  emit('clear')
}
</script>

<template>
  <div class="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
    <Select
      v-if="hasRoleOptions"
      input-id="userRoleFilter"
      :model-value="roleFilter"
      :options="mappedRoleOptions"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      append-to="self"
      class="ui-filter-select w-full sm:w-40"
      :pt="selectPt"
      @update:model-value="emit('update:roleFilter', $event)"
    />

    <Select
      v-if="hasDivisionOptions"
      input-id="userDivisionFilter"
      :model-value="divisionFilter"
      :options="mappedDivisionOptions"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      append-to="self"
      class="ui-filter-select w-full sm:w-44"
      :pt="selectPt"
      @update:model-value="emit('update:divisionFilter', $event)"
    />

    <Select
      v-if="hasTeamOptions"
      input-id="userTeamFilter"
      :model-value="teamFilter"
      :options="mappedTeamOptions"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      append-to="self"
      class="ui-filter-select w-full sm:w-44"
      :pt="selectPt"
      @update:model-value="emit('update:teamFilter', $event)"
    />

    <Select
      v-if="hasStatusOptions"
      input-id="userStatusFilter"
      :model-value="statusFilter"
      :options="mappedStatusOptions"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      append-to="self"
      class="ui-filter-select w-full sm:w-44"
      :pt="selectPt"
      @update:model-value="emit('update:statusFilter', $event)"
    />

    <Button
      v-if="showClearButton"
      type="button"
      variant="outline"
      size="md"
      :disabled="disabled || !hasActiveFilters"
      @click="clearFilters"
    >
      {{ t('common.clear') }}
    </Button>
  </div>
</template>
