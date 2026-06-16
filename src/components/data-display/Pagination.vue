<script setup>
/**
 * UiPagination
 * --------------------------------------------------------------------------
 * Shared pagination wrapper using PrimeVue Paginator.
 *
 * Features:
 * - 1-based page model
 * - Consistent project styling
 * - Configurable visible page count
 * - Disabled state support
 * - Emits update:modelValue and change
 * --------------------------------------------------------------------------
 */

import { computed } from 'vue'
import Paginator from 'primevue/paginator'

defineOptions({
  name: 'UiPagination',
})

const props = defineProps({
  /**
   * Current page number (1-based).
   */
  modelValue: {
    type: Number,
    default: 1,
  },

  /**
   * Total available pages.
   */
  totalPages: {
    type: Number,
    required: true,
  },

  /**
   * Number of visible page buttons.
   */
  maxVisible: {
    type: Number,
    default: 5,
  },

  /**
   * Disable pagination interaction.
   */
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'change',
])

/**
 * PrimeVue paginator works with:
 * - first
 * - rows
 * - totalRecords
 *
 * We simulate pagination using:
 * 1 row = 1 page
 */
const rows = 1

/**
 * Safe normalized current page.
 */
const currentPage = computed(() =>
  Math.max(Number(props.modelValue) || 1, 1),
)

/**
 * Safe normalized total pages.
 */
const safeTotalPages = computed(() =>
  Math.max(Number(props.totalPages) || 1, 1),
)

/**
 * PrimeVue first record index.
 */
const first = computed(() =>
  (currentPage.value - 1) * rows,
)

/**
 * Fake total records for paginator.
 */
const totalRecords = computed(() =>
  safeTotalPages.value * rows,
)

/**
 * PrimeVue pass-through styling.
 */
const paginationPt = computed(() => ({
  root: {
    class: [
      '!border-0',
      '!bg-transparent',
      '!p-0',
      '!justify-end',
      props.disabled
        ? 'pointer-events-none opacity-50'
        : '',
    ],
  },

  content: {
    class: '!gap-2',
  },

  pages: {
    class: '!gap-2',
  },

  pageButton: {
    class: [
      '!min-h-9',
      '!min-w-9',
      '!rounded-xl',
      '!border',
      '!border-surface-300',
      '!bg-white',
      '!text-hope-dark',
      '!shadow-sm',
      'transition-all',
      'duration-200',
      'hover:enabled:!border-brand-300',
      'hover:enabled:!bg-brand-50',
      'hover:enabled:!text-brand-700',
      'focus-visible:!outline-none',
      'focus-visible:!shadow-focus',
    ],
  },

  previousPageButton: {
    class: [
      '!min-h-9',
      '!min-w-9',
      '!rounded-xl',
      '!border',
      '!border-surface-300',
      '!bg-white',
      '!text-surface-600',
      '!shadow-sm',
      'transition-all',
      'duration-200',
      'hover:enabled:!border-brand-300',
      'hover:enabled:!bg-brand-50',
      'hover:enabled:!text-brand-700',
      'focus-visible:!outline-none',
      'focus-visible:!shadow-focus',
    ],
  },

  nextPageButton: {
    class: [
      '!min-h-9',
      '!min-w-9',
      '!rounded-xl',
      '!border',
      '!border-surface-300',
      '!bg-white',
      '!text-surface-600',
      '!shadow-sm',
      'transition-all',
      'duration-200',
      'hover:enabled:!border-brand-300',
      'hover:enabled:!bg-brand-50',
      'hover:enabled:!text-brand-700',
      'focus-visible:!outline-none',
      'focus-visible:!shadow-focus',
    ],
  },
}))

/**
 * Handle page change event.
 */
function onPage(event) {
  if (props.disabled) return

  const nextPage = Math.floor(event.first / rows) + 1

  // Prevent unnecessary emits
  if (nextPage === currentPage.value) {
    return
  }

  emit('update:modelValue', nextPage)
  emit('change', nextPage)
}
</script>

<template>
  <Paginator
    :first="first"
    :rows="rows"
    :total-records="totalRecords"
    :page-link-size="maxVisible"
    :template="{
      default: 'PrevPageLink PageLinks NextPageLink',
    }"
    class="ui-pagination"
    :pt="paginationPt"
    @page="onPage"
  />
</template>
