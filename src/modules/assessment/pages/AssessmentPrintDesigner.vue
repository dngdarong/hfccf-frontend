<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { assessmentPrintApi } from '../services/assessmentPrintApi'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

defineOptions({ name: 'AssessmentPrintDesignerPage' })

const route = useRoute()
const { t } = useLanguage()
const confirm = useConfirm()
const toast = useToast()

const templates = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const dragIndex = ref(null)
const selectedTemplateId = ref(null)
const selectedBlockIndex = ref(-1)
const templateSearch = ref('')
const previewHtml = ref(renderPreviewHtml())
let previewTimer = null

const previewData = reactive({
  student_name: 'Sophea Chan',
  student_code: 'PS-001',
  gender: 'Female',
  date_of_birth: '2020-01-01',
  school: 'Community Preschool',
  grade: 'K2',
  guardian_name: 'Sokha Chan',
  guardian_phone: '+855 12 111 111',
  address: 'Phnom Penh',
  assessment_date: '2026-05-23',
  total_score: '82',
  section_score: '24',
  risk_level: 'Low Risk',
  status: 'approved',
})

const templateForm = reactive(createTemplateState())

const formatOptions = computed(() => [
  { label: 'PDF', value: 'pdf' },
  { label: 'Excel', value: 'excel' },
  { label: 'HTML', value: 'html' },
])

const pageSizeOptions = computed(() => [
  { label: 'A4', value: 'A4' },
  { label: 'Letter', value: 'letter' },
  { label: 'A3', value: 'A3' },
])

const orientationOptions = computed(() => [
  { label: t('printDesigner.orientations.portrait'), value: 'portrait' },
  { label: t('printDesigner.orientations.landscape'), value: 'landscape' },
])

const statusOptions = computed(() => [
  { label: t('printDesigner.statuses.draft'), value: 'draft' },
  { label: t('printDesigner.statuses.published'), value: 'published' },
  { label: t('printDesigner.statuses.archived'), value: 'archived' },
])

const blockOptions = computed(() => [
  { label: t('printDesigner.blockTypes.header'), value: 'header' },
  { label: t('printDesigner.blockTypes.student_info'), value: 'student_info' },
  { label: t('printDesigner.blockTypes.answers_table'), value: 'answers_table' },
  { label: t('printDesigner.blockTypes.score_summary'), value: 'score_summary' },
  { label: t('printDesigner.blockTypes.risk_badge'), value: 'risk_badge' },
  { label: t('printDesigner.blockTypes.signature_box'), value: 'signature_box' },
  { label: t('printDesigner.blockTypes.footer'), value: 'footer' },
  { label: t('printDesigner.blockTypes.custom_html'), value: 'custom_html' },
  { label: t('printDesigner.blockTypes.page_break'), value: 'page_break' },
])

