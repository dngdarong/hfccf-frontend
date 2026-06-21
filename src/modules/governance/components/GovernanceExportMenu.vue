<script setup>
import Button from '@/components/buttons/Button.vue'
import { jsPDF } from 'jspdf'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'GovernanceExportMenu',
})

const { t } = useLanguage()

const props = defineProps({
  filenameBase: {
    type: String,
    default: 'governance-export',
  },
  rows: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
})

function safeValue(row, column) {
  const value = typeof column.accessor === 'function' ? column.accessor(row) : row[column.key]
  return String(value ?? '').trim()
}

function buildCsv() {
  const header = props.columns.map((column) => `"${String(column.label || column.key).replace(/"/g, '""')}"`).join(',')
  const lines = props.rows.map((row) =>
    props.columns
      .map((column) => `"${safeValue(row, column).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header, ...lines].join('\n')
}

function downloadBlob(content, type, extension) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${props.filenameBase}.${extension}`
  anchor.click()
  URL.revokeObjectURL(url)
}

function exportCsv() {
  downloadBlob(buildCsv(), 'text/csv;charset=utf-8', 'csv')
}

function exportExcel() {
  const rows = [
    '<table>',
    `<thead><tr>${props.columns.map((column) => `<th>${String(column.label || column.key)}</th>`).join('')}</tr></thead>`,
    '<tbody>',
    ...props.rows.map((row) => `<tr>${props.columns.map((column) => `<td>${safeValue(row, column)}</td>`).join('')}</tr>`),
    '</tbody>',
    '</table>',
  ]
  downloadBlob(rows.join(''), 'application/vnd.ms-excel;charset=utf-8', 'xls')
}

function exportPdf() {
  const doc = new jsPDF()
  let y = 14
  doc.setFontSize(14)
  doc.text('Governance Export', 14, y)
  y += 10
  doc.setFontSize(10)
  props.rows.forEach((row, index) => {
    const line = props.columns.map((column) => `${column.label || column.key}: ${safeValue(row, column)}`).join(' | ')
    doc.text(`${index + 1}. ${line}`, 14, y, { maxWidth: 180 })
    y += 8
    if (y > 270) {
      doc.addPage()
      y = 14
    }
  })
  doc.save(`${props.filenameBase}.pdf`)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button size="sm" variant="outline" :label="t('governance.exportActions.csv')" @click="exportCsv" />
    <Button size="sm" variant="outline" :label="t('governance.exportActions.excel')" @click="exportExcel" />
    <Button size="sm" variant="outline" :label="t('governance.exportActions.pdf')" @click="exportPdf" />
  </div>
</template>
