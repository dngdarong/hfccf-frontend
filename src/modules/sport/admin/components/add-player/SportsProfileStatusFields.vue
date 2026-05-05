<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'

defineOptions({
  name: 'AddPlayerSportsProfileStatusFields',
})

const props = defineProps({
  // Values
  primaryPosition: { type: String, default: '' },
  registrationStatus: { type: String, default: '' },

  // Options
  positionOptions: { type: Array, default: () => [] },
  registrationStatusOptions: { type: Array, default: () => ['registered', 'pending', 'unregistered'] },

  // State
  isLocked: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:primaryPosition',
  'update:registrationStatus',
])

const { t, te } = useI18n()

const labels = computed(() => ({
  sectionTitle: t('sportAddPlayer.sportsProfileStatus.title'),
  primaryPosition: t('sportAddPlayer.sportsProfileStatus.primaryPosition'),
  registrationStatus: t('sportAddPlayer.sportsProfileStatus.registrationStatus'),
}))

const placeholders = computed(() => ({
  primaryPosition: t('sportAddPlayer.sportsProfileStatus.primaryPositionPlaceholder'),
  registrationStatus: t('sportAddPlayer.sportsProfileStatus.registrationStatusPlaceholder'),
}))

const positionSelectOptions = computed(() =>
  props.positionOptions.map((value) => ({ label: value, value })),
)

function registrationStatusLabel(value) {
  const key = `sportAddPlayer.sportsProfileStatus.registrationStatusOptions.${String(value || '')
    .trim()
    .toLowerCase()}`
  return te(key) ? t(key) : String(value || '')
}

const registrationStatusSelectOptions = computed(() =>
  props.registrationStatusOptions.map((value) => ({ label: registrationStatusLabel(value), value })),
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
        2
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="text-[1.05rem] font-semibold text-slate-900">
          {{ labels.sectionTitle }}
        </h2>
        <div class="mt-3 h-px w-full bg-[#e5e7eb]" role="presentation"></div>
      </div>
    </header>

    <div class="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- Arrange by typical entry flow: positions, then status fields. -->
      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.primaryPosition }}
        </span>
      <Select
        :model-value="primaryPosition"
        :options="positionSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.primaryPosition"
        append-to="self"
          class="mt-2 w-full"
        :pt="selectPt"
        @update:model-value="emit('update:primaryPosition', $event)"
      />
    </label>

      <label>
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.registrationStatus }}
        </span>
      <Select
        :model-value="registrationStatus"
        :options="registrationStatusSelectOptions"
        option-label="label"
        option-value="value"
        :disabled="isLocked"
        :placeholder="placeholders.registrationStatus"
        append-to="self"
          class="mt-2 w-full"
        :pt="selectPt"
        @update:model-value="emit('update:registrationStatus', $event)"
      />
    </label>
    </div>
  </section>
</template>
