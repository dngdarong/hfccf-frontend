import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolPaymentSettingsPage from '@/modules/preschool/admin/pages/settings/PreschoolPaymentSettingsPage.vue'
import {
  archiveFeeType,
  archivePaymentMethod,
  createFeeType,
  createPaymentMethod,
  fetchBillingRules,
  fetchFeeTypes,
  fetchPaymentMethods,
  fetchPaymentSettings,
  updateBillingRules,
  updateFeeType,
  updatePaymentMethod,
  updatePaymentSettings,
} from '@/modules/preschool/services/api/preschoolPaymentConfigurationApi'

const toastAdd = vi.fn()

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: toastAdd,
  }),
}))

vi.mock('@/modules/preschool/services/api/preschoolPaymentConfigurationApi', () => ({
  fetchPaymentSettings: vi.fn(),
  updatePaymentSettings: vi.fn(),
  fetchFeeTypes: vi.fn(),
  createFeeType: vi.fn(),
  updateFeeType: vi.fn(),
  archiveFeeType: vi.fn(),
  fetchPaymentMethods: vi.fn(),
  createPaymentMethod: vi.fn(),
  updatePaymentMethod: vi.fn(),
  archivePaymentMethod: vi.fn(),
  fetchBillingRules: vi.fn(),
  updateBillingRules: vi.fn(),
  normalizePaymentSettings: (value) => value,
  normalizeFeeType: (value) => value,
  normalizePaymentMethod: (value) => value,
  normalizeBillingRule: (value) => value,
}))

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    PreschoolSettingsSectionCard: {
      inheritAttrs: false,
      props: ['eyebrow', 'title', 'subtitle'],
      template: '<section v-bind="$attrs"><h2>{{ title }}</h2><slot /></section>',
    },
    Button: {
      inheritAttrs: false,
      props: ['label', 'loading', 'disabled'],
      emits: ['click'],
      template: '<button v-bind="$attrs" :disabled="disabled || loading" @click="$emit(\'click\')">{{ label }}<slot /></button>',
    },
    Dialog: {
      inheritAttrs: false,
      props: ['visible'],
      template: '<div v-if="visible" v-bind="$attrs"><slot /><slot name="footer" /></div>',
    },
    InputText: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<input type="text" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
    InputNumber: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<input type="number" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value === \'\' ? null : Number($event.target.value))" />',
    },
    Select: {
      props: ['modelValue', 'options', 'optionLabel', 'optionValue'],
      emits: ['update:modelValue'],
      template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option></select>',
    },
    Textarea: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
    ToggleSwitch: {
      props: ['modelValue'],
      emits: ['update:modelValue'],
      template: '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  window.confirm = vi.fn(() => true)

  fetchPaymentSettings.mockResolvedValue({
    id: 1,
    invoicePrefix: 'INV',
    receiptPrefix: 'RCT',
    nextInvoiceNumber: 8,
    nextReceiptNumber: 9,
    lateFeeEnabled: true,
    lateFeeType: 'fixed',
    lateFeeAmount: 5,
    gracePeriodDays: 5,
    prorationEnabled: false,
  })

  fetchFeeTypes.mockResolvedValue({
    items: [
      { id: 1, name: 'Registration Fee', code: 'registration_fee', description: '', defaultAmount: 25, isRequired: true, isActive: true, status: 'active' },
    ],
  })

  fetchPaymentMethods.mockResolvedValue({
    items: [
      { id: 1, name: 'Cash', code: 'cash', description: '', isActive: true, status: 'active' },
    ],
  })

  fetchBillingRules.mockResolvedValue({
    items: [
      { id: 1, ruleName: 'Due Day', ruleCode: 'due_day_of_month', ruleValue: '5', description: '', isActive: true },
      { id: 2, ruleName: 'Grace Period', ruleCode: 'grace_period_days', ruleValue: '5', description: '', isActive: true },
      { id: 3, ruleName: 'Invoice Generation Day', ruleCode: 'invoice_generation_day', ruleValue: '1', description: '', isActive: true },
      { id: 4, ruleName: 'Late Fee Enabled', ruleCode: 'late_fee_enabled', ruleValue: 'true', description: '', isActive: true },
    ],
  })

  updatePaymentSettings.mockResolvedValue({
    id: 1,
    invoicePrefix: 'INVX',
    receiptPrefix: 'RCTX',
    nextInvoiceNumber: 22,
    nextReceiptNumber: 33,
    lateFeeEnabled: false,
    lateFeeType: 'percentage',
    lateFeeAmount: 7.5,
    gracePeriodDays: 9,
    prorationEnabled: true,
  })

  createFeeType.mockResolvedValue({
    id: 2,
    name: 'Activity Fee',
    code: 'activity_fee',
    defaultAmount: 10,
    isRequired: false,
    isActive: true,
    status: 'active',
  })
  updateFeeType.mockResolvedValue({
    id: 1,
    name: 'Registration Fee Updated',
    code: 'registration_fee',
    defaultAmount: 30,
    isRequired: true,
    isActive: true,
    status: 'active',
  })
  archiveFeeType.mockResolvedValue({
    id: 1,
    name: 'Registration Fee Updated',
    code: 'registration_fee',
    defaultAmount: 30,
    isRequired: true,
    isActive: false,
    status: 'archived',
  })

  createPaymentMethod.mockResolvedValue({
    id: 2,
    name: 'ABA',
    code: 'aba',
    isActive: true,
    status: 'active',
  })
  updatePaymentMethod.mockResolvedValue({
    id: 1,
    name: 'Cash Updated',
    code: 'cash',
    isActive: true,
    status: 'active',
  })
  archivePaymentMethod.mockResolvedValue({
    id: 1,
    name: 'Cash Updated',
    code: 'cash',
    isActive: false,
    status: 'archived',
  })

  updateBillingRules.mockResolvedValue([
    { id: 1, ruleName: 'Due Day', ruleCode: 'due_day_of_month', ruleValue: '7', description: '', isActive: true },
    { id: 2, ruleName: 'Grace Period', ruleCode: 'grace_period_days', ruleValue: '5', description: '', isActive: true },
    { id: 3, ruleName: 'Invoice Generation Day', ruleCode: 'invoice_generation_day', ruleValue: '1', description: '', isActive: true },
    { id: 4, ruleName: 'Late Fee Enabled', ruleCode: 'late_fee_enabled', ruleValue: 'true', description: '', isActive: true },
  ])
})

