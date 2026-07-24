<script setup>
/**
 * UiLogoutButton
 * --------------------------------------------------------------------------
 * Reusable logout button for sidebar/navigation areas.
 *
 * Features:
 * - Expanded and collapsed sidebar modes
 * - Optional confirmation dialog
 * - i18n fallback labels
 * - Loading/disabled protection
 * - Accessible icon-only mode
 * --------------------------------------------------------------------------
 */

import { computed, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'UiLogoutButton',
})

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
  rounded: {
    type: String,
    default: '2xl',
    validator: (value) => ['md', 'lg', 'xl', '2xl', 'full'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  showConfirm: {
    type: Boolean,
    default: true,
  },
  label: {
    type: String,
    default: '',
  },
  confirmType: {
    type: String,
    default: 'warning',
    validator: (value) => ['danger', 'warning', 'info'].includes(value),
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: '',
  },
  cancelText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['logout', 'cancel', 'click'])

const { t, te } = useLanguage()

const isConfirmOpen = ref(false)

/**
 * Resolve i18n text safely.
 */
function translate(key, fallback) {
  const value = te(key) ? t(key) : ''

  return value && value !== key
    ? value
    : fallback
}

/**
 * Resolved display labels.
 */
const resolvedLabel = computed(() =>
  props.label || translate('common.logout', 'Logout'),
)

const resolvedTitle = computed(() =>
  props.title || translate('common.logout', 'Logout'),
)

const resolvedMessage = computed(() =>
  props.message || translate('common.logoutConfirm', 'Are you sure you want to logout?'),
)

const resolvedConfirmText = computed(() =>
  props.confirmText || translate('common.logout', 'Logout'),
)

const resolvedCancelText = computed(() =>
  props.cancelText || translate('common.cancel', 'Cancel'),
)

const resolvedCaption = computed(() => {
  if (props.collapsed) return ''

  return translate('dashboard.nav.logoutCaption', 'End current session')
})

/**
 * Derived UI state.
 */
const isLocked = computed(() => props.disabled || props.loading)
const computedSize = computed(() => (props.collapsed ? 'sm' : props.size))
const shouldBlock = computed(() => (props.collapsed ? false : props.block))

/**
 * Radius classes.
 */
const roundedClass = computed(() => {
  const classes = {
    md: '!rounded-md',
    lg: '!rounded-lg',
    xl: '!rounded-xl',
    '2xl': '!rounded-2xl',
    full: '!rounded-full',
  }

  return classes[props.rounded] || classes['2xl']
})

/**
 * Size classes.
 */
const sizeClass = computed(() => {
  const classes = {
    xs: '!min-h-8 !px-2.5 !py-1.5 !text-xs',
    sm: '!min-h-9.5 !px-3 !py-2 !text-sm',
    md: '!min-h-11 !px-4 !py-2.5 !text-sm',
    lg: '!min-h-12 !px-4.5 !py-3 !text-base',
    xl: '!min-h-13 !px-5 !py-3.5 !text-base',
  }

  return classes[computedSize.value] || classes.md
})

/**
 * Root button classes.
 */
const rootClass = computed(() => {
  const classes = [
    'logout-button',
    'group',
    '!inline-flex',
    '!items-center',
    '!gap-0',
    '!border',
    '!font-bold',
    '!transition-all',
    '!duration-200',
    'focus-visible:!outline-none',
    'focus-visible:!shadow-focus',
    'active:enabled:scale-[0.98]',
    'disabled:!cursor-not-allowed',
    'disabled:!opacity-60',
    'disabled:!shadow-none',
    roundedClass.value,
    sizeClass.value,
  ]

  if (props.collapsed) {
    classes.push(
      '!h-11',
      '!w-11',
      '!min-w-0',
      '!justify-center',
      '!border-rose-200',
      '!bg-white',
      '!p-0',
      '!text-rose-700',
    )
  } else {
    classes.push(
      '!justify-start',
      '!border-rose-200',
      '!bg-rose-50',
      '!text-rose-700',
      '!px-3',
      '!py-2.5',
    )
  }

  if (shouldBlock.value) {
    classes.push('w-full')
  }

  return classes
})

/**
 * Icon shell classes.
 */
const iconShellClass = computed(() => [
  'inline-flex',
  'h-8.5',
  'w-8.5',
  'flex-none',
  'items-center',
  'justify-center',
  'rounded-xl',
  'border',
  'border-rose-200',
  'bg-white',
  'text-rose-600',
  'transition-colors',
  'duration-200',
  'group-hover:border-rose-300',
  'group-hover:text-rose-700',
])

/**
 * Handle primary button click.
 */
function onClick() {
  if (isLocked.value) return

  emit('click')

  if (props.showConfirm) {
    isConfirmOpen.value = true
    return
  }

  emit('logout')
}

/**
 * Confirm logout from dialog.
 */
function onConfirm() {
  if (isLocked.value) return

  isConfirmOpen.value = false
  emit('logout')
}

/**
 * Cancel logout confirmation.
 */
function onCancel() {
  if (props.loading) return

  isConfirmOpen.value = false
  emit('cancel')
}
</script>

<template>
  <div
    class="logout-button-wrap"
    :class="collapsed ? 'inline-flex' : 'w-full px-1'"
  >
    <AppButton
      type="button"
      variant="ghost"
      :disabled="isLocked"
      :loading="loading"
      :class="rootClass"
      :aria-label="resolvedLabel"
      @click="onClick"
    >
      <template #iconLeft>
        <span
          :class="iconShellClass"
          aria-hidden="true"
        >
          <i
            class="pi pi-sign-out text-[1rem]"
            aria-hidden="true"
          />
        </span>
      </template>

      <span
        v-if="!collapsed"
        class="flex flex-col"
      >
        <span class="font-bold text-rose-700">
          {{ resolvedLabel }}
        </span>

        <span class="text-xs text-slate-500">
          {{ resolvedCaption }}
        </span>
      </span>

      <span
        v-else
        class="sr-only"
      >
        {{ resolvedLabel }}
      </span>
    </AppButton>

    <AlertQuestion
      :show="isConfirmOpen"
      :loading="loading"
      :disabled="disabled"
      :title="resolvedTitle"
      :message="resolvedMessage"
      :confirm-text="resolvedConfirmText"
      :cancel-text="resolvedCancelText"
      :type="confirmType"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>
