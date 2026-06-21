<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from '@/components/buttons/Button.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { getApiErrorMessage } from '@/services/api'
import PreschoolSettingsSectionCard from '@/modules/preschool/shared/components/settings/PreschoolSettingsSectionCard.vue'
import {
  archiveFeeType,
  archivePaymentMethod,
  createFeeType,
  createPaymentMethod,
  fetchBillingRules,
  fetchFeeTypes,
  fetchPaymentMethods,
  fetchPaymentSettings,
  normalizeBillingRule,
  normalizeFeeType,
  normalizePaymentMethod,
  normalizePaymentSettings,
  updateBillingRules,
  updateFeeType,
  updatePaymentMethod,
  updatePaymentSettings,
} from '@/modules/preschool/services/api/preschoolPaymentConfigurationApi'

defineOptions({
  name: 'PreschoolPaymentSettingsPage',
})

const { t } = useLanguage()
const toast = useToast()

const loading = ref(true)
const errorMessage = ref('')

const savingSettings = ref(false)
const savingFeeType = ref(false)
const savingPaymentMethod = ref(false)
const savingBillingRules = ref(false)

const paymentSettings = ref(createDefaultPaymentSettings())
const feeTypes = ref([])
const paymentMethods = ref([])
const billingRules = ref([])

const feeTypeDialogVisible = ref(false)
const feeTypeDialogMode = ref('create')
const feeTypeDraft = ref(createEmptyFeeTypeDraft())
const feeTypeErrors = ref({})

const paymentMethodDialogVisible = ref(false)
const paymentMethodDialogMode = ref('create')
const paymentMethodDraft = ref(createEmptyPaymentMethodDraft())
const paymentMethodErrors = ref({})

const lateFeeTypeOptions = computed(() => ([
  { label: t('preschoolPaymentSettingsPage.lateFeeTypes.fixed'), value: 'fixed' },
  { label: t('preschoolPaymentSettingsPage.lateFeeTypes.percentage'), value: 'percentage' },
]))

function createDefaultPaymentSettings() {
  return {
    id: '',
    invoicePrefix: 'INV',
    receiptPrefix: 'RCT',
    nextInvoiceNumber: 1,
    nextReceiptNumber: 1,
    lateFeeEnabled: true,
    lateFeeType: 'fixed',
    lateFeeAmount: 5,
    gracePeriodDays: 5,
    prorationEnabled: false,
    updatedAt: '',
  }
}

function createEmptyFeeTypeDraft() {
  return {
    id: '',
    name: '',
    code: '',
    description: '',
    defaultAmount: 0,
    isRequired: false,
    isActive: true,
    sortOrder: 0,
  }
}

function createEmptyPaymentMethodDraft() {
  return {
    id: '',
    name: '',
    code: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  }
}

function openFeeTypeCreate() {
  feeTypeDialogMode.value = 'create'
  feeTypeDraft.value = createEmptyFeeTypeDraft()
  feeTypeErrors.value = {}
  feeTypeDialogVisible.value = true
}

function openFeeTypeEdit(item) {
  feeTypeDialogMode.value = 'edit'
  feeTypeDraft.value = {
    id: item.id || '',
    name: item.name || '',
    code: item.code || '',
    description: item.description || '',
    defaultAmount: Number(item.defaultAmount ?? 0),
    isRequired: Boolean(item.isRequired),
    isActive: Boolean(item.isActive ?? item.status !== 'archived'),
    sortOrder: Number(item.sortOrder ?? 0),
  }
  feeTypeErrors.value = {}
  feeTypeDialogVisible.value = true
}

function openPaymentMethodCreate() {
  paymentMethodDialogMode.value = 'create'
  paymentMethodDraft.value = createEmptyPaymentMethodDraft()
  paymentMethodErrors.value = {}
  paymentMethodDialogVisible.value = true
}

