<script setup>
import { computed, onMounted, watch } from 'vue'
import Card from 'primevue/card'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import SearchInputField from '@/components/forms/SearchInputField.vue'
import { DOMAINS } from '@/constants/access'
import { useLanguage } from '@/composables/useLanguage'
import { AUDIT_LOG_ACTIONS } from '@/modules/reports/constants/auditLogActions'
import { useAuditLogs } from '@/modules/reports/composables/useAuditLogs'

defineOptions({
  name: 'AuditLogsPage',
})

const { t } = useLanguage()
const auditLogs = useAuditLogs()

const pageTitle = computed(() => t('reports.auditLogs.title'))
const pageSubtitle = computed(() => t('reports.auditLogs.subtitle'))
const loadingLabel = computed(() => t('reports.auditLogs.loading'))
const emptyTitle = computed(() => t('reports.auditLogs.empty'))
const emptyDescription = computed(() => t('reports.auditLogs.emptyDescription'))
const searchPlaceholder = computed(() => t('reports.auditLogs.searchPlaceholder'))
const resetLabel = computed(() => t('reports.auditLogs.filters.reset'))
const errorMessage = computed(() => auditLogs.error.value)
const loadingState = computed(() => auditLogs.loading.value)
const items = computed(() => auditLogs.items.value)

const domainOptions = computed(() => [
  { label: t('reports.auditLogs.filters.allDomains'), value: '' },
  { label: t('reports.auditLogs.domains.sport'), value: DOMAINS.SPORT },
  { label: t('reports.auditLogs.domains.global'), value: DOMAINS.GLOBAL },
])

const actionOptions = computed(() => AUDIT_LOG_ACTIONS.map((action) => ({
  value: action.value,
  label: t(action.labelKey),
})))

const actionLabelMap = computed(() => Object.fromEntries(actionOptions.value.map((option) => [option.value, option.label])))

const isEmpty = computed(() => !auditLogs.loading.value && !auditLogs.items.value.length)

function actionLabel(action) {
  return actionLabelMap.value[action] || action || '-'
}

function prettyJson(value) {
  if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
    return '{}'
  }

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return '{}'
  }
}

function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

async function loadLogs(params = {}) {
  await auditLogs.loadAuditLogs({
    page: params.page ?? auditLogs.pagination.page,
    perPage: auditLogs.pagination.perPage,
  })
}

async function refreshFromFilters() {
  auditLogs.pagination.page = 1
  await loadLogs({ page: 1 })
}

async function handleResetFilters() {
  auditLogs.resetFilters()
  auditLogs.pagination.page = 1
  await loadLogs({ page: 1 })
}

watch(
  () => auditLogs.pagination.page,
  () => {
    void loadLogs()
  },
)

onMounted(async () => {
  await loadLogs()
})
</script>

