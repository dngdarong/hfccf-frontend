<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'

defineOptions({
  name: 'AddPlayerPersonalInformationFields',
})

const props = defineProps({
  // Contact & demographics (part of personal information).
  phone: { type: String, default: '' },
  gender: { type: String, default: '' },
  age: { type: [Number, null], default: null },

  // Values
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

  // Options
  preferredFootOptions: { type: Array, default: () => ['Right', 'Left', 'Both'] },
  bloodTypeOptions: { type: Array, default: () => ['A', 'B', 'AB', 'O'] },
  genderOptions: { type: Array, default: () => ['male', 'female', 'other'] },

  // State
  isLocked: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:phone',
  'update:gender',
  'update:age',
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
])

const { t, te } = useI18n()

const labels = computed(() => ({
  sectionTitle: t('sportAddPlayer.personalInformation.title'),
  physicalAttributes: t('sportAddPlayer.personalInformation.physicalAttributes'),
  phone: t('sportAddPlayer.phone'),
  gender: t('sportAddPlayer.gender'),
  age: t('sportAddPlayer.age'),
  heightCm: t('sportAddPlayer.personalInformation.heightCm'),
  weightKg: t('sportAddPlayer.personalInformation.weightKg'),
  preferredFoot: t('sportAddPlayer.personalInformation.preferredFoot'),
  bloodType: t('sportAddPlayer.personalInformation.bloodType'),
  village: t('sportAddPlayer.personalInformation.village'),
  commune: t('sportAddPlayer.personalInformation.commune'),
  district: t('sportAddPlayer.personalInformation.district'),
  province: t('sportAddPlayer.personalInformation.province'),
  currentSchool: t('sportAddPlayer.personalInformation.currentSchool'),
  gradeYear: t('sportAddPlayer.personalInformation.gradeYear'),
}))

const placeholders = computed(() => ({
  phone: t('sportAddPlayer.phonePlaceholder'),
  gender: t('sportAddPlayer.genderPlaceholder'),
  preferredFoot: t('sportAddPlayer.personalInformation.preferredFootPlaceholder'),
  bloodType: t('sportAddPlayer.personalInformation.bloodTypePlaceholder'),
  village: t('sportAddPlayer.personalInformation.villagePlaceholder'),
  commune: t('sportAddPlayer.personalInformation.communePlaceholder'),
  district: t('sportAddPlayer.personalInformation.districtPlaceholder'),
  province: t('sportAddPlayer.personalInformation.provincePlaceholder'),
  currentSchool: t('sportAddPlayer.personalInformation.currentSchoolPlaceholder'),
  gradeYear: t('sportAddPlayer.personalInformation.gradeYearPlaceholder'),
}))

const preferredFootSelectOptions = computed(() =>
  props.preferredFootOptions.map((value) => ({ label: value, value })),
)

const bloodTypeSelectOptions = computed(() =>
  props.bloodTypeOptions.map((value) => ({ label: value, value })),
)

function genderLabel(value) {
  const key = `sportAddPlayer.genderOptions.${String(value || '').trim().toLowerCase()}`
  return te(key) ? t(key) : String(value || '')
}

const genderSelectOptions = computed(() =>
  props.genderOptions.map((value) => ({ label: genderLabel(value), value })),
)

// Keep select styling consistent with the other fields on the Add Player form.
const selectPt = {
  root: {
    class:
      '!min-h-[3rem] !rounded-xl !border !border-surface-300 !bg-white transition-all duration-200 hover:enabled:!border-surface-400 focus-within:!border-brand-400 focus-within:!shadow-focus',
  },
  label: { class: '!px-4 !py-3 !text-sm !text-surface-900' },
  dropdown: { class: '!w-12 !bg-transparent !text-surface-500' },
  overlay: {
    class:
      '!mt-1 !rounded-xl !border !border-surface-200 !bg-white !shadow-[0_12px_24px_-18px_rgba(15,23,42,0.16)]',
  },
  listContainer: { class: '!bg-white !p-1.5' },
  option: {
    class:
      '!rounded-lg !bg-white !text-surface-900 hover:!bg-slate-50 data-[p-selected=true]:!bg-brand-50 data-[p-selected=true]:!text-brand-700',
  },
}
</script>

