<script setup>
import { computed } from 'vue'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  inputId: {
    type: String,
    default: 'userSearchInput',
  },
  inputClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useLanguage()

const resolvedPlaceholder = computed(
  () => props.placeholder || t('users.searchPlaceholder') || t('common.searchUsersPlaceholder'),
)

const inputClasses = computed(() =>
  [
    'ui-search-input w-full',
    props.inputClass,
  ]
    .join(' ')
    .trim(),
)

const inputPt = {
  root: {
    class: [
      '!w-full',
      '!rounded-[0.9rem]',
      '!border-surface-300',
      '!bg-white',
      '!py-[0.85rem]',
      '!pr-4',
      '!pl-11',
      '!text-surface-900',
      '!shadow-[0_1px_2px_rgba(15,23,42,0.05)]',
      'transition-all',
      'duration-200',
      'hover:enabled:!border-surface-400',
      'focus:!border-brand-500',
      'focus:!shadow-focus',
    ],
  },
}
</script>

<template>
  <label class="block w-full" :for="inputId">
    <span class="sr-only">{{ resolvedPlaceholder }}</span>
    <!--
      PrimeVue `IconField` can shrink-to-fit inside flex layouts in some screens.
      Force it to behave like a full-width field so only the icon doesn't remain visible.
    -->
    <IconField icon-position="left" class="block w-full">
      <InputIcon class="pi pi-search" />
      <InputText
        :id="inputId"
        :model-value="modelValue"
        type="search"
        :placeholder="resolvedPlaceholder"
        :class="inputClasses"
        :disabled="disabled"
        :pt="inputPt"
        autocomplete="off"
        spellcheck="false"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </IconField>
  </label>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

:deep(.p-iconfield) {
  width: 100%;
  min-width: 0; /* Allows the input to shrink properly inside flex rows. */
}

:deep(.p-iconfield .p-inputtext) {
  width: 100%;
  min-width: 0;
}

:deep(.p-iconfield .p-inputicon) {
  color: var(--brand-surface-500);
}
</style>