<template>
  <MainLayout>
    <section class="reports-audit-logs space-y-6">
      <HeaderSection
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <Card>
        <template #content>
          <div class="grid gap-4 lg:grid-cols-6">
            <SearchInputField
              :model-value="auditLogs.filters.search"
              :placeholder="searchPlaceholder"
              class="lg:col-span-2"
              @update:model-value="(value) => { auditLogs.filters.search = value; void refreshFromFilters(); }"
            />

            <Select
              :model-value="auditLogs.filters.domain"
              :options="domainOptions"
              option-label="label"
              option-value="value"
              class="lg:col-span-1"
              @update:model-value="(value) => { auditLogs.filters.domain = value; void refreshFromFilters(); }"
            />

            <Select
              :model-value="auditLogs.filters.action"
              :options="actionOptions"
              option-label="label"
              option-value="value"
              class="lg:col-span-1"
              @update:model-value="(value) => { auditLogs.filters.action = value; void refreshFromFilters(); }"
            />

            <InputText
              v-model="auditLogs.filters.actorUserId"
              :placeholder="t('reports.auditLogs.filters.actor')"
              class="lg:col-span-1"
              @input="refreshFromFilters"
            />

            <Button
              type="button"
              class="lg:col-span-1"
              @click="handleResetFilters"
            >
              {{ resetLabel }}
            </Button>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-2 text-sm">
              <span>{{ t('reports.auditLogs.filters.dateFrom') }}</span>
              <input
                v-model="auditLogs.filters.dateFrom"
                type="date"
                class="border rounded-md px-3 py-2"
                @change="refreshFromFilters"
              >
            </label>

            <label class="flex flex-col gap-2 text-sm">
              <span>{{ t('reports.auditLogs.filters.dateTo') }}</span>
              <input
                v-model="auditLogs.filters.dateTo"
                type="date"
                class="border rounded-md px-3 py-2"
                @change="refreshFromFilters"
              >
            </label>
          </div>
        </template>
      </Card>

      <Card v-if="errorMessage">
        <template #content>
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </template>
      </Card>

      <Card v-if="loadingState && !items.length">
        <template #content>
          <p class="text-sm text-surface-500">{{ loadingLabel }}</p>
        </template>
      </Card>

      <Card v-else-if="isEmpty">
        <template #content>
          <div class="space-y-2 py-8 text-center">
            <p class="text-lg font-semibold">{{ emptyTitle }}</p>
            <p class="text-sm text-surface-500">{{ emptyDescription }}</p>
          </div>
        </template>
      </Card>

      <div v-else class="space-y-4">
        <Card
          v-for="item in items"
          :key="item.id"
        >
          <template #title>
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-wide text-surface-500">
                  {{ t('reports.auditLogs.fields.action') }}: {{ actionLabel(item.action) }}
                </p>
                <h3 class="text-lg font-semibold">{{ item.entityLabel || item.entityType || '-' }}</h3>
              </div>
              <span class="text-sm text-surface-500">{{ formatDate(item.createdAt) }}</span>
            </div>
          </template>
          <template #content>
            <div class="grid gap-3 text-sm md:grid-cols-2">
              <p><strong>{{ t('reports.auditLogs.fields.domain') }}:</strong> {{ item.domain || '-' }}</p>
              <p><strong>{{ t('reports.auditLogs.fields.actor') }}:</strong> {{ item.actor?.name || '-' }}</p>
              <p><strong>{{ t('reports.auditLogs.fields.entity') }}:</strong> {{ item.entityType || '-' }}<span v-if="item.entityId"> #{{ item.entityId }}</span></p>
              <p><strong>{{ t('reports.auditLogs.fields.time') }}:</strong> {{ formatDate(item.createdAt) }}</p>
              <p><strong>{{ t('reports.auditLogs.fields.ipAddress') }}:</strong> {{ item.ipAddress || '-' }}</p>
              <p><strong>{{ t('reports.auditLogs.fields.userAgent') }}:</strong> {{ item.userAgent || '-' }}</p>
            </div>

            <details class="mt-4 rounded-md border border-surface-200 p-3">
              <summary class="cursor-pointer text-sm font-medium">{{ t('reports.auditLogs.fields.metadata') }}</summary>
              <div class="mt-3 space-y-3 text-xs">
                <div>
                  <p class="font-semibold">{{ t('reports.auditLogs.fields.oldValues') }}</p>
                  <pre class="whitespace-pre-wrap break-words">{{ prettyJson(item.oldValues) }}</pre>
                </div>
                <div>
                  <p class="font-semibold">{{ t('reports.auditLogs.fields.newValues') }}</p>
                  <pre class="whitespace-pre-wrap break-words">{{ prettyJson(item.newValues) }}</pre>
                </div>
                <div>
                  <p class="font-semibold">{{ t('reports.auditLogs.fields.metadata') }}</p>
                  <pre class="whitespace-pre-wrap break-words">{{ prettyJson(item.metadata) }}</pre>
                </div>
              </div>
            </details>
          </template>
        </Card>
      </div>

      <Pagination
        v-if="auditLogs.pagination.lastPage > 1"
        :model-value="auditLogs.pagination.page"
        
        
        :total-pages="auditLogs.pagination.lastPage"
        @change="(page) => { auditLogs.pagination.page = page; }"
      />
    </section>
  </MainLayout>
</template>
