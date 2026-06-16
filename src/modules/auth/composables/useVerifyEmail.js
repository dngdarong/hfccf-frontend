import { computed, reactive, watch } from 'vue'

export function useVerifyEmail(props, emit) {
  const form = reactive({
    email: props.email || '',
  })

  const touched = reactive({
    email: false,
  })

  watch(
    () => props.email,
    (value) => {
      if (value !== form.email) {
        form.email = value
      }
    },
  )

  watch(
    () => form.email,
    (value) => {
      emit('update:email', value)
    },
  )

  const normalizedEmail = computed(() => form.email.trim())

  const emailError = computed(() => {
    if (!touched.email) return ''

    if (!normalizedEmail.value) {
      return props.t('auth.forgotPassword.verifyEmail.errors.required')
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail.value)

    if (!isValidEmail) {
      return props.t('auth.forgotPassword.verifyEmail.errors.invalid')
    }

    return ''
  })

  const canSubmitCurrentStep = computed(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail.value)
  })

  function touchField(field) {
    touched[field] = true
  }

  function submitEmail() {
    touched.email = true

    if (!canSubmitCurrentStep.value) return

    emit('submit', {
      email: normalizedEmail.value,
    })
  }

  return {
    form,
    touched,
    normalizedEmail,
    emailError,
    canSubmitCurrentStep,
    touchField,
    submitEmail,
  }
}