<template>
  <section class="rounded-[14px] border border-[#e5e7eb] bg-white p-6 sm:p-7">
    <header class="flex items-start gap-3">
      <div
        class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-orange-500 text-[0.8rem] font-bold text-white"
        aria-hidden="true"
      >
        1
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="text-[1.05rem] font-semibold text-slate-900">
          {{ labels.sectionTitle }}
        </h2>
        <div class="mt-3 h-px w-full bg-[#e5e7eb]" role="presentation"></div>
        <p class="mt-3 text-[0.85rem] font-semibold uppercase tracking-[0.08em] text-slate-500">
          {{ labels.physicalAttributes }}
        </p>
      </div>
    </header>

    <div class="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Arrange by what is typically collected first: contact/demographics, then body metrics, then address, then school info. -->
      <label class="md:col-span-2">
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.phone }}
        </span>
      <InputText
        :model-value="phone"
        :disabled="isLocked"
        :placeholder="placeholders.phone"
          class="mt-2 w-full"
        @update:model-value="emit('update:phone', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.gender }}
        </span>
      <Select
        :model-value="gender"
        :options="genderSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.gender"
        append-to="self"
          class="mt-2 w-full"
        :pt="selectPt"
        @update:model-value="emit('update:gender', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.age }}
        </span>
      <InputNumber
        :model-value="age"
        :disabled="isLocked"
        :min="0"
          class="mt-2 w-full"
        input-class="w-full"
        @update:model-value="emit('update:age', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.heightCm }}
        </span>
      <InputNumber
        :model-value="heightCm"
        :disabled="isLocked"
        :min="0"
          class="mt-2 w-full"
        input-class="w-full"
        @update:model-value="emit('update:heightCm', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.weightKg }}
        </span>
      <InputNumber
        :model-value="weightKg"
        :disabled="isLocked"
        :min="0"
          class="mt-2 w-full"
        input-class="w-full"
        @update:model-value="emit('update:weightKg', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.preferredFoot }}
        </span>
      <Select
        :model-value="preferredFoot"
        :options="preferredFootSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.preferredFoot"
        append-to="self"
          class="mt-2 w-full"
        :pt="selectPt"
        @update:model-value="emit('update:preferredFoot', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.bloodType }}
        </span>
      <Select
        :model-value="bloodType"
        :options="bloodTypeSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.bloodType"
        append-to="self"
          class="mt-2 w-full"
        :pt="selectPt"
        @update:model-value="emit('update:bloodType', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.province }}
        </span>
      <InputText
        :model-value="province"
        :disabled="isLocked"
        :placeholder="placeholders.province"
          class="mt-2 w-full"
        @update:model-value="emit('update:province', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.district }}
        </span>
      <InputText
        :model-value="district"
        :disabled="isLocked"
        :placeholder="placeholders.district"
          class="mt-2 w-full"
        @update:model-value="emit('update:district', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.commune }}
        </span>
      <InputText
        :model-value="commune"
        :disabled="isLocked"
        :placeholder="placeholders.commune"
          class="mt-2 w-full"
        @update:model-value="emit('update:commune', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.village }}
        </span>
      <InputText
        :model-value="village"
        :disabled="isLocked"
        :placeholder="placeholders.village"
          class="mt-2 w-full"
        @update:model-value="emit('update:village', $event)"
      />
    </label>

      <label class="md:col-span-2">
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.currentSchool }}
        </span>
      <InputText
        :model-value="currentSchool"
        :disabled="isLocked"
        :placeholder="placeholders.currentSchool"
          class="mt-2 w-full"
        @update:model-value="emit('update:currentSchool', $event)"
      />
    </label>

      <label class="md:col-span-2">
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.gradeYear }}
        </span>
      <InputText
        :model-value="gradeYear"
        :disabled="isLocked"
        :placeholder="placeholders.gradeYear"
          class="mt-2 w-full"
        @update:model-value="emit('update:gradeYear', $event)"
      />
    </label>
    </div>
  </section>
</template>
