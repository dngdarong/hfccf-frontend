<script setup>
/**
 * SearchInputField
 * --------------------------------------------------------------------------
 * Shared searchable text input component.
 *
 * Features:
 * - PrimeVue IconField integration
 * - i18n placeholder fallback
 * - Accessible hidden label
 * - Disabled state support
 * - Full-width responsive behavior
 * --------------------------------------------------------------------------
 */

import { computed } from 'vue'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'SearchInputField',
})

const props = defineProps({
  /**
   * Input value.
   */
  modelValue: {
    type: String,
    default: '',
  },

  /**
   * Disable search field.
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Optional placeholder override.
   */
  placeholder: {
    type: String,
    default: '',
  },

  /**
   * Input element ID.
   */
  inputId: {
    type: String,
    default: 'userSearchInput',
  },

  /**
   * Additional custom input classes.
   */
  inputClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useLanguage()

/**
 * Resolve localized placeholder.
 */
const resolvedPlaceholder = computed(() =>
  props.placeholder ||
  t('users.searchPlaceholder') ||
  t('common.searchUsersPlaceholder'),
)

/**
 * Final input classes.
 */
const inputClasses = computed(() =>
  [
    'ui-search-input w-full',
    props.inputClass,
  ]
    .filter(Boolean)
    .join(' ')
    .trim(),
)

/**
 * PrimeVue pass-through styling.
 */
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

/**
 * Emit normalized string value.
 */
function onInput(value) {
  emit('update:modelValue', String(value || ''))
}
</script>

<template>
  <label
    class="block w-full"
    :for="inputId"
  >
    <!-- Accessible hidden label -->
    <span class="sr-only">
      {{ resolvedPlaceholder }}
    </span>

    <!--
      PrimeVue IconField may shrink inside flex layouts.
      Force full-width behavior.
    -->
    <IconField
      icon-position="left"
      class="block w-full"
    >
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
        @update:model-value="onInput"
      />
    </IconField>
  </label>
</template>

<style scoped>
/**
 * Screen-reader-only helper.
 */
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

/**
 * Prevent IconField shrinking inside flex/grid layouts.
 */
:deep(.p-iconfield) {
  width: 100%;
  min-width: 0;
}

/**
 * Ensure input grows correctly.
 */
:deep(.p-iconfield .p-inputtext) {
  width: 100%;
  min-width: 0;
}

/**
 * Search icon color.
 */
:deep(.p-iconfield .p-inputicon) {
  color: var(--brand-surface-500);
}
</style>
