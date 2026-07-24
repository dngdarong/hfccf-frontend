<script setup>
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import AppButton from '@/components/ui/AppButton.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolClassLevelDialog',
})

const { t } = useLanguage()

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  draft: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['cancel', 'save', 'update:draft'])

function updateField(field, value) {
  emit('update:draft', {
    ...field.model,
    [field.key]: value,
  })
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="false"
    class="preschool-settings-term-dialog"
    :style="{ width: 'min(92vw, 42rem)' }"
  >
    <template #header>
      <div>
        <h4 class="text-lg font-semibold text-slate-900">{{ title }}</h4>
        <p class="text-sm text-slate-500">{{ t('preschoolClassLevelsPage.dialog.subtitle') }}</p>
      </div>
    </template>

    <div class="grid gap-4 md:grid-cols-2 px-1 py-2">
      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolClassLevelsPage.fields.nameEn') }}</span>
        <InputText
          :model-value="draft.nameEn"
          class="w-full"
          :placeholder="t('preschoolClassLevelsPage.placeholders.nameEn')"
          @update:model-value="updateField({ model: draft, key: 'nameEn' }, $event)"
        />
        <small v-if="errors.nameEn" class="text-xs font-medium text-rose-600">{{ t(`preschoolClassLevelsPage.validation.${errors.nameEn}`) }}</small>
      </label>

      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolClassLevelsPage.fields.nameKh') }}</span>
        <InputText
          :model-value="draft.nameKh"
          class="w-full"
          :placeholder="t('preschoolClassLevelsPage.placeholders.nameKh')"
          @update:model-value="updateField({ model: draft, key: 'nameKh' }, $event)"
        />
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolClassLevelsPage.fields.code') }}</span>
        <InputText
          :model-value="draft.code"
          class="w-full"
          :placeholder="t('preschoolClassLevelsPage.placeholders.code')"
          @update:model-value="updateField({ model: draft, key: 'code' }, String($event || '').toUpperCase())"
        />
        <small v-if="errors.code" class="text-xs font-medium text-rose-600">{{ t(`preschoolClassLevelsPage.validation.${errors.code}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolClassLevelsPage.fields.sortOrder') }}</span>
        <InputText
          :model-value="String(draft.sortOrder ?? 0)"
          inputmode="numeric"
          class="w-full"
          :placeholder="t('preschoolClassLevelsPage.placeholders.sortOrder')"
          @update:model-value="updateField({ model: draft, key: 'sortOrder' }, Number($event || 0))"
        />
        <small v-if="errors.sortOrder" class="text-xs font-medium text-rose-600">{{ t(`preschoolClassLevelsPage.validation.${errors.sortOrder}`) }}</small>
      </label>

      <label class="preschool-settings-field md:col-span-2 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <span>{{ t('preschoolClassLevelsPage.fields.isActive') }}</span>
          <p class="text-xs text-slate-500">{{ t('preschoolClassLevelsPage.help.isActive') }}</p>
        </div>
        <input
          :checked="draft.isActive"
          type="checkbox"
          class="h-5 w-5 rounded border-slate-300 text-sky-600"
          @change="updateField({ model: draft, key: 'isActive' }, $event.target.checked)"
        />
      </label>
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-3">
        <AppButton variant="ghost" @click="emit('cancel')">{{ t('common.cancel') }}</AppButton>
        <AppButton variant="primary" @click="emit('save')">{{ t('preschoolClassLevelsPage.actions.save') }}</AppButton>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.preschool-settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.preschool-settings-field > span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}
</style>
