<script setup>
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'
import { useLanguage } from '@/composables/useLanguage'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'

defineOptions({
  name: 'PreschoolClassLevelsManager',
})

const { t, language } = useLanguage()

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open-add', 'open-edit', 'deactivate', 'restore'])

function getDisplayName(level = {}) {
  const isKh = language.value === 'KH'
  return isKh
    ? String(level.nameKh || level.name_kh || level.nameEn || level.name_en || level.code || '').trim()
    : String(level.nameEn || level.name_en || level.nameKh || level.name_kh || level.code || '').trim()
}

function getStatusTone(level = {}) {
  return level.isActive === false ? 'inactive' : 'active'
}
</script>

<template>
  <PreschoolSettingsSectionCard
    :eyebrow="t('preschoolClassLevelsPage.eyebrow')"
    :title="t('preschoolClassLevelsPage.title')"
    :subtitle="t('preschoolClassLevelsPage.subtitle')"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-500">{{ t('preschoolClassLevelsPage.description') }}</p>
      <AppButton variant="primary" :loading="loading || saving" @click="emit('open-add')">
        {{ t('preschoolClassLevelsPage.actions.add') }}
      </AppButton>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <article
        v-for="(level, index) in items"
        :key="level.id || `${level.code}-${index}`"
        class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.45)]"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="text-base font-semibold text-slate-900">
                {{ getDisplayName(level) || level.code }}
              </h4>
              <AppStatusChip
                :status="getStatusTone(level)"
                :label="level.isActive === false ? t('preschoolClassLevelsPage.status.inactive') : t('preschoolClassLevelsPage.status.active')"
                :translate-label="false"
                size="xs"
              />
            </div>
            <p class="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {{ level.code }}
            </p>
            <div class="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <AppBadge variant="staff" size="xs" :label="t('preschoolClassLevelsPage.labels.sortOrder', { value: level.sortOrder ?? 0 })" />
              <span>{{ level.nameKh || level.name_kh || t('preschoolClassLevelsPage.emptyStates.noKhmer') }}</span>
            </div>
          </div>
          <AppBadge
            :variant="level.isActive === false ? 'danger' : 'success'"
            size="xs"
            :label="level.isActive === false ? t('preschoolClassLevelsPage.status.inactive') : t('preschoolClassLevelsPage.status.active')"
          />
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <AppButton variant="outline" :disabled="saving" @click="emit('open-edit', index)">
            {{ t('common.edit') }}
          </AppButton>
          <AppButton
            v-if="level.isActive === false"
            variant="success"
            :disabled="saving"
            @click="emit('restore', index)"
          >
            {{ t('preschoolClassLevelsPage.actions.restore') }}
          </AppButton>
          <AppButton
            v-else
            variant="warning"
            :disabled="saving"
            @click="emit('deactivate', index)"
          >
            {{ t('preschoolClassLevelsPage.actions.deactivate') }}
          </AppButton>
        </div>
      </article>

      <div v-if="!items.length" class="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 lg:col-span-2">
        {{ t('preschoolClassLevelsPage.emptyStates.none') }}
      </div>
    </div>
  </PreschoolSettingsSectionCard>
</template>
