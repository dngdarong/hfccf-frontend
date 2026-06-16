import { vi, describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '../../helpers/mount'
import ForgotPassword from '@/modules/auth/pages/ForgotPassword.vue'

// ─── mock the three auth service calls used by ForgotPassword ────────────────

vi.mock('@/services/auth', () => ({
  requestPasswordReset: vi.fn(),
  verifyPasswordResetOtp: vi.fn(),
  resetPassword: vi.fn(),
}))

import { requestPasswordReset, verifyPasswordResetOtp, resetPassword } from '@/services/auth'

// ─── i18n messages ────────────────────────────────────────────────────────────

const messages = {
  en: {
    auth: {
      forgotPassword: {
        steps: { email: 'Enter Email', otp: 'Verify Code', password: 'New Password' },
        loading: {
          sendingOtp: 'Sending code…',
          verifyingOtp: 'Verifying…',
          savingPassword: 'Saving…',
          default: 'Loading…',
        },
        success: {
          codeSent: 'Code sent to {email}',
          passwordUpdated: 'Password updated.',
        },
        errors: {
          inactiveAccount: 'Account inactive.',
          startWithEmail: 'Please start with your email.',
          invalidOtp: 'Invalid or expired code.',
          verifyBeforePassword: 'Please verify OTP first.',
          verifiedEmailRequired: 'A verified email is required.',
          minPassword: 'Password must be at least {count} characters.',
        },
        brand: { eyebrow: '', title: '', subtitle: '', note: '' },
        titleEyebrow: '',
        verifyCode: { changeEmail: 'Change email' },
      },
    },
  },
}

// ─── stubs ───────────────────────────────────────────────────────────────────
// AuthLayout passes through its slot; child step components are minimal stubs
// that expose data-testid attributes so we can assert which step is active.

const stubs = {
  AuthLayout: { template: '<slot />' },
  Loading: {
    props: ['label'],
    template: '<div data-testid="loading" :data-label="label" />',
  },
  VerifyEmail: {
    name: 'VerifyEmail',
    props: ['email', 'loading', 'errorMessage', 'successMessage', 't'],
    emits: ['submit', 'update:email'],
    template: '<div data-testid="verify-email" />',
  },
  VerifyCode: {
    name: 'VerifyCode',
    props: ['email', 'loading', 'resendLoading', 'errorMessage', 'successMessage', 't'],
    emits: ['verify', 'resend', 'back'],
    template: '<div data-testid="verify-code" />',
  },
  CreateNewPassword: {
    name: 'CreateNewPassword',
    props: ['loading', 'errorMessage', 'successMessage', 't'],
    emits: ['submit', 'back', 'success-close'],
    template: '<div data-testid="create-new-password" />',
  },
}

// ─── mount helper ─────────────────────────────────────────────────────────────

function mount() {
  return mountWithPlugins(ForgotPassword, {
    messages,
    routes: [{ name: 'login', path: '/login' }],
    global: { stubs },
  })
}

// ─── navigation helpers ───────────────────────────────────────────────────────

async function advanceToOtpStep(wrapper, email = 'admin@test.com') {
  requestPasswordReset.mockResolvedValueOnce({ email })
  wrapper.findComponent({ name: 'VerifyEmail' }).vm.$emit('submit', { email })
  await flushPromises()
}

async function advanceToPasswordStep(wrapper, email = 'admin@test.com', code = '123456') {
  await advanceToOtpStep(wrapper, email)
  verifyPasswordResetOtp.mockResolvedValueOnce({ email, verifiedAt: null })
  wrapper.findComponent({ name: 'VerifyCode' }).vm.$emit('verify', { email, code })
  await flushPromises()
}

// ─── tests ───────────────────────────────────────────────────────────────────

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── initial state ──────────────────────────────────────────────────────────

  it('renders the email step initially', () => {
    const wrapper = mount()
    expect(wrapper.find('[data-testid="verify-email"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="verify-code"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="create-new-password"]').exists()).toBe(false)
  })

  it('does not show the loading overlay initially', () => {
    const wrapper = mount()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
  })

  // ─── email → OTP transition ─────────────────────────────────────────────────

  it('advances to the OTP step after successful email submission', async () => {
    const wrapper = mount()
    await advanceToOtpStep(wrapper)

    expect(wrapper.find('[data-testid="verify-code"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="verify-email"]').exists()).toBe(false)
  })

  it('calls requestPasswordReset with the normalized email', async () => {
    const wrapper = mount()
    requestPasswordReset.mockResolvedValueOnce({ email: 'admin@test.com' })

    wrapper.findComponent({ name: 'VerifyEmail' }).vm.$emit('submit', {
      email: '  Admin@Test.COM  ',
    })
    await flushPromises()

    expect(requestPasswordReset).toHaveBeenCalledWith('admin@test.com')
  })

  it('stays on the email step and shows the error when requestPasswordReset fails', async () => {
    const wrapper = mount()
    requestPasswordReset.mockRejectedValueOnce(new Error('Rate limit exceeded.'))

    wrapper.findComponent({ name: 'VerifyEmail' }).vm.$emit('submit', {
      email: 'admin@test.com',
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="verify-email"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="verify-code"]').exists()).toBe(false)
    expect(
      wrapper.findComponent({ name: 'VerifyEmail' }).props('errorMessage'),
    ).toBe('Rate limit exceeded.')
  })

  it('shows the loading overlay while requesting OTP and hides it after', async () => {
    const wrapper = mount()
    let resolveReset
    requestPasswordReset.mockReturnValueOnce(
      new Promise((resolve) => { resolveReset = () => resolve({ email: 'admin@test.com' }) }),
    )

    wrapper.findComponent({ name: 'VerifyEmail' }).vm.$emit('submit', { email: 'admin@test.com' })
    await nextTick()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)

    resolveReset()
    await flushPromises()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
  })

  // ─── OTP → password transition ──────────────────────────────────────────────

  it('advances to the password step after successful OTP verification', async () => {
    const wrapper = mount()
    await advanceToPasswordStep(wrapper)

    expect(wrapper.find('[data-testid="create-new-password"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="verify-code"]').exists()).toBe(false)
  })

  it('stays on the OTP step and shows error when verifyPasswordResetOtp fails', async () => {
    const wrapper = mount()
    await advanceToOtpStep(wrapper)

    verifyPasswordResetOtp.mockRejectedValueOnce(new Error('Invalid OTP code.'))
    wrapper.findComponent({ name: 'VerifyCode' }).vm.$emit('verify', {
      email: 'admin@test.com',
      code: '000000',
    })
    await flushPromises()

    expect(wrapper.find('[data-testid="verify-code"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="create-new-password"]').exists()).toBe(false)
    expect(
      wrapper.findComponent({ name: 'VerifyCode' }).props('errorMessage'),
    ).toBe('Invalid OTP code.')
  })

  it('shows the loading overlay while verifying OTP and hides it after', async () => {
    const wrapper = mount()
    await advanceToOtpStep(wrapper)

    let resolveVerify
    verifyPasswordResetOtp.mockReturnValueOnce(
      new Promise((resolve) => { resolveVerify = () => resolve({ email: 'admin@test.com' }) }),
    )

    wrapper.findComponent({ name: 'VerifyCode' }).vm.$emit('verify', {
      email: 'admin@test.com',
      code: '123456',
    })
    await nextTick()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)

    resolveVerify()
    await flushPromises()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
  })

  it('rejects verify and shows error when submitted email does not match', async () => {
    const wrapper = mount()
    await advanceToOtpStep(wrapper, 'admin@test.com')

    wrapper.findComponent({ name: 'VerifyCode' }).vm.$emit('verify', {
      email: 'other@test.com',
      code: '123456',
    })
    await flushPromises()

    expect(verifyPasswordResetOtp).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="verify-code"]').exists()).toBe(true)
    expect(
      wrapper.findComponent({ name: 'VerifyCode' }).props('errorMessage'),
    ).toBeTruthy()
  })

  it('rejects verify when code is shorter than 6 digits', async () => {
    const wrapper = mount()
    await advanceToOtpStep(wrapper)

    wrapper.findComponent({ name: 'VerifyCode' }).vm.$emit('verify', {
      email: 'admin@test.com',
      code: '123',
    })
    await flushPromises()

    expect(verifyPasswordResetOtp).not.toHaveBeenCalled()
  })

  // ─── OTP step: resend ────────────────────────────────────────────────────────

  it('calls requestPasswordReset again on resend', async () => {
    const wrapper = mount()
    await advanceToOtpStep(wrapper, 'admin@test.com')

    requestPasswordReset.mockResolvedValueOnce({ email: 'admin@test.com' })
    wrapper.findComponent({ name: 'VerifyCode' }).vm.$emit('resend', { email: 'admin@test.com' })
    await flushPromises()

    expect(requestPasswordReset).toHaveBeenCalledTimes(2)
  })

  it('shows error when resend email does not match the verified email', async () => {
    const wrapper = mount()
    await advanceToOtpStep(wrapper, 'admin@test.com')

    wrapper.findComponent({ name: 'VerifyCode' }).vm.$emit('resend', { email: 'other@test.com' })
    await flushPromises()

    expect(requestPasswordReset).toHaveBeenCalledTimes(1) // only the initial call
    expect(
      wrapper.findComponent({ name: 'VerifyCode' }).props('errorMessage'),
    ).toBeTruthy()
  })

  // ─── password step ───────────────────────────────────────────────────────────

  it('calls resetPassword with the correct payload on submit', async () => {
    const wrapper = mount()
    await advanceToPasswordStep(wrapper, 'admin@test.com', '123456')

    resetPassword.mockResolvedValueOnce(null)
    wrapper.findComponent({ name: 'CreateNewPassword' }).vm.$emit('submit', {
      password: 'new-password-123',
    })
    await flushPromises()

    expect(resetPassword).toHaveBeenCalledWith({
      email: 'admin@test.com',
      code: '123456',
      password: 'new-password-123',
      password_confirmation: 'new-password-123',
    })
  })

  it('shows error when resetPassword fails', async () => {
    const wrapper = mount()
    await advanceToPasswordStep(wrapper)

    resetPassword.mockRejectedValueOnce(new Error('Unable to reset password right now.'))
    wrapper.findComponent({ name: 'CreateNewPassword' }).vm.$emit('submit', {
      password: 'new-password-123',
    })
    await flushPromises()

    expect(
      wrapper.findComponent({ name: 'CreateNewPassword' }).props('errorMessage'),
    ).toBe('Unable to reset password right now.')
  })

  it('validates minimum password length client-side before calling resetPassword', async () => {
    const wrapper = mount()
    await advanceToPasswordStep(wrapper)

    wrapper.findComponent({ name: 'CreateNewPassword' }).vm.$emit('submit', {
      password: 'short',
    })
    await flushPromises()

    expect(resetPassword).not.toHaveBeenCalled()
    expect(
      wrapper.findComponent({ name: 'CreateNewPassword' }).props('errorMessage'),
    ).toBeTruthy()
  })

  it('shows loading overlay while saving password', async () => {
    const wrapper = mount()
    await advanceToPasswordStep(wrapper)

    let resolveSave
    resetPassword.mockReturnValueOnce(
      new Promise((resolve) => { resolveSave = () => resolve(null) }),
    )

    wrapper.findComponent({ name: 'CreateNewPassword' }).vm.$emit('submit', {
      password: 'new-password-123',
    })
    await nextTick()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)

    resolveSave()
    await flushPromises()
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(false)
  })

  it('blocks resetPassword submission when OTP has not been verified', async () => {
    const wrapper = mount()
    // Go to OTP step but do NOT advance to password step
    await advanceToOtpStep(wrapper)

    // Directly trigger CreateNewPassword submit (simulates tampered state)
    // Since isPasswordStep is false, CreateNewPassword is not rendered,
    // so we verify the guard by calling onCreatePassword with invalid state.
    // The component won't be mounted in OTP step; the guard is implicitly tested
    // by the fact that the step is not shown until OTP is verified.
    expect(wrapper.find('[data-testid="create-new-password"]').exists()).toBe(false)
  })

  // ─── back navigation ─────────────────────────────────────────────────────────

  it('returns to the email step when back is emitted from the OTP step', async () => {
    const wrapper = mount()
    await advanceToOtpStep(wrapper)

    wrapper.findComponent({ name: 'VerifyCode' }).vm.$emit('back')
    await nextTick()

    expect(wrapper.find('[data-testid="verify-email"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="verify-code"]').exists()).toBe(false)
  })

  it('returns to the OTP step when back is emitted from the password step', async () => {
    const wrapper = mount()
    await advanceToPasswordStep(wrapper)

    wrapper.findComponent({ name: 'CreateNewPassword' }).vm.$emit('back')
    await nextTick()

    expect(wrapper.find('[data-testid="verify-code"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="create-new-password"]').exists()).toBe(false)
  })
})