function openPaymentMethodEdit(item) {
  paymentMethodDialogMode.value = 'edit'
  paymentMethodDraft.value = {
    id: item.id || '',
    name: item.name || '',
    code: item.code || '',
    description: item.description || '',
    isActive: Boolean(item.isActive ?? item.status !== 'archived'),
    sortOrder: Number(item.sortOrder ?? 0),
  }
  paymentMethodErrors.value = {}
  paymentMethodDialogVisible.value = true
}

function normalizeSettingsResponse(payload) {
  paymentSettings.value = normalizePaymentSettings(payload)
}

function normalizeFeeTypeList(payload) {
  feeTypes.value = Array.isArray(payload) ? payload.map(normalizeFeeType) : []
}

function normalizePaymentMethodList(payload) {
  paymentMethods.value = Array.isArray(payload) ? payload.map(normalizePaymentMethod) : []
}

function normalizeBillingRuleList(payload) {
  billingRules.value = Array.isArray(payload) ? payload.map(normalizeBillingRule) : []
}

function validateSettingsDraft() {
  const errors = {}

  if (!String(paymentSettings.value.invoicePrefix || '').trim()) errors.invoicePrefix = 'required'
  if (!String(paymentSettings.value.receiptPrefix || '').trim()) errors.receiptPrefix = 'required'
  if (!(Number(paymentSettings.value.nextInvoiceNumber) >= 1)) errors.nextInvoiceNumber = 'required'
  if (!(Number(paymentSettings.value.nextReceiptNumber) >= 1)) errors.nextReceiptNumber = 'required'
  if (!(Number(paymentSettings.value.gracePeriodDays) >= 0)) errors.gracePeriodDays = 'required'
  if (!(Number(paymentSettings.value.lateFeeAmount) >= 0)) errors.lateFeeAmount = 'required'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validateFeeTypeDraft() {
  const errors = {}
  if (!String(feeTypeDraft.value.name || '').trim()) errors.name = 'required'
  if (!String(feeTypeDraft.value.code || '').trim()) errors.code = 'required'
  if (!(Number(feeTypeDraft.value.defaultAmount) >= 0)) errors.defaultAmount = 'required'
  if (!(Number(feeTypeDraft.value.sortOrder) >= 0)) errors.sortOrder = 'required'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function validatePaymentMethodDraft() {
  const errors = {}
  if (!String(paymentMethodDraft.value.name || '').trim()) errors.name = 'required'
  if (!String(paymentMethodDraft.value.code || '').trim()) errors.code = 'required'
  if (!(Number(paymentMethodDraft.value.sortOrder) >= 0)) errors.sortOrder = 'required'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

function buildBillingRulesPayload() {
  return billingRules.value.map((rule) => ({
    ruleName: rule.ruleName,
    ruleCode: rule.ruleCode,
    ruleValue: rule.ruleValue,
    description: rule.description,
    isActive: rule.isActive,
  }))
}

async function loadPage() {
  loading.value = true
  errorMessage.value = ''

  const results = await Promise.allSettled([
    fetchPaymentSettings(),
    fetchFeeTypes(),
    fetchPaymentMethods(),
    fetchBillingRules(),
  ])

  const [settingsResult, feeTypesResult, methodsResult, rulesResult] = results
  const rejection = results.find((result) => result.status === 'rejected')

  if (settingsResult.status === 'fulfilled') {
    normalizeSettingsResponse(settingsResult.value)
  } else {
    paymentSettings.value = createDefaultPaymentSettings()
  }

  if (feeTypesResult.status === 'fulfilled') {
    normalizeFeeTypeList(feeTypesResult.value.items || feeTypesResult.value)
  } else {
    feeTypes.value = []
  }

  if (methodsResult.status === 'fulfilled') {
    normalizePaymentMethodList(methodsResult.value.items || methodsResult.value)
  } else {
    paymentMethods.value = []
  }

  if (rulesResult.status === 'fulfilled') {
    normalizeBillingRuleList(rulesResult.value.items || rulesResult.value)
  } else {
    billingRules.value = []
  }

  if (rejection) {
    errorMessage.value = getApiErrorMessage(rejection.reason, t('preschoolPaymentSettingsPage.messages.loadFailed'))
  }

  loading.value = false
}

async function handleSaveSettings() {
  const result = validateSettingsDraft()
  if (!result.isValid) {
    toast.add({ severity: 'warn', summary: t('preschoolPaymentSettingsPage.messages.validationFailed'), life: 2600 })
    return
  }

  savingSettings.value = true

  try {
    paymentSettings.value = await updatePaymentSettings(paymentSettings.value)
    toast.add({ severity: 'success', summary: t('preschoolPaymentSettingsPage.messages.settingsSaved'), life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: getApiErrorMessage(error, t('preschoolPaymentSettingsPage.messages.saveFailed')), life: 3200 })
  } finally {
    savingSettings.value = false
  }
}

async function handleSaveFeeType() {
  const result = validateFeeTypeDraft()
  feeTypeErrors.value = result.errors

  if (!result.isValid) {
    toast.add({ severity: 'warn', summary: t('preschoolPaymentSettingsPage.messages.validationFailed'), life: 2600 })
    return
  }

  savingFeeType.value = true

  try {
    const payload = { ...feeTypeDraft.value }
    const next = feeTypeDialogMode.value === 'edit'
      ? await updateFeeType(payload.id, payload)
      : await createFeeType(payload)

    const nextItems = feeTypes.value.filter((item) => String(item.id) !== String(next.id))
    nextItems.unshift(next)
    feeTypes.value = nextItems
    feeTypeDialogVisible.value = false
    toast.add({
      severity: 'success',
      summary: feeTypeDialogMode.value === 'edit'
        ? t('preschoolPaymentSettingsPage.messages.feeTypeUpdated')
        : t('preschoolPaymentSettingsPage.messages.feeTypeCreated'),
      life: 2500,
    })
  } catch (error) {
    toast.add({ severity: 'error', summary: getApiErrorMessage(error, t('preschoolPaymentSettingsPage.messages.saveFailed')), life: 3200 })
  } finally {
    savingFeeType.value = false
  }
}

async function handleArchiveFeeType(item) {
  try {
    const archived = await archiveFeeType(item.id)
    feeTypes.value = feeTypes.value.map((row) => (String(row.id) === String(archived.id) ? archived : row))
    toast.add({ severity: 'success', summary: t('preschoolPaymentSettingsPage.messages.feeTypeArchived'), life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: getApiErrorMessage(error, t('preschoolPaymentSettingsPage.messages.saveFailed')), life: 3200 })
  }
}

async function handleSavePaymentMethod() {
  const result = validatePaymentMethodDraft()
  paymentMethodErrors.value = result.errors

  if (!result.isValid) {
    toast.add({ severity: 'warn', summary: t('preschoolPaymentSettingsPage.messages.validationFailed'), life: 2600 })
    return
  }

  savingPaymentMethod.value = true

  try {
    const payload = { ...paymentMethodDraft.value }
    const next = paymentMethodDialogMode.value === 'edit'
      ? await updatePaymentMethod(payload.id, payload)
      : await createPaymentMethod(payload)

    const nextItems = paymentMethods.value.filter((item) => String(item.id) !== String(next.id))
    nextItems.unshift(next)
    paymentMethods.value = nextItems
    paymentMethodDialogVisible.value = false
    toast.add({
      severity: 'success',
      summary: paymentMethodDialogMode.value === 'edit'
        ? t('preschoolPaymentSettingsPage.messages.paymentMethodUpdated')
        : t('preschoolPaymentSettingsPage.messages.paymentMethodCreated'),
      life: 2500,
    })
  } catch (error) {
    toast.add({ severity: 'error', summary: getApiErrorMessage(error, t('preschoolPaymentSettingsPage.messages.saveFailed')), life: 3200 })
  } finally {
    savingPaymentMethod.value = false
  }
}

async function handleArchivePaymentMethod(item) {
  try {
    const archived = await archivePaymentMethod(item.id)
    paymentMethods.value = paymentMethods.value.map((row) => (String(row.id) === String(archived.id) ? archived : row))
    toast.add({ severity: 'success', summary: t('preschoolPaymentSettingsPage.messages.paymentMethodArchived'), life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: getApiErrorMessage(error, t('preschoolPaymentSettingsPage.messages.saveFailed')), life: 3200 })
  }
}

async function handleSaveBillingRules() {
  savingBillingRules.value = true

  try {
    billingRules.value = await updateBillingRules(buildBillingRulesPayload())
    toast.add({ severity: 'success', summary: t('preschoolPaymentSettingsPage.messages.billingRulesSaved'), life: 2500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: getApiErrorMessage(error, t('preschoolPaymentSettingsPage.messages.saveFailed')), life: 3200 })
  } finally {
    savingBillingRules.value = false
  }
}

onMounted(() => {
  void loadPage()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t('preschoolPaymentSettingsPage.pageTitle')"
        :subtitle="t('preschoolPaymentSettingsPage.pageSubtitle')"
      />

      <div
        v-if="loading"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        data-testid="payment-settings-loading"
      >
        <div
          v-for="index in 4"
          :key="index"
          class="rounded-[1.25rem] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="h-3 w-32 animate-pulse rounded-full bg-slate-100" />
          <div class="mt-4 h-6 w-48 animate-pulse rounded-full bg-slate-100" />
          <div class="mt-3 h-4 w-72 max-w-full animate-pulse rounded-full bg-slate-100" />
          <div class="mt-6 space-y-3">
            <div class="h-4 w-full animate-pulse rounded-full bg-slate-100" />
            <div class="h-4 w-11/12 animate-pulse rounded-full bg-slate-100" />
            <div class="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div
        v-else
        class="space-y-6"
      >
        <div
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          data-testid="payment-settings-error"
        >
          {{ errorMessage }}
        </div>

        <PreschoolSettingsSectionCard
          data-testid="payment-settings-section"
          :eyebrow="t('preschoolPaymentSettingsPage.sections.settings.eyebrow')"
          :title="t('preschoolPaymentSettingsPage.sections.settings.title')"
          :subtitle="t('preschoolPaymentSettingsPage.sections.settings.subtitle')"
        >
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label class="field">
              <span>{{ t('preschoolPaymentSettingsPage.fields.invoicePrefix') }}</span>
              <InputText v-model="paymentSettings.invoicePrefix" />
              <small v-if="errorMessage && !paymentSettings.invoicePrefix" class="text-xs font-medium text-rose-600">
                {{ t('preschoolPaymentSettingsPage.validation.required') }}
              </small>
            </label>

            <label class="field">
              <span>{{ t('preschoolPaymentSettingsPage.fields.receiptPrefix') }}</span>
              <InputText v-model="paymentSettings.receiptPrefix" />
            </label>

            <label class="field">
              <span>{{ t('preschoolPaymentSettingsPage.fields.nextInvoiceNumber') }}</span>
              <InputNumber v-model="paymentSettings.nextInvoiceNumber" :min="1" input-class="input-control" />
            </label>

            <label class="field">
              <span>{{ t('preschoolPaymentSettingsPage.fields.nextReceiptNumber') }}</span>
              <InputNumber v-model="paymentSettings.nextReceiptNumber" :min="1" input-class="input-control" />
            </label>

            <label class="field">
              <span>{{ t('preschoolPaymentSettingsPage.fields.lateFeeEnabled') }}</span>
              <div class="toggle-row">
                <span>{{ paymentSettings.lateFeeEnabled ? t('common.enabled') : t('common.disabled') }}</span>
                <ToggleSwitch v-model="paymentSettings.lateFeeEnabled" />
              </div>
            </label>

            <label class="field">
              <span>{{ t('preschoolPaymentSettingsPage.fields.lateFeeType') }}</span>
              <Select v-model="paymentSettings.lateFeeType" :options="lateFeeTypeOptions" option-label="label" option-value="value" />
            </label>

            <label class="field">
              <span>{{ t('preschoolPaymentSettingsPage.fields.lateFeeAmount') }}</span>
              <InputNumber v-model="paymentSettings.lateFeeAmount" :min="0" :step="0.01" input-class="input-control" />
            </label>

            <label class="field">
              <span>{{ t('preschoolPaymentSettingsPage.fields.gracePeriodDays') }}</span>
              <InputNumber v-model="paymentSettings.gracePeriodDays" :min="0" input-class="input-control" />
            </label>

            <label class="field xl:col-span-3">
              <span>{{ t('preschoolPaymentSettingsPage.fields.prorationEnabled') }}</span>
              <div class="toggle-row">
                <span>{{ paymentSettings.prorationEnabled ? t('common.enabled') : t('common.disabled') }}</span>
                <ToggleSwitch v-model="paymentSettings.prorationEnabled" />
              </div>
            </label>
          </div>

          <div class="mt-5 flex justify-end">
            <Button
              data-testid="save-payment-settings"
              :label="t('preschoolPaymentSettingsPage.actions.saveSettings')"
              :loading="savingSettings"
              @click="handleSaveSettings"
            />
          </div>
        </PreschoolSettingsSectionCard>

        <div class="grid gap-6 xl:grid-cols-2">
          <PreschoolSettingsSectionCard
            data-testid="payment-fee-types-section"
            :eyebrow="t('preschoolPaymentSettingsPage.sections.feeTypes.eyebrow')"
            :title="t('preschoolPaymentSettingsPage.sections.feeTypes.title')"
            :subtitle="t('preschoolPaymentSettingsPage.sections.feeTypes.subtitle')"
          >
            <div class="mb-4 flex justify-end">
              <Button
                data-testid="create-fee-type"
                :label="t('preschoolPaymentSettingsPage.actions.createFeeType')"
                @click="openFeeTypeCreate"
              />
            </div>

            <div v-if="feeTypes.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              {{ t('preschoolPaymentSettingsPage.emptyStates.feeTypes') }}
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr class="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.name') }}</th>
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.code') }}</th>
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.defaultAmount') }}</th>
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.required') }}</th>
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.status') }}</th>
                    <th class="py-3 text-right">{{ t('preschoolPaymentSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="item in feeTypes" :key="item.id">
                    <td class="py-3 pr-4 font-medium text-slate-900">{{ item.name }}</td>
                    <td class="py-3 pr-4 text-slate-600">{{ item.code }}</td>
                    <td class="py-3 pr-4 text-slate-600">{{ item.defaultAmount }}</td>
                    <td class="py-3 pr-4 text-slate-600">{{ item.isRequired ? t('common.yes') : t('common.no') }}</td>
                    <td class="py-3 pr-4 text-slate-600">{{ item.status }}</td>
                    <td class="py-3 text-right">
                      <div class="flex justify-end gap-2">
                        <Button size="sm" variant="outline" :label="t('preschoolPaymentSettingsPage.actions.edit')" @click="openFeeTypeEdit(item)" />
                        <Button size="sm" variant="danger" :label="t('preschoolPaymentSettingsPage.actions.archive')" @click="handleArchiveFeeType(item)" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </PreschoolSettingsSectionCard>

          <PreschoolSettingsSectionCard
            data-testid="payment-methods-section"
            :eyebrow="t('preschoolPaymentSettingsPage.sections.paymentMethods.eyebrow')"
            :title="t('preschoolPaymentSettingsPage.sections.paymentMethods.title')"
            :subtitle="t('preschoolPaymentSettingsPage.sections.paymentMethods.subtitle')"
          >
            <div class="mb-4 flex justify-end">
              <Button
                data-testid="create-payment-method"
                :label="t('preschoolPaymentSettingsPage.actions.createPaymentMethod')"
                @click="openPaymentMethodCreate"
              />
            </div>

            <div v-if="paymentMethods.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              {{ t('preschoolPaymentSettingsPage.emptyStates.paymentMethods') }}
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr class="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.name') }}</th>
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.code') }}</th>
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.status') }}</th>
                    <th class="py-3 text-right">{{ t('preschoolPaymentSettingsPage.table.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="item in paymentMethods" :key="item.id">
                    <td class="py-3 pr-4 font-medium text-slate-900">{{ item.name }}</td>
                    <td class="py-3 pr-4 text-slate-600">{{ item.code }}</td>
                    <td class="py-3 pr-4 text-slate-600">{{ item.status }}</td>
                    <td class="py-3 text-right">
                      <div class="flex justify-end gap-2">
                        <Button size="sm" variant="outline" :label="t('preschoolPaymentSettingsPage.actions.edit')" @click="openPaymentMethodEdit(item)" />
                        <Button size="sm" variant="danger" :label="t('preschoolPaymentSettingsPage.actions.archive')" @click="handleArchivePaymentMethod(item)" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </PreschoolSettingsSectionCard>
        </div>

        <PreschoolSettingsSectionCard
          data-testid="payment-billing-rules-section"
          :eyebrow="t('preschoolPaymentSettingsPage.sections.billingRules.eyebrow')"
          :title="t('preschoolPaymentSettingsPage.sections.billingRules.title')"
          :subtitle="t('preschoolPaymentSettingsPage.sections.billingRules.subtitle')"
        >
          <div v-if="billingRules.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            {{ t('preschoolPaymentSettingsPage.emptyStates.billingRules') }}
          </div>

          <div v-else class="space-y-4">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr class="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.ruleName') }}</th>
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.ruleValue') }}</th>
                    <th class="py-3 pr-4">{{ t('preschoolPaymentSettingsPage.table.status') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="rule in billingRules" :key="rule.ruleCode">
                    <td class="py-3 pr-4 font-medium text-slate-900">{{ rule.ruleName }}</td>
                    <td class="py-3 pr-4">
                      <InputText v-model="rule.ruleValue" class="w-full" />
                    </td>
                    <td class="py-3 pr-4 text-slate-600">{{ rule.isActive ? t('common.status.active') : t('common.status.archived') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end">
              <Button
                data-testid="save-billing-rules"
                :label="t('preschoolPaymentSettingsPage.actions.saveRules')"
                :loading="savingBillingRules"
                @click="handleSaveBillingRules"
              />
            </div>
          </div>
        </PreschoolSettingsSectionCard>
      </div>

      <Dialog
        v-model:visible="feeTypeDialogVisible"
        modal
        :header="feeTypeDialogMode === 'edit' ? t('preschoolPaymentSettingsPage.dialogs.feeType.editTitle') : t('preschoolPaymentSettingsPage.dialogs.feeType.createTitle')"
        class="w-full max-w-2xl"
      >
        <div
          data-testid="fee-type-dialog"
          class="grid gap-4 md:grid-cols-2"
        >
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.name') }}</span>
            <InputText v-model="feeTypeDraft.name" />
            <small v-if="feeTypeErrors.name" class="text-xs font-medium text-rose-600">{{ t('preschoolPaymentSettingsPage.validation.required') }}</small>
          </label>
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.code') }}</span>
            <InputText v-model="feeTypeDraft.code" />
            <small v-if="feeTypeErrors.code" class="text-xs font-medium text-rose-600">{{ t('preschoolPaymentSettingsPage.validation.required') }}</small>
          </label>
          <label class="field md:col-span-2">
            <span>{{ t('preschoolPaymentSettingsPage.fields.description') }}</span>
            <Textarea v-model="feeTypeDraft.description" rows="3" />
          </label>
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.defaultAmount') }}</span>
            <InputNumber v-model="feeTypeDraft.defaultAmount" :min="0" :step="0.01" input-class="input-control" />
          </label>
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.sortOrder') }}</span>
            <InputNumber v-model="feeTypeDraft.sortOrder" :min="0" input-class="input-control" />
          </label>
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.required') }}</span>
            <div class="toggle-row">
              <span>{{ feeTypeDraft.isRequired ? t('common.enabled') : t('common.disabled') }}</span>
              <ToggleSwitch v-model="feeTypeDraft.isRequired" />
            </div>
          </label>
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.active') }}</span>
            <div class="toggle-row">
              <span>{{ feeTypeDraft.isActive ? t('common.enabled') : t('common.disabled') }}</span>
              <ToggleSwitch v-model="feeTypeDraft.isActive" />
            </div>
          </label>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <Button variant="outline" :label="t('preschoolPaymentSettingsPage.actions.cancel')" @click="feeTypeDialogVisible = false" />
          <Button :label="feeTypeDialogMode === 'edit' ? t('preschoolPaymentSettingsPage.actions.update') : t('preschoolPaymentSettingsPage.actions.save')" :loading="savingFeeType" @click="handleSaveFeeType" />
        </div>
      </Dialog>

      <Dialog
        v-model:visible="paymentMethodDialogVisible"
        modal
        :header="paymentMethodDialogMode === 'edit' ? t('preschoolPaymentSettingsPage.dialogs.paymentMethod.editTitle') : t('preschoolPaymentSettingsPage.dialogs.paymentMethod.createTitle')"
        class="w-full max-w-2xl"
      >
        <div
          data-testid="payment-method-dialog"
          class="grid gap-4 md:grid-cols-2"
        >
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.name') }}</span>
            <InputText v-model="paymentMethodDraft.name" />
            <small v-if="paymentMethodErrors.name" class="text-xs font-medium text-rose-600">{{ t('preschoolPaymentSettingsPage.validation.required') }}</small>
          </label>
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.code') }}</span>
            <InputText v-model="paymentMethodDraft.code" />
            <small v-if="paymentMethodErrors.code" class="text-xs font-medium text-rose-600">{{ t('preschoolPaymentSettingsPage.validation.required') }}</small>
          </label>
          <label class="field md:col-span-2">
            <span>{{ t('preschoolPaymentSettingsPage.fields.description') }}</span>
            <Textarea v-model="paymentMethodDraft.description" rows="3" />
          </label>
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.sortOrder') }}</span>
            <InputNumber v-model="paymentMethodDraft.sortOrder" :min="0" input-class="input-control" />
          </label>
          <label class="field">
            <span>{{ t('preschoolPaymentSettingsPage.fields.active') }}</span>
            <div class="toggle-row">
              <span>{{ paymentMethodDraft.isActive ? t('common.enabled') : t('common.disabled') }}</span>
              <ToggleSwitch v-model="paymentMethodDraft.isActive" />
            </div>
          </label>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <Button variant="outline" :label="t('preschoolPaymentSettingsPage.actions.cancel')" @click="paymentMethodDialogVisible = false" />
          <Button :label="paymentMethodDialogMode === 'edit' ? t('preschoolPaymentSettingsPage.actions.update') : t('preschoolPaymentSettingsPage.actions.save')" :loading="savingPaymentMethod" @click="handleSavePaymentMethod" />
        </div>
      </Dialog>
    </div>
  </MainLayout>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field > span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.input-control,
:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-textarea) {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #d7e0ea;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #0f172a;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dbe4ef;
  background: #f8fafc;
}
</style>
