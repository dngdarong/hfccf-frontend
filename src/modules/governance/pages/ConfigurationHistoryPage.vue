<script setup>
import { onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import { fetchConfigurationHistory } from '@/modules/governance/services/api/governanceApi'
import ConfigurationDiffViewer from '@/modules/governance/components/ConfigurationDiffViewer.vue'
import GovernanceExportMenu from '@/modules/governance/components/GovernanceExportMenu.vue'

defineOptions({
  name: 'ConfigurationHistoryPage',
})

const { t } = useLanguage()
const loading = ref(true)
const errorMessage = ref('')
const items = ref([])
const selected = ref(null)

async function loadHistory() {
  loading.value = true
  errorMessage.value = ''

  try {
    const payload = await fetchConfigurationHistory()
    items.value = payload.items || []
    selected.value = items.value[0] || null
  } catch (error) {
    errorMessage.value = error?.message || t('governance.messages.loadFailed')
  } finally {
    loading.value = false
  }
}

function selectItem(item) {
  selected.value = item
}

onMounted(() => {
  void loadHistory()
})
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <HeaderSection :title="t('governance.configuration.pageTitle')" :subtitle="t('governance.configuration.pageSubtitle')" />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-600">{{ t('governance.configuration.description') }}</p>
        <GovernanceExportMenu
          filename-base="governance-configuration-history"
          :rows="items"
          :columns="[
            { key: 'module', label: t('governance.configuration.fields.module') },
            { key: 'actorName', label: t('governance.configuration.fields.actor') },
            { key: 'createdAt', label: t('governance.configuration.fields.createdAt') },
          ]"
        />
      </div>

      <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        {{ t('governance.messages.loading') }}
      </div>

      <div v-else-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>

      <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-3">
          <article
            v-for="item in items"
            :key="item.id"
            class="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4"
            :class="selected?.id === item.id ? 'ring-2 ring-sky-200' : ''"
            @click="selectItem(item)"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{{ item.module }}</p>
                <h4 class="text-base font-semibold text-slate-900">{{ item.action || item.module }}</h4>
              </div>
              <span class="text-xs text-slate-500">{{ item.createdAt }}</span>
            </div>
            <p class="mt-2 text-sm text-slate-600">{{ item.actorName || '-' }}</p>
          </article>
          <p v-if="!items.length" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            {{ t('governance.emptyStates.configuration') }}
          </p>
        </div>

        <ConfigurationDiffViewer
          :title="t('governance.configuration.diffTitle')"
          :before-state="selected?.beforeState"
          :after-state="selected?.afterState"
        />
      </div>
    </div>
  </MainLayout>
</template>
