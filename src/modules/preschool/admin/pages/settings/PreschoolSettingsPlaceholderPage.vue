<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Button from '@/components/buttons/Button.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolSettingsPlaceholderPage',
})

const props = defineProps({
  sectionKey: {
    type: String,
    required: true,
  },
})

const { t } = useLanguage()
const router = useRouter()

const sectionPath = computed(() => `preschoolSettingsPage.dashboard.sections.${props.sectionKey}`)

function goBackToDashboard() {
  router.push({ name: 'dashboard-preschool-admin-settings' })
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection
        :title="t(`${sectionPath}.title`)"
        :subtitle="t(`${sectionPath}.subtitle`)"
      />

      <section class="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div class="space-y-2">
            <span class="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              {{ t('preschoolSettingsPage.dashboard.placeholderLabel') }}
            </span>
            <p class="text-lg font-semibold text-slate-900">
              {{ t(`${sectionPath}.title`) }}
            </p>
            <p class="max-w-2xl text-sm text-slate-600">
              {{ t(`${sectionPath}.description`) }}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            :label="t('preschoolSettingsPage.dashboard.actions.backToDashboard')"
            @click="goBackToDashboard"
          />
        </div>
      </section>
    </div>
  </MainLayout>
</template>