describe('PreschoolPaymentSettingsPage', () => {
  it('renders the payment configuration page', async () => {
    const wrapper = mountWithPlugins(PreschoolPaymentSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Payment Configuration')
    expect(wrapper.text()).toContain('Fee Types')
    expect(wrapper.text()).toContain('Payment Methods')
    expect(wrapper.text()).toContain('Billing Rules')
    expect(wrapper.text()).toContain('Registration Fee')
    expect(wrapper.text()).toContain('Cash')
  })

  it('sends the payment settings payload when saving', async () => {
    const wrapper = mountWithPlugins(PreschoolPaymentSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const section = wrapper.get('[data-testid="payment-settings-section"]')
    const textInputs = section.findAll('input[type="text"]')
    const numberInputs = section.findAll('input[type="number"]')
    const selects = section.findAll('select')
    const checkboxes = section.findAll('input[type="checkbox"]')

    await textInputs[0].setValue('INVX')
    await textInputs[1].setValue('RCTX')
    await numberInputs[0].setValue('22')
    await numberInputs[1].setValue('33')
    await numberInputs[2].setValue('7.5')
    await numberInputs[3].setValue('9')
    await selects[0].setValue('percentage')
    await checkboxes[0].setValue(false)
    await checkboxes[1].setValue(true)

    await section.get('[data-testid="save-payment-settings"]').trigger('click')

    expect(updatePaymentSettings).toHaveBeenCalledWith(expect.objectContaining({
      invoicePrefix: 'INVX',
      receiptPrefix: 'RCTX',
      nextInvoiceNumber: 22,
      nextReceiptNumber: 33,
      lateFeeEnabled: false,
      lateFeeType: 'percentage',
      lateFeeAmount: 7.5,
      gracePeriodDays: 9,
      prorationEnabled: true,
    }))
  })

  it('creates, updates, and archives fee types and payment methods', async () => {
    const wrapper = mountWithPlugins(PreschoolPaymentSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    await wrapper.get('[data-testid="create-fee-type"]').trigger('click')
    let dialog = wrapper.get('[data-testid="fee-type-dialog"]')
    let textInputs = dialog.findAll('input[type="text"]')
    let numberInputs = dialog.findAll('input[type="number"]')
    let checkboxes = dialog.findAll('input[type="checkbox"]')

    await textInputs[0].setValue('Activity Fee')
    await textInputs[1].setValue('activity_fee')
    await dialog.find('textarea').setValue('Outdoor activity fee')
    await numberInputs[0].setValue('10')
    await numberInputs[1].setValue('2')
    await checkboxes[0].setValue(false)
    await checkboxes[1].setValue(true)
    await wrapper.findAll('button').at(-1).trigger('click')

    expect(createFeeType).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Activity Fee',
      code: 'activity_fee',
      defaultAmount: 10,
      sortOrder: 2,
      isRequired: false,
      isActive: true,
    }))

    const feeSection = wrapper.get('[data-testid="payment-fee-types-section"]')
    const feeRow = feeSection.get('tbody tr')
    const feeButtons = feeRow.findAll('button')

    await feeButtons[0].trigger('click')
    dialog = wrapper.get('[data-testid="fee-type-dialog"]')
    textInputs = dialog.findAll('input[type="text"]')
    numberInputs = dialog.findAll('input[type="number"]')

    await textInputs[0].setValue('Registration Fee Updated')
    await numberInputs[0].setValue('30')
    await wrapper.findAll('button').at(-1).trigger('click')

    expect(updateFeeType).toHaveBeenCalledWith(2, expect.objectContaining({
      name: 'Registration Fee Updated',
      defaultAmount: 30,
    }))

    await feeSection.get('tbody tr').findAll('button')[1].trigger('click')
    expect(archiveFeeType).toHaveBeenCalled()

    await wrapper.get('[data-testid="create-payment-method"]').trigger('click')
    dialog = wrapper.get('[data-testid="payment-method-dialog"]')
    textInputs = dialog.findAll('input[type="text"]')
    numberInputs = dialog.findAll('input[type="number"]')
    checkboxes = dialog.findAll('input[type="checkbox"]')

    await textInputs[0].setValue('ABA')
    await textInputs[1].setValue('aba')
    await dialog.find('textarea').setValue('ABA transfer')
    await numberInputs[0].setValue('1')
    await checkboxes[0].setValue(true)
    await wrapper.findAll('button').at(-1).trigger('click')

    expect(createPaymentMethod).toHaveBeenCalledWith(expect.objectContaining({
      name: 'ABA',
      code: 'aba',
      sortOrder: 1,
      isActive: true,
    }))

    const paymentSection = wrapper.get('[data-testid="payment-methods-section"]')
    const paymentRow = paymentSection.get('tbody tr')
    const paymentButtons = paymentRow.findAll('button')

    await paymentButtons[0].trigger('click')
    dialog = wrapper.get('[data-testid="payment-method-dialog"]')
    textInputs = dialog.findAll('input[type="text"]')
    await textInputs[0].setValue('Cash Updated')
    await wrapper.findAll('button').at(-1).trigger('click')

    expect(updatePaymentMethod).toHaveBeenCalledWith(2, expect.objectContaining({
      name: 'Cash Updated',
    }))

    await paymentSection.get('tbody tr').findAll('button')[1].trigger('click')
    expect(archivePaymentMethod).toHaveBeenCalled()
  })

  it('saves billing rules using the configured payload shape', async () => {
    const wrapper = mountWithPlugins(PreschoolPaymentSettingsPage, {
      messages: { en: enPreschool },
      global: { stubs: stubs() },
    })

    await flushPromises()

    const billingSection = wrapper.get('[data-testid="payment-billing-rules-section"]')
    const ruleInputs = billingSection.findAll('input[type="text"]')
    await ruleInputs[0].setValue('7')
    await billingSection.get('[data-testid="save-billing-rules"]').trigger('click')

    expect(updateBillingRules).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({
        ruleCode: 'due_day_of_month',
        ruleValue: '7',
      }),
    ]))
  })
})
