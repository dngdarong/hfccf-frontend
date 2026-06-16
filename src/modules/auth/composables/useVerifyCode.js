import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

export function useVerifyCode(props, emit) {
  const form = reactive({
    code: '',
  })

  const touched = reactive({
    code: false,
  })

  const secondsLeft = ref(0)
  let countdownTimer = null

  const normalizedCode = computed(() => form.code.replace(/\D/g, '').slice(0, 6))

  const codeError = computed(() => {
    if (!touched.code) return ''
    if (!normalizedCode.value) return props.t('auth.forgotPassword.verifyCode.errors.required')
    if (normalizedCode.value.length !== 6) return props.t('auth.forgotPassword.verifyCode.errors.length')
    return ''
  })

  const canVerify = computed(() => normalizedCode.value.length === 6)
  const canResend = computed(() => secondsLeft.value === 0 && !props.resendLoading)

  const formattedTimer = computed(() => {
    const minutes = Math.floor(secondsLeft.value / 60)
    const seconds = String(secondsLeft.value % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  })

  function clearCountdown() {
    if (!countdownTimer) return

    window.clearInterval(countdownTimer)
    countdownTimer = null
  }

  function startCountdown() {
    clearCountdown()
    secondsLeft.value = Math.max(0, Number(props.countdownSeconds) || 0)

    if (secondsLeft.value === 0) return

    countdownTimer = window.setInterval(() => {
      secondsLeft.value = Math.max(0, secondsLeft.value - 1)

      if (secondsLeft.value === 0) {
        clearCountdown()
      }
    }, 1000)
  }

  watch(
    () => props.email,
    () => {
      form.code = ''
      touched.code = false
      startCountdown()
    },
  )

  onMounted(() => {
    startCountdown()
  })

  onBeforeUnmount(() => {
    clearCountdown()
  })

  function touchCode() {
    touched.code = true
  }

  function onCodeInput(value) {
    form.code = String(value || '').replace(/\D/g, '').slice(0, 6)
  }

  function onSubmit() {
    touched.code = true

    if (codeError.value) return

    emit('verify', {
      email: props.email,
      code: normalizedCode.value,
    })
  }

  function onResend() {
    if (!canResend.value) return

    form.code = ''
    touched.code = false

    emit('resend', {
      email: props.email,
    })

    startCountdown()
  }

  return {
    form,
    secondsLeft,
    codeError,
    canVerify,
    canResend,
    formattedTimer,
    touchCode,
    onCodeInput,
    onSubmit,
    onResend,
  }
}
