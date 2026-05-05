<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import AddAdminProfileImageField from '@/modules/super-admin/components/admin-management/AddAdminProfileImageField.vue'
import PersonalInformationFields from '@/modules/sport/admin/components/add-player/PersonalInformationFields.vue'
import SportsProfileStatusFields from '@/modules/sport/admin/components/add-player/SportsProfileStatusFields.vue'

defineOptions({
  name: 'AddPlayerFormFields',
})

const props = defineProps({
  profileImagePreview: {
    type: String,
    default: '',
  },
  // Personal Information (data fields stored on the player record).
  heightCm: { type: [Number, null], default: null },
  weightKg: { type: [Number, null], default: null },
  preferredFoot: { type: String, default: '' },
  bloodType: { type: String, default: '' },
  village: { type: String, default: '' },
  commune: { type: String, default: '' },
  district: { type: String, default: '' },
  province: { type: String, default: '' },
  currentSchool: { type: String, default: '' },
  gradeYear: { type: String, default: '' },
  // Sports profile & status
  primaryPosition: { type: String, default: '' },
  registrationStatus: { type: String, default: '' },
  name: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  team: {
    type: String,
    default: '',
  },
  division: {
    type: String,
    default: '',
  },
  jerseyNumber: {
    type: [Number, null],
    default: null,
  },
  age: {
    type: [Number, null],
    default: null,
  },
  status: {
    type: String,
    default: '',
  },
  matchesPlayed: {
    type: Number,
    default: 0,
  },
  goalsScored: {
    type: Number,
    default: 0,
  },
  teamOptions: {
    type: Array,
    default: () => [],
  },
  divisionOptions: {
    type: Array,
    default: () => [],
  },
  positionOptions: {
    type: Array,
    // Default to common football positions so the form still works without passing options.
    default: () => ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
  },
  preferredFootOptions: {
    type: Array,
    default: () => ['Right', 'Left', 'Both'],
  },
  bloodTypeOptions: {
    type: Array,
    default: () => ['A', 'B', 'AB', 'O'],
  },
  registrationStatusOptions: {
    type: Array,
    default: () => ['registered', 'pending', 'unregistered'],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  genderOptions: {
    type: Array,
    default: () => ['male', 'female', 'other'],
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  statusLabel: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'update:name',
  'update:phone',
  'update:gender',
  'update:team',
  'update:division',
  'update:jerseyNumber',
  'update:age',
  'update:status',
  'update:matchesPlayed',
  'update:goalsScored',
  'update:heightCm',
  'update:weightKg',
  'update:preferredFoot',
  'update:bloodType',
  'update:village',
  'update:commune',
  'update:district',
  'update:province',
  'update:currentSchool',
  'update:gradeYear',
  'update:primaryPosition',
  'update:registrationStatus',
  // Keep upload side-effects (validation, object URL cleanup) in the page layer.
  'profile-image-change',
  'profile-image-remove',
])

const { t } = useI18n()

const labels = computed(() => ({
  profileImage: t('sportAddPlayer.profileImage'),
  removeImage: t('sportAddPlayer.removeImage'),
  fullName: t('sportAddPlayer.fullName'),
  phone: t('sportAddPlayer.phone'),
  gender: t('sportAddPlayer.gender'),
  team: t('sportAddPlayer.team'),
  division: t('sportAddPlayer.division'),
  status: t('sportAddPlayer.status'),
  jerseyNumber: t('sportAddPlayer.jerseyNumber'),
  age: t('sportAddPlayer.age'),
  matchesPlayed: t('sportAddPlayer.matchesPlayed'),
  goalsScored: t('sportAddPlayer.goalsScored'),
}))

const placeholders = computed(() => ({
  fullName: t('sportAddPlayer.fullNamePlaceholder'),
  phone: t('sportAddPlayer.phonePlaceholder'),
  gender: t('sportAddPlayer.genderPlaceholder'),
  team: t('sportAddPlayer.teamPlaceholder'),
  division: t('sportAddPlayer.divisionPlaceholder'),
  jerseyNumber: t('sportAddPlayer.jerseyNumberPlaceholder'),
  age: t('sportAddPlayer.agePlaceholder'),
}))

const teamSelectOptions = computed(() =>
  props.teamOptions.map((value) => ({
    label: value,
    value,
  })),
)

const divisionSelectOptions = computed(() =>
  props.divisionOptions.map((value) => ({
    label: value,
    value,
  })),
)

const statusSelectOptions = computed(() =>
  props.statusOptions.map((value) => ({
    label: props.statusLabel(value),
    value,
  })),
)

function clampNonNegativeNumber(value) {
  const parsed = Number(value ?? 0)
  if (Number.isNaN(parsed)) return 0
  return Math.max(parsed, 0)
}

// Shared label style for PrimeVue field wrappers.
const labelClass = 'text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600'

const selectPt = {
  root: {
    class:
      '!min-h-[3rem] !rounded-xl !border !border-surface-300 !bg-white transition-all duration-200 hover:enabled:!border-surface-400 focus-within:!border-brand-400 focus-within:!shadow-focus',
  },
  label: {
    class: '!px-4 !py-3 !text-sm !text-surface-900',
  },
  dropdown: {
    class: '!w-12 !bg-transparent !text-surface-500',
  },
  overlay: {
    class:
      '!mt-1 !rounded-xl !border !border-surface-200 !bg-white !shadow-[0_12px_24px_-18px_rgba(15,23,42,0.16)]',
  },
  listContainer: {
    class: '!bg-white !p-1.5',
  },
  option: {
    class:
      '!rounded-lg !bg-white !text-surface-900 hover:!bg-slate-50 data-[p-selected=true]:!bg-brand-50 data-[p-selected=true]:!text-brand-700',
  },
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <AddAdminProfileImageField
      class="md:col-span-2"
      :title="labels.profileImage"
      :preview="profileImagePreview"
      :remove-label="labels.removeImage"
      :disabled="isLocked"
      @change="emit('profile-image-change', $event)"
      @remove="emit('profile-image-remove')"
    />

    <label class="md:col-span-2">
      <span :class="labelClass">{{ labels.fullName }}</span>
      <InputText
        :model-value="name"
        :disabled="isLocked"
        :placeholder="placeholders.fullName"
        class="mt-2 w-full"
        @update:model-value="emit('update:name', $event)"
      />
    </label>

    <PersonalInformationFields
      class="md:col-span-2"
      :phone="phone"
      :gender="gender"
      :age="age"
      :height-cm="heightCm"
      :weight-kg="weightKg"
      :preferred-foot="preferredFoot"
      :blood-type="bloodType"
      :village="village"
      :commune="commune"
      :district="district"
      :province="province"
      :current-school="currentSchool"
      :grade-year="gradeYear"
      :preferred-foot-options="preferredFootOptions"
      :blood-type-options="bloodTypeOptions"
      :gender-options="genderOptions"
      :is-locked="isLocked"
      @update:phone="emit('update:phone', $event)"
      @update:gender="emit('update:gender', $event)"
      @update:age="emit('update:age', $event)"
      @update:height-cm="emit('update:heightCm', $event)"
      @update:weight-kg="emit('update:weightKg', $event)"
      @update:preferred-foot="emit('update:preferredFoot', $event)"
      @update:blood-type="emit('update:bloodType', $event)"
      @update:village="emit('update:village', $event)"
      @update:commune="emit('update:commune', $event)"
      @update:district="emit('update:district', $event)"
      @update:province="emit('update:province', $event)"
      @update:current-school="emit('update:currentSchool', $event)"
      @update:grade-year="emit('update:gradeYear', $event)"
    />

    <SportsProfileStatusFields
      class="md:col-span-2"
      :primary-position="primaryPosition"
      :registration-status="registrationStatus"
      :position-options="positionOptions"
      :registration-status-options="registrationStatusOptions"
      :is-locked="isLocked"
      @update:primary-position="emit('update:primaryPosition', $event)"
      @update:registration-status="emit('update:registrationStatus', $event)"
    />

    <label>
      <span :class="labelClass">{{ labels.team }}</span>
      <Select
        :model-value="team"
        :options="teamSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.team"
        append-to="self"
        class="mt-2 w-full"
        :pt="selectPt"
        @update:model-value="emit('update:team', $event)"
      />
    </label>

    <label>
      <span :class="labelClass">{{ labels.division }}</span>
      <Select
        :model-value="division"
        :options="divisionSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.division"
        append-to="self"
        class="mt-2 w-full"
        :pt="selectPt"
        @update:model-value="emit('update:division', $event)"
      />
    </label>

    <label>
      <span :class="labelClass">{{ labels.status }}</span>
      <Select
        :model-value="status"
        :options="statusSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        append-to="self"
        class="mt-2 w-full"
        :pt="selectPt"
        @update:model-value="emit('update:status', $event)"
      />
    </label>

    <label>
      <span :class="labelClass">{{ labels.jerseyNumber }}</span>
      <InputNumber
        :model-value="jerseyNumber"
        :disabled="isLocked"
        :min="0"
        :placeholder="placeholders.jerseyNumber"
        class="mt-2 w-full"
        input-class="w-full"
        @update:model-value="emit('update:jerseyNumber', $event)"
      />
    </label>

    <label>
      <span :class="labelClass">{{ labels.matchesPlayed }}</span>
      <InputNumber
        :model-value="matchesPlayed"
        :disabled="isLocked"
        :min="0"
        class="mt-2 w-full"
        input-class="w-full"
        @update:model-value="emit('update:matchesPlayed', clampNonNegativeNumber($event))"
      />
    </label>

    <label>
      <span :class="labelClass">{{ labels.goalsScored }}</span>
      <InputNumber
        :model-value="goalsScored"
        :disabled="isLocked"
        :min="0"
        class="mt-2 w-full"
        input-class="w-full"
        @update:model-value="emit('update:goalsScored', clampNonNegativeNumber($event))"
      />
    </label>
  </div>
</template>
