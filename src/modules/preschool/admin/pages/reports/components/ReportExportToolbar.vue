<script setup>
import { ref } from 'vue'
import Button from '@/components/buttons/Button.vue'
import { reportExportService } from '@/modules/preschool/services/reportExportService'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'ReportExportToolbar',
})

const { t } = useLanguage()

const props = defineProps({
  reportType: {
    type: String,
    required: true,
    validator: (value) => ['assessment', 'attendance', 'summary'].includes(value),
  },
  reportData: {
    type: Object,
    required: true,
  },
  reportName: {
    type: String,
    default: 'Report',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['export:start', 'export:success', 'export:error', 'export:download'])

const isExporting = ref(false)
const exportError = ref('')

const exportOptions = [
  {
    format: 'pdf',
    label: 'PDF',
    icon: 'pi-file-pdf',
    tooltip: 'Download as PDF',
  },
  {
    format: 'excel',
    label: 'Excel',
    icon: 'pi-file-excel',
    tooltip: 'Download as Excel',
  },
  {
    format: 'print',
    label: 'Print',
    icon: 'pi-print',
    tooltip: 'Print Report',
  },
]

async function handleExport(format) {
  try {
    exportError.value = ''
    isExporting.value = true
    emit('export:start', format)

    const filename = reportExportService.generateFilename(props.reportType, props.reportData)

    if (format === 'pdf') {
      await reportExportService.exportToPDF(props.reportType, props.reportData, {
        filename,
      })
    } else if (format === 'excel') {
      await reportExportService.exportToExcel(props.reportType, props.reportData, {
        filename,
      })
    } else if (format === 'print') {
      reportExportService.exportToPrint(props.reportType, props.reportData)
    }

    emit('export:success', format)
    emit('export:download', filename)
  } catch (error) {
    console.error(`Export failed (${format}):`, error)
    exportError.value = error.message || 'Export failed. Please try again.'
    emit('export:error', { format, error: error.message })
  } finally {
    isExporting.value = false
  }
}

function dismissError() {
  exportError.value = ''
}
</script>

<template>
  <div class="space-y-3">
    <!-- Export Buttons -->
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="option in exportOptions"
        :key="option.format"
        type="button"
        variant="secondary"
        size="sm"
        rounded="lg"
        :disabled="disabled || isExporting"
        :loading="isExporting"
        :title="option.tooltip"
        @click="handleExport(option.format)"
      >
        <i :class="`pi ${option.icon}`" />
        {{ option.label }}
      </Button>
    </div>

    <!-- Error Message -->
    <div v-if="exportError" class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <i class="pi pi-exclamation-circle text-red-600" />
      <div class="flex-1">
        <p class="text-sm font-medium text-red-900">{{ t('common.error') || 'Error' }}</p>
        <p class="mt-1 text-sm text-red-800">{{ exportError }}</p>
      </div>
      <button
        type="button"
        class="text-red-600 hover:text-red-900"
        @click="dismissError"
        :aria-label="t('common.dismiss') || 'Dismiss'"
      >
        <i class="pi pi-times" />
      </button>
    </div>
  </div>
</template>