const filteredTemplates = computed(() => {
  const query = templateSearch.value.trim().toLowerCase()
  if (!query) return templates.value

  return templates.value.filter((template) =>
    [template.name, template.name_kh, template.format, template.page_size]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const selectedBlock = computed(() => templateForm.blocks[selectedBlockIndex.value] ?? null)
const normalizedBlocks = computed(() => templateForm.blocks.map((block) => normalizeBlock(block)))

function createTemplateState() {
  return {
    id: null,
    form_template_id: Number(route.params.id) || null,
    uuid: null,
    name: t('printDesigner.defaultTemplateName'),
    name_kh: '',
    format: 'pdf',
    page_size: 'A4',
    orientation: 'portrait',
    margin_top: 20,
    margin_right: 20,
    margin_bottom: 20,
    margin_left: 20,
    font_family: 'Khmer',
    font_size: 11,
    header_html: '<div class="print-inline-note">{{student_name}}</div>',
    footer_html: '<div class="print-inline-note">{{generated_at}}</div>',
    watermark_text: '',
    show_logo: true,
    logo_path: '',
    show_qr_code: false,
    show_watermark: false,
    blocks: defaultBlocks(),
    styles: '',
    is_default: false,
    status: 'draft',
  }
}

function defaultBlocks() {
  return [
    defaultBlock('header'),
    defaultBlock('student_info'),
    defaultBlock('answers_table'),
    defaultBlock('score_summary'),
    defaultBlock('risk_badge'),
    defaultBlock('signature_box'),
    defaultBlock('footer'),
  ]
}

function defaultBlock(type) {
  const base = {
    type,
    title: '',
    content: '',
    fields: [],
    labels: [],
    style: '',
  }

  switch (type) {
    case 'header':
      return {
        ...base,
        title: t('printDesigner.defaultHeaderTitle'),
      }
    case 'student_info':
      return {
        ...base,
        title: t('printDesigner.defaultStudentInfoTitle'),
        fields: [
          { label: t('printDesigner.placeholders.studentName'), value: '{{student_name}}' },
          { label: t('printDesigner.placeholders.studentCode'), value: '{{student_code}}' },
          { label: t('printDesigner.placeholders.gender'), value: '{{gender}}' },
          { label: t('printDesigner.placeholders.dateOfBirth'), value: '{{date_of_birth}}' },
          { label: t('printDesigner.placeholders.guardianName'), value: '{{guardian_name}}' },
          { label: t('printDesigner.placeholders.guardianPhone'), value: '{{guardian_phone}}' },
          { label: t('printDesigner.placeholders.address'), value: '{{address}}' },
        ],
      }
    case 'answers_table':
      return {
        ...base,
        title: t('printDesigner.defaultAnswersTitle'),
      }
    case 'score_summary':
      return {
        ...base,
        title: t('printDesigner.defaultScoreTitle'),
      }
    case 'risk_badge':
      return {
        ...base,
        title: t('printDesigner.defaultRiskTitle'),
      }
    case 'signature_box':
      return {
        ...base,
        title: t('printDesigner.defaultSignatureTitle'),
        labels: [
          { label: t('printDesigner.signatureLabels.preparedBy'), value: '{{assessor}}' },
          { label: t('printDesigner.signatureLabels.reviewedBy'), value: '{{reviewer}}' },
          { label: t('printDesigner.signatureLabels.approvedBy'), value: '{{approver}}' },
        ],
      }
    case 'footer':
      return {
        ...base,
        content: t('printDesigner.defaultFooterText'),
      }
    case 'custom_html':
      return {
        ...base,
        content: '<div>{{student_name}}</div>',
      }
    case 'page_break':
      return {
        ...base,
        title: t('printDesigner.defaultPageBreakTitle'),
      }
    default:
      return base
  }
}

function normalizeBlock(block) {
  const fallback = defaultBlock(block?.type || 'custom_html')
  const normalized = {
    ...fallback,
    ...block,
  }

  if (normalized.type === 'student_info') {
    normalized.fields = Array.isArray(normalized.fields) && normalized.fields.length
      ? normalized.fields
      : defaultBlock('student_info').fields
  }

  if (normalized.type === 'signature_box') {
    normalized.labels = Array.isArray(normalized.labels) && normalized.labels.length
      ? normalized.labels
      : defaultBlock('signature_box').labels
  }

  if (normalized.type === 'footer' && !normalized.content) {
    normalized.content = defaultBlock('footer').content
  }

  return normalized
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function resetEditor() {
  Object.assign(templateForm, createTemplateState())
  selectedTemplateId.value = null
  selectedBlockIndex.value = templateForm.blocks.length ? 0 : -1
}

function hydrateTemplate(template) {
  const next = createTemplateState()
  Object.assign(next, clone(template))
  next.blocks = Array.isArray(template.blocks) && template.blocks.length
    ? template.blocks.map((block) => normalizeBlock(block))
    : defaultBlocks()

  Object.assign(templateForm, next)
  selectedTemplateId.value = template.id
  selectedBlockIndex.value = templateForm.blocks.length ? 0 : -1
}

async function loadTemplates(selectId = null) {
  isLoading.value = true
  try {
    const res = await assessmentPrintApi.list({ form_template_id: route.params.id })
    templates.value = res.data.data ?? []

    if (templates.value.length) {
      const selected = selectId
        ? templates.value.find((template) => String(template.id) === String(selectId))
        : templates.value[0]
      hydrateTemplate(selected || templates.value[0])
      schedulePreviewRefresh()
    } else {
      resetEditor()
      schedulePreviewRefresh()
    }
  } finally {
    isLoading.value = false
  }
}

function selectTemplate(template) {
  hydrateTemplate(template)
}

function selectBlock(index) {
  selectedBlockIndex.value = index
}

function duplicateBlock(index) {
  const block = templateForm.blocks[index]
  if (!block) return
  templateForm.blocks.splice(index + 1, 0, clone(block))
  selectedBlockIndex.value = index + 1
}

function addBlock(type) {
  templateForm.blocks.push(defaultBlock(type))
  selectedBlockIndex.value = templateForm.blocks.length - 1
}

function removeBlock(index) {
  templateForm.blocks.splice(index, 1)
  if (!templateForm.blocks.length) {
    selectedBlockIndex.value = -1
    return
  }

  selectedBlockIndex.value = Math.max(0, Math.min(index, templateForm.blocks.length - 1))
}

function moveBlock(index, direction) {
  const target = index + direction
  if (target < 0 || target >= templateForm.blocks.length) return
  const [item] = templateForm.blocks.splice(index, 1)
  templateForm.blocks.splice(target, 0, item)
  selectedBlockIndex.value = target
}

function onDragStart(index) {
  dragIndex.value = index
}

function onDrop(index) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const from = dragIndex.value
  const [item] = templateForm.blocks.splice(from, 1)
  templateForm.blocks.splice(index, 0, item)
  selectedBlockIndex.value = index
  dragIndex.value = null
}

function onDragEnd() {
  dragIndex.value = null
}

function updateSelectedBlockType(type) {
  if (!selectedBlock.value) return
  const current = clone(selectedBlock.value)
  const replacement = normalizeBlock({
    ...defaultBlock(type),
    ...current,
    type,
  })

  templateForm.blocks.splice(selectedBlockIndex.value, 1, replacement)
}

function addStudentField() {
  if (!selectedBlock.value || selectedBlock.value.type !== 'student_info') return
  selectedBlock.value.fields.push({ label: '', value: '' })
}

function removeStudentField(index) {
  if (!selectedBlock.value || selectedBlock.value.type !== 'student_info') return
  selectedBlock.value.fields.splice(index, 1)
}

function addSignatureRow() {
  if (!selectedBlock.value || selectedBlock.value.type !== 'signature_box') return
  selectedBlock.value.labels.push({ label: '', value: '' })
}

function removeSignatureRow(index) {
  if (!selectedBlock.value || selectedBlock.value.type !== 'signature_box') return
  selectedBlock.value.labels.splice(index, 1)
}

function blockTitle(block) {
  switch (block.type) {
    case 'header':
      return t('printDesigner.blockTypes.header')
    case 'student_info':
      return t('printDesigner.blockTypes.student_info')
    case 'answers_table':
      return t('printDesigner.blockTypes.answers_table')
    case 'score_summary':
      return t('printDesigner.blockTypes.score_summary')
    case 'risk_badge':
      return t('printDesigner.blockTypes.risk_badge')
    case 'signature_box':
      return t('printDesigner.blockTypes.signature_box')
    case 'footer':
      return t('printDesigner.blockTypes.footer')
    case 'custom_html':
      return t('printDesigner.blockTypes.custom_html')
    case 'page_break':
      return t('printDesigner.blockTypes.page_break')
    default:
      return block.type
  }
}

function blockSubtitle(block) {
  if (block.type === 'custom_html') {
    return block.content?.slice(0, 90) || t('printDesigner.customHtmlHint')
  }

  if (block.type === 'student_info') {
    return `${block.fields?.length ?? 0} ${t('printDesigner.fieldCount')}`
  }

  if (block.type === 'signature_box') {
    return `${block.labels?.length ?? 0} ${t('printDesigner.signatureCount')}`
  }

  return block.title || t('printDesigner.noDescription')
}

function previewBlockHtml(block) {
  const normalized = normalizeBlock(block)

  switch (normalized.type) {
    case 'header':
      return `
        <section class="preview-block preview-header">
          <div class="preview-header__logo">${templateForm.show_logo ? 'LOGO' : ''}</div>
          <div>
            <h1>${escapeHtml(normalized.title || templateForm.name)}</h1>
            <p>${escapeHtml([templateForm.name_kh, previewData.student_code, previewData.assessment_date].filter(Boolean).join(' • '))}</p>
          </div>
        </section>
      `
    case 'student_info':
      return `
        <section class="preview-block">
          <h2>${escapeHtml(normalized.title)}</h2>
          <table class="preview-table">
            ${normalized.fields.map((field) => `
              <tr>
                <th>${escapeHtml(field.label || '')}</th>
                <td>${escapeHtml(replacePlaceholders(field.value || ''))}</td>
              </tr>
            `).join('')}
          </table>
        </section>
      `
    case 'answers_table':
      return `
        <section class="preview-block">
          <h2>${escapeHtml(normalized.title)}</h2>
          <table class="preview-table">
            <thead>
              <tr><th>${escapeHtml(t('printDesigner.previewColumns.section'))}</th><th>${escapeHtml(t('printDesigner.previewColumns.question'))}</th><th>${escapeHtml(t('printDesigner.previewColumns.answer'))}</th><th>${escapeHtml(t('printDesigner.previewColumns.score'))}</th></tr>
            </thead>
            <tbody>
              <tr><td>Family</td><td>Household income</td><td>Low</td><td>10</td></tr>
              <tr><td>Health</td><td>Nutrition status</td><td>Moderate</td><td>8</td></tr>
            </tbody>
          </table>
        </section>
      `
    case 'score_summary':
      return `
        <section class="preview-block">
          <h2>${escapeHtml(normalized.title)}</h2>
          <div class="preview-score-grid">
            <div class="preview-score-card"><span>${escapeHtml(t('scoring.totalScore'))}</span><strong>${escapeHtml(previewData.total_score)}</strong></div>
            <div class="preview-score-card"><span>${escapeHtml(t('scoring.sectionScore'))}</span><strong>${escapeHtml(previewData.section_score)}</strong></div>
            <div class="preview-score-card"><span>${escapeHtml(t('scoring.riskLevel'))}</span><strong>${escapeHtml(previewData.risk_level)}</strong></div>
            <div class="preview-score-card"><span>${escapeHtml(t('printDesigner.previewColumns.status'))}</span><strong>${escapeHtml(previewData.status)}</strong></div>
          </div>
        </section>
      `
    case 'risk_badge':
      return `
        <section class="preview-block">
          <div class="preview-risk-badge">${escapeHtml(previewData.risk_level)}</div>
        </section>
      `
    case 'signature_box':
      return `
        <section class="preview-block">
          <h2>${escapeHtml(normalized.title)}</h2>
          <div class="preview-signature-grid">
            ${normalized.labels.map((label) => `
              <div class="preview-signature">
                <span>${escapeHtml(label.label || '')}</span>
                <strong>${escapeHtml(replacePlaceholders(label.value || ''))}</strong>
              </div>
            `).join('')}
          </div>
        </section>
      `
    case 'footer':
      return `
        <section class="preview-block preview-footer">
          ${sanitizeHtml(replacePlaceholders(normalized.content || ''))}
        </section>
      `
    case 'page_break':
      return `<div class="preview-page-break"></div>`
    case 'custom_html':
    default:
      return `
        <section class="preview-block">
          ${sanitizeHtml(replacePlaceholders(normalized.content || '<div></div>'))}
        </section>
      `
  }
}

function renderPreviewHtml() {
  const pageWidth = templateForm.page_size === 'A3'
    ? (templateForm.orientation === 'landscape' ? '1587px' : '1123px')
    : templateForm.page_size === 'letter'
      ? (templateForm.orientation === 'landscape' ? '1056px' : '816px')
      : (templateForm.orientation === 'landscape' ? '1123px' : '794px')

  const pageHeight = templateForm.page_size === 'A3'
    ? (templateForm.orientation === 'landscape' ? '1123px' : '1587px')
    : templateForm.page_size === 'letter'
      ? (templateForm.orientation === 'landscape' ? '816px' : '1056px')
      : (templateForm.orientation === 'landscape' ? '794px' : '1123px')

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <style>
          :root {
            color-scheme: light;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #f1f5f9;
            font-family: ${templateForm.font_family || 'Khmer OS, Khmer, Arial, sans-serif'};
            font-size: ${templateForm.font_size || 11}pt;
            color: #0f172a;
          }
          .page {
            box-sizing: border-box;
            width: ${pageWidth};
            min-height: ${pageHeight};
            padding: ${templateForm.margin_top}px ${templateForm.margin_right}px ${templateForm.margin_bottom}px ${templateForm.margin_left}px;
            margin: 18px auto;
            background: #fff;
            position: relative;
            overflow: hidden;
          }
          .page::before {
            ${templateForm.show_watermark && templateForm.watermark_text ? `content: "${escapeHtml(templateForm.watermark_text)}";` : 'content: "";'}
            position: absolute;
            inset: 40% 0 auto 0;
            text-align: center;
            font-size: 48pt;
            color: rgba(15, 23, 42, 0.06);
            transform: rotate(-18deg);
            pointer-events: none;
            white-space: nowrap;
          }
          .preview-inline-note {
            color: #475569;
            font-size: 10pt;
          }
          .preview-block {
            position: relative;
            z-index: 1;
            margin-bottom: 18px;
            break-inside: avoid;
          }
          .preview-header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #0f172a;
          }
          .preview-header__logo {
            width: 76px;
            height: 76px;
            border-radius: 14px;
            background: linear-gradient(145deg, #dbeafe, #bfdbfe);
            color: #1d4ed8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            letter-spacing: 0.08em;
          }
          h1, h2, p {
            margin: 0;
          }
          h1 {
            font-size: 20pt;
            margin-bottom: 4px;
          }
          h2 {
            font-size: 14pt;
            margin-bottom: 10px;
          }
          .preview-table {
            width: 100%;
            border-collapse: collapse;
          }
          .preview-table th,
          .preview-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            vertical-align: top;
          }
          .preview-table th {
            background: #f8fafc;
            width: 28%;
            text-align: left;
          }
          .preview-score-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
          }
          .preview-score-card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            background: linear-gradient(180deg, #fff, #f8fafc);
            padding: 12px;
          }
          .preview-score-card span {
            display: block;
            font-size: 10pt;
            color: #64748b;
            margin-bottom: 6px;
          }
          .preview-score-card strong {
            font-size: 18pt;
          }
          .preview-risk-badge {
            display: inline-flex;
            align-items: center;
            padding: 10px 16px;
            border-radius: 999px;
            background: rgba(37, 99, 235, 0.08);
            color: #1d4ed8;
            border: 1px solid rgba(37, 99, 235, 0.18);
            font-weight: 700;
          }
          .preview-signature-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }
          .preview-signature {
            min-height: 88px;
            border-bottom: 1px solid #94a3b8;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            gap: 6px;
          }
          .preview-signature span {
            color: #64748b;
            font-size: 10pt;
          }
          .preview-signature strong {
            font-size: 11pt;
          }
          .preview-footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            color: #475569;
            font-size: 10pt;
          }
          .preview-page-break {
            page-break-after: always;
            break-after: page;
            height: 0;
          }
          .print-inline-note {
            color: #475569;
            font-size: 10pt;
          }
          ${templateForm.styles || ''}
        </style>
      </head>
      <body>
        <div class="page">
          ${sanitizeHtml(replacePlaceholders(templateForm.header_html || ''))}
          ${normalizedBlocks.value.map((block) => previewBlockHtml(block)).join('')}
          ${sanitizeHtml(replacePlaceholders(templateForm.footer_html || ''))}
        </div>
      </body>
    </html>
  `

  return html
}

async function refreshPreview() {
  try {
    const response = await assessmentPrintApi.preview({
      template: templatePayload(),
      preview_data: clone(previewData),
    })

    previewHtml.value = response.data?.data?.html || renderPreviewHtml()
  } catch {
    previewHtml.value = renderPreviewHtml()
  }
}

function schedulePreviewRefresh() {
  if (previewTimer) {
    clearTimeout(previewTimer)
  }

  previewTimer = setTimeout(() => {
    refreshPreview()
  }, 250)
}

function replacePlaceholders(value) {
  const entries = {
    '{{student_name}}': previewData.student_name,
    '{{student_code}}': previewData.student_code,
    '{{gender}}': previewData.gender,
    '{{date_of_birth}}': previewData.date_of_birth,
    '{{school}}': previewData.school,
    '{{grade}}': previewData.grade,
    '{{guardian_name}}': previewData.guardian_name,
    '{{guardian_phone}}': previewData.guardian_phone,
    '{{address}}': previewData.address,
    '{{assessment_date}}': previewData.assessment_date,
    '{{total_score}}': previewData.total_score,
    '{{section_score}}': previewData.section_score,
    '{{risk_level}}': previewData.risk_level,
    '{{generated_at}}': previewData.assessment_date,
    '{{assessor}}': 'Assessment Officer',
    '{{reviewer}}': 'Supervisor',
    '{{approver}}': 'Director',
  }

  return Object.entries(entries).reduce((acc, [token, replacement]) => acc.split(token).join(String(replacement ?? '')), String(value ?? ''))
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function sanitizeHtml(value) {
  return String(value ?? '')
    .replace(/<script\b[^>]*>.*?<\/script>/gis, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gis, '')
}

function templatePayload() {
  return {
    form_template_id: templateForm.form_template_id,
    name: templateForm.name,
    name_kh: templateForm.name_kh,
    format: templateForm.format,
    page_size: templateForm.page_size,
    orientation: templateForm.orientation,
    margin_top: templateForm.margin_top,
    margin_right: templateForm.margin_right,
    margin_bottom: templateForm.margin_bottom,
    margin_left: templateForm.margin_left,
    font_family: templateForm.font_family,
    font_size: templateForm.font_size,
    header_html: templateForm.header_html,
    footer_html: templateForm.footer_html,
    watermark_text: templateForm.watermark_text,
    show_logo: templateForm.show_logo,
    logo_path: templateForm.logo_path,
    show_qr_code: templateForm.show_qr_code,
    show_watermark: templateForm.show_watermark,
    blocks: templateForm.blocks.map((block) => clone(normalizeBlock(block))),
    styles: templateForm.styles,
    is_default: templateForm.is_default,
    status: templateForm.status,
  }
}

async function saveTemplate() {
  if (!templateForm.form_template_id) {
    toast.add({ severity: 'warn', summary: t('printDesigner.missingForm'), life: 3000 })
    return
  }

  isSaving.value = true
  try {
    const payload = templatePayload()
    const response = templateForm.id
      ? await assessmentPrintApi.update(templateForm.id, payload)
      : await assessmentPrintApi.create(payload)

    const saved = response.data.data
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: templateForm.id ? t('printDesigner.messages.updated') : t('printDesigner.messages.created'),
      life: 3000,
    })
    await loadTemplates(saved.id)
  } finally {
    isSaving.value = false
  }
}

async function duplicateTemplate() {
  if (!templateForm.id) return

  isSaving.value = true
  try {
    const response = await assessmentPrintApi.create({
      ...templatePayload(),
      name: `${templateForm.name} (${t('printDesigner.duplicateSuffix')})`,
    })
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('printDesigner.messages.duplicated'), life: 3000 })
    await loadTemplates(response.data.data.id)
  } finally {
    isSaving.value = false
  }
}

async function deleteTemplate() {
  if (!templateForm.id) return

  confirm.require({
    message: t('printDesigner.deleteConfirm'),
    accept: async () => {
      await assessmentPrintApi.delete(templateForm.id)
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('printDesigner.messages.deleted'), life: 3000 })
      await loadTemplates()
    },
  })
}

async function newTemplate() {
  resetEditor()
  await Promise.resolve()
  toast.add({ severity: 'info', summary: t('printDesigner.newTemplate'), detail: t('printDesigner.messages.editingDraft'), life: 2500 })
}

onMounted(() => {
  loadTemplates()
})

watch(templateForm, () => schedulePreviewRefresh(), { deep: true })
watch(previewData, () => schedulePreviewRefresh(), { deep: true })
watch(() => route.params.id, () => {
  loadTemplates()
})
</script>

<template>
  <MainLayout>
    <div class="print-designer-shell">
      <HeaderSection :title="t('printDesigner.title')" :subtitle="t('printDesigner.subtitle')">
        <template #actions>
          <span class="print-designer-shell__meta">
            {{ t('printDesigner.formTemplateId') }}: {{ route.params.id }}
          </span>
          <Button :label="t('printDesigner.newTemplate')" icon="pi pi-plus" severity="secondary" @click="newTemplate" />
          <Button :label="t('printDesigner.duplicateTemplate')" icon="pi pi-copy" severity="secondary" :disabled="!templateForm.id" @click="duplicateTemplate" />
          <Button :label="t('printDesigner.deleteTemplate')" icon="pi pi-trash" severity="danger" :disabled="!templateForm.id" @click="deleteTemplate" />
          <Button :label="t('printDesigner.saveTemplate')" icon="pi pi-save" :loading="isSaving" @click="saveTemplate" />
        </template>
      </HeaderSection>

      <div class="print-designer-shell__layout">
        <aside class="print-panel print-panel--sidebar">
          <section class="print-panel__section">
            <div class="print-panel__section-header">
              <h3>{{ t('printDesigner.templateLibrary.title') }}</h3>
              <span>{{ templates.length }}</span>
            </div>
            <InputText
              v-model="templateSearch"
              class="w-full"
              :placeholder="t('printDesigner.templateLibrary.searchPlaceholder')"
            />
            <div v-if="isLoading" class="print-empty">
              <i class="pi pi-spin pi-spinner" />
            </div>
            <div v-else class="print-template-list">
              <button
                v-for="template in filteredTemplates"
                :key="template.id"
                type="button"
                class="print-template-card"
                :class="{ 'is-active': Number(selectedTemplateId) === Number(template.id) }"
                @click="selectTemplate(template)"
              >
                <div class="print-template-card__top">
                  <strong>{{ template.name }}</strong>
                  <Tag :severity="template.status === 'published' ? 'success' : template.status === 'archived' ? 'secondary' : 'warn'" :value="t(`printDesigner.statuses.${template.status}`)" />
                </div>
                <div class="print-template-card__meta">
                  <span>{{ template.name_kh || t('printDesigner.noKhName') }}</span>
                  <span>{{ template.format.toUpperCase() }} • {{ template.page_size }} • {{ t(`printDesigner.orientations.${template.orientation}`) }}</span>
                </div>
              </button>
              <div v-if="!filteredTemplates.length" class="print-empty">
                <i class="pi pi-file-empty" />
                <p>{{ t('printDesigner.noTemplates') }}</p>
              </div>
            </div>
          </section>

          <Divider />

          <section class="print-panel__section">
            <div class="print-panel__section-header">
              <h3>{{ t('printDesigner.blockLibrary.title') }}</h3>
            </div>
            <div class="print-block-library">
              <button
                v-for="block in blockOptions"
                :key="block.value"
                type="button"
                class="print-block-library__item"
                @click="addBlock(block.value)"
              >
                <i class="pi pi-plus" />
                <span>{{ block.label }}</span>
              </button>
            </div>
          </section>
        </aside>

        <main class="print-panel print-panel--canvas">
          <section class="print-panel__section">
            <div class="print-panel__section-header">
              <h3>{{ t('printDesigner.structure.title') }}</h3>
              <span>{{ templateForm.blocks.length }}</span>
            </div>
            <div class="print-block-stack">
              <article
                v-for="(block, index) in normalizedBlocks"
                :key="`${block.type}-${index}`"
                class="print-block-card"
                :class="{ 'is-active': selectedBlockIndex === index, 'is-dragging': dragIndex === index }"
                draggable="true"
                @dragstart="onDragStart(index)"
                @dragend="onDragEnd"
                @dragover.prevent
                @drop.prevent="onDrop(index)"
                @click="selectBlock(index)"
              >
                <div class="print-block-card__header">
                  <div>
                    <strong>{{ blockTitle(block) }}</strong>
                    <p>{{ blockSubtitle(block) }}</p>
                  </div>
                  <Tag :value="block.type" severity="info" />
                </div>
                <div class="print-block-card__actions">
                  <Button icon="pi pi-arrow-up" severity="secondary" text rounded size="small" :disabled="index === 0" @click.stop="moveBlock(index, -1)" />
                  <Button icon="pi pi-arrow-down" severity="secondary" text rounded size="small" :disabled="index === templateForm.blocks.length - 1" @click.stop="moveBlock(index, 1)" />
                  <Button icon="pi pi-copy" severity="secondary" text rounded size="small" @click.stop="duplicateBlock(index)" />
                  <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click.stop="removeBlock(index)" />
                </div>
              </article>

              <div v-if="!templateForm.blocks.length" class="print-empty print-empty--boxed">
                <i class="pi pi-sitemap" />
                <p>{{ t('printDesigner.structure.emptyState') }}</p>
              </div>
            </div>
          </section>

          <section class="print-panel__section">
            <div class="print-panel__section-header">
              <h3>{{ t('printDesigner.preview.title') }}</h3>
              <span>{{ templateForm.format.toUpperCase() }} • {{ templateForm.page_size }} • {{ t(`printDesigner.orientations.${templateForm.orientation}`) }}</span>
            </div>
            <div class="print-preview-frame">
              <iframe :srcdoc="previewHtml" title="print-preview" sandbox="allow-same-origin" />
            </div>
          </section>
        </main>

        <aside class="print-panel print-panel--sidebar">
          <section class="print-panel__section">
            <div class="print-panel__section-header">
              <h3>{{ t('printDesigner.templateSettings.title') }}</h3>
              <Tag :severity="templateForm.status === 'published' ? 'success' : templateForm.status === 'archived' ? 'secondary' : 'warn'" :value="t(`printDesigner.statuses.${templateForm.status}`)" />
            </div>

            <div class="print-form-grid">
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.name') }}</span>
                <InputText v-model="templateForm.name" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.nameKh') }}</span>
                <InputText v-model="templateForm.name_kh" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.format') }}</span>
                <Select v-model="templateForm.format" :options="formatOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.pageSize') }}</span>
                <Select v-model="templateForm.page_size" :options="pageSizeOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.orientation') }}</span>
                <Select v-model="templateForm.orientation" :options="orientationOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.status') }}</span>
                <Select v-model="templateForm.status" :options="statusOptions" option-label="label" option-value="value" class="w-full" />
              </label>
            </div>

            <div class="print-margins-grid">
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.marginTop') }}</span>
                <InputNumber v-model="templateForm.margin_top" :min="0" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.marginRight') }}</span>
                <InputNumber v-model="templateForm.margin_right" :min="0" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.marginBottom') }}</span>
                <InputNumber v-model="templateForm.margin_bottom" :min="0" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.marginLeft') }}</span>
                <InputNumber v-model="templateForm.margin_left" :min="0" class="w-full" />
              </label>
            </div>

            <div class="print-form-grid print-form-grid--two">
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.fontFamily') }}</span>
                <InputText v-model="templateForm.font_family" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.fontSize') }}</span>
                <InputNumber v-model="templateForm.font_size" :min="8" :max="24" class="w-full" />
              </label>
            </div>

            <div class="print-toggles">
              <label class="print-toggle">
                <Checkbox v-model="templateForm.is_default" :binary="true" />
                <span>{{ t('printDesigner.templateSettings.isDefault') }}</span>
              </label>
              <label class="print-toggle">
                <Checkbox v-model="templateForm.show_logo" :binary="true" />
                <span>{{ t('printDesigner.templateSettings.showLogo') }}</span>
              </label>
              <label class="print-toggle">
                <Checkbox v-model="templateForm.show_qr_code" :binary="true" />
                <span>{{ t('printDesigner.templateSettings.showQrCode') }}</span>
              </label>
              <label class="print-toggle">
                <Checkbox v-model="templateForm.show_watermark" :binary="true" />
                <span>{{ t('printDesigner.templateSettings.showWatermark') }}</span>
              </label>
            </div>

            <div class="print-form-grid">
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.logoPath') }}</span>
                <InputText v-model="templateForm.logo_path" class="w-full" :placeholder="t('printDesigner.templateSettings.logoPathPlaceholder')" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.templateSettings.watermarkText') }}</span>
                <InputText v-model="templateForm.watermark_text" class="w-full" />
              </label>
            </div>

            <label class="print-field">
              <span>{{ t('printDesigner.templateSettings.headerHtml') }}</span>
              <Textarea v-model="templateForm.header_html" rows="3" class="w-full" />
            </label>
            <label class="print-field">
              <span>{{ t('printDesigner.templateSettings.footerHtml') }}</span>
              <Textarea v-model="templateForm.footer_html" rows="3" class="w-full" />
            </label>
            <label class="print-field">
              <span>{{ t('printDesigner.templateSettings.styles') }}</span>
              <Textarea v-model="templateForm.styles" rows="4" class="w-full" :placeholder="t('printDesigner.templateSettings.stylesPlaceholder')" />
            </label>
          </section>

          <Divider />

          <section class="print-panel__section">
            <div class="print-panel__section-header">
              <h3>{{ t('printDesigner.previewData.title') }}</h3>
            </div>
            <div class="print-form-grid print-form-grid--two">
              <label class="print-field">
                <span>{{ t('printDesigner.placeholders.studentName') }}</span>
                <InputText v-model="previewData.student_name" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.placeholders.studentCode') }}</span>
                <InputText v-model="previewData.student_code" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.placeholders.gender') }}</span>
                <InputText v-model="previewData.gender" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.placeholders.riskLevel') }}</span>
                <InputText v-model="previewData.risk_level" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.placeholders.totalScore') }}</span>
                <InputText v-model="previewData.total_score" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.placeholders.assessmentDate') }}</span>
                <InputText v-model="previewData.assessment_date" class="w-full" />
              </label>
            </div>
          </section>

          <Divider />

          <section class="print-panel__section">
            <div class="print-panel__section-header">
              <h3>{{ t('printDesigner.blockEditor.title') }}</h3>
              <Tag v-if="selectedBlock" :value="blockTitle(selectedBlock)" severity="info" />
            </div>

            <div v-if="selectedBlock" class="print-block-editor">
              <label class="print-field">
                <span>{{ t('printDesigner.blockEditor.type') }}</span>
                <Select
                  :model-value="selectedBlock.type"
                  :options="blockOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                  @update:model-value="updateSelectedBlockType"
                />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.blockEditor.title') }}</span>
                <InputText v-model="selectedBlock.title" class="w-full" />
              </label>
              <label v-if="selectedBlock.type === 'custom_html' || selectedBlock.type === 'footer'" class="print-field">
                <span>{{ t('printDesigner.blockEditor.content') }}</span>
                <Textarea v-model="selectedBlock.content" rows="4" class="w-full" />
              </label>
              <label class="print-field">
                <span>{{ t('printDesigner.blockEditor.style') }}</span>
                <Textarea v-model="selectedBlock.style" rows="3" class="w-full" :placeholder="t('printDesigner.blockEditor.stylePlaceholder')" />
              </label>

              <div v-if="selectedBlock.type === 'student_info'" class="print-subeditor">
                <div class="print-subeditor__header">
                  <strong>{{ t('printDesigner.blockEditor.fields') }}</strong>
                  <Button :label="t('printDesigner.blockEditor.addField')" icon="pi pi-plus" size="small" severity="secondary" @click="addStudentField" />
                </div>
                <div class="print-subeditor__rows">
                  <div v-for="(field, index) in selectedBlock.fields" :key="`${field.label}-${index}`" class="print-mini-row">
                    <InputText v-model="field.label" :placeholder="t('printDesigner.blockEditor.fieldLabel')" class="w-full" />
                    <InputText v-model="field.value" :placeholder="t('printDesigner.blockEditor.fieldValue')" class="w-full" />
                    <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="removeStudentField(index)" />
                  </div>
                </div>
              </div>

              <div v-if="selectedBlock.type === 'signature_box'" class="print-subeditor">
                <div class="print-subeditor__header">
                  <strong>{{ t('printDesigner.blockEditor.signatureRows') }}</strong>
                  <Button :label="t('printDesigner.blockEditor.addRow')" icon="pi pi-plus" size="small" severity="secondary" @click="addSignatureRow" />
                </div>
                <div class="print-subeditor__rows">
                  <div v-for="(row, index) in selectedBlock.labels" :key="`${row.label}-${index}`" class="print-mini-row">
                    <InputText v-model="row.label" :placeholder="t('printDesigner.blockEditor.rowLabel')" class="w-full" />
                    <InputText v-model="row.value" :placeholder="t('printDesigner.blockEditor.rowValue')" class="w-full" />
                    <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="removeSignatureRow(index)" />
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="print-empty print-empty--boxed">
              <i class="pi pi-hand-pointer" />
              <p>{{ t('printDesigner.blockEditor.emptyState') }}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.print-designer-shell {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 100%;
  padding: 0.25rem 0 1rem;
}

.print-designer-shell__meta {
  font-size: 0.8125rem;
  color: var(--text-color-secondary);
}

.print-designer-shell__layout {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr) 360px;
  gap: 1rem;
  align-items: start;
}

.print-panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.print-panel__section {
  padding: 1rem;
}

.print-panel__section + .print-panel__section {
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.print-panel__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.print-panel__section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.print-template-list,
.print-block-library,
.print-block-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.print-template-card {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 14px;
  padding: 0.9rem;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.print-template-card:hover,
.print-template-card.is-active {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
}

.print-template-card__top,
.print-block-card__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.print-template-card__top strong {
  display: block;
  margin-bottom: 0.2rem;
}

.print-template-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-top: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.8125rem;
}

.print-block-library__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  background: rgba(248, 250, 252, 0.9);
  cursor: pointer;
  text-align: left;
}

.print-block-library__item:hover {
  border-color: rgba(37, 99, 235, 0.35);
  background: rgba(239, 246, 255, 0.8);
}

.print-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  padding: 1rem 0;
  text-align: center;
}

.print-empty--boxed {
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.72);
  padding: 1.1rem;
}

.print-panel--canvas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.85), rgba(241, 245, 249, 0.85)),
    var(--surface-ground);
}

.print-block-card {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.9rem;
  cursor: grab;
}

.print-block-card.is-active {
  border-color: rgba(37, 99, 235, 0.42);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
}

.print-block-card.is-dragging {
  opacity: 0.7;
}

.print-block-card__header strong {
  display: block;
  margin-bottom: 0.2rem;
}

.print-block-card__header p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 0.825rem;
}

.print-block-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.35rem;
  margin-top: 0.75rem;
}

.print-preview-frame {
  padding: 1rem;
  overflow: auto;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.08), transparent 28%),
    rgba(15, 23, 42, 0.06);
  border-radius: 16px;
}

.print-preview-frame iframe {
  width: 100%;
  min-height: 880px;
  border: 0;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.18);
}

.print-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
}

.print-form-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.print-margins-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
  margin: 0.85rem 0;
}

.print-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.print-field span {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-color-secondary);
}

.print-toggles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin: 0.85rem 0;
}

.print-toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.8);
}

.print-subeditor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.print-subeditor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.print-subeditor__rows {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.print-mini-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 1400px) {
  .print-designer-shell__layout {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .print-panel--sidebar:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 1100px) {
  .print-designer-shell__layout {
    grid-template-columns: 1fr;
  }

  .print-panel--sidebar:last-child {
    grid-column: auto;
  }

  .print-preview-frame iframe {
    min-height: 720px;
  }
}

@media (max-width: 720px) {
  .print-form-grid--two,
  .print-margins-grid,
  .print-toggles,
  .print-mini-row,
  .preview-score-grid,
  .preview-signature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
