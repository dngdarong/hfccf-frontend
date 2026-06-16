import { computed, reactive } from 'vue'

export function useCreateNewPassword(props, emit) {
  const form = reactive({
    password: '',
    confirmPassword: '',
  })

  const touched = reactive({
    password: false,
    confirmPassword: false,
  })

  const passwordError = computed(() => {
    if (!touched.password) return ''
    if (!form.password) return props.t('auth.forgotPassword.createPassword.errors.passwordRequired')
    if (form.password.length < 8) return props.t('auth.forgotPassword.createPassword.errors.minPassword')
    return ''
  })

  const confirmPasswordError = computed(() => {
    if (!touched.confirmPassword) return ''
    if (!form.confirmPassword) {
      return props.t('auth.forgotPassword.createPassword.errors.confirmRequired')
    }
    if (form.confirmPassword !== form.password) {
      return props.t('auth.forgotPassword.createPassword.errors.mismatch')
    }
    return ''
  })

  const isFormValid = computed(
    () => form.password.length >= 8 && form.confirmPassword.length >= 8 && form.password === form.confirmPassword,
  )

  function touchField(field) {
    touched[field] = true
  }

  function submitPassword() {
    touched.password = true
    touched.confirmPassword = true

    if (!isFormValid.value) return

    emit('submit', {
      password: form.password,
    })
  }

  return {
    form,
    passwordError,
    confirmPasswordError,
    isFormValid,
    touchField,
    submitPassword,
  }
}
