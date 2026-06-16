<script setup>
import { computed, createApp, h, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toCanvas } from 'html-to-image'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { fetchPreschoolStudents, fetchPreschoolClasses } from '@/modules/preschool/services/preschoolApi'
import IdCardPreview from '@/modules/preschool/admin/components/IdCardPreview.vue'
import IdCardBackPreview from '@/modules/preschool/admin/components/IdCardBackPreview.vue'
import { buildBackQrDataUrl } from './attendanceIdCardBack'
import {
  LANG_OPTIONS,
  FORMAT_OPTIONS,
  ORIENT_OPTIONS,
  CARD_SIZES,
  DEFAULT_LANG,
  DEFAULT_FORMAT,
  DEFAULT_ORIENTATION,
  DEFAULT_GAP_MM,
} from './constants/attendanceIdCardConstants'
import {
  getInitials,
  getAcademicYear,
  loadStudentPhotoAsImg,
  imgToDataUrl,
  waitForFonts,
  calculateExportWidth,
  calculateGapPixels,
  sanitizeFileName,
  normalizeClassOptions,
  filterSelectedStudents,
  getClassInfo,
  getCurrentCardSize,
} from './utils/attendanceIdCardHelpers'

defineOptions({ name: 'PreschoolAdminAttendanceIdCardPage' })

const { t } = useLanguage()
const router = useRouter()
const PUBLIC_IMAGE_ORIGIN = String(import.meta.env.VITE_IMAGE_PUBLIC_ORIGIN || import.meta.env.VITE_IMAGE_PUBLIC_URL || '').trim()

const classOptions = ref([])
const students = ref([])
const selectedClassId = ref('')
const selectedStudentIds = ref([])
const selectedFormat = ref(DEFAULT_FORMAT)
const selectedOrientation = ref(DEFAULT_ORIENTATION)
const selectedSize = ref('standard')
const selectedLang = ref(DEFAULT_LANG)
const selectedGapMm = ref(DEFAULT_GAP_MM)
const loadingClasses = ref(false)
const loadingStudents = ref(false)
const generating = ref(false)

const currentSizeConfig = computed(() => getCurrentCardSize(CARD_SIZES, selectedSize.value, selectedOrientation.value))

const allSelected = computed(() =>
  students.value.length > 0 && selectedStudentIds.value.length === students.value.length,
)
function toggleSelectAll() {
  if (allSelected.value) selectedStudentIds.value = []
  else selectedStudentIds.value = students.value.map((s) => s.id)
}
function toggleStudent(id) {
  const idx = selectedStudentIds.value.indexOf(id)
  if (idx === -1) selectedStudentIds.value.push(id)
  else selectedStudentIds.value.splice(idx, 1)
}
async function renderCardComponentToCanvas(component, props, widthPx) {
  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-10000px'
  host.style.top = '0'
  host.style.width = `${widthPx}px`
  host.style.pointerEvents = 'none'
  host.style.opacity = '0'
  host.style.zIndex = '-1'
  document.body.appendChild(host)

  const app = createApp({
    render: () => h(component, props),
  })

  try {
    app.mount(host)
    await nextTick()
    await waitForFonts()

    const node = host.firstElementChild || host
    return await toCanvas(node, {
      backgroundColor: '#ffffff',
      cacheBust: true,
      pixelRatio: 1,
    })
  } finally {
    app.unmount()
    host.remove()
  }
}

async function loadClasses() {
  loadingClasses.value = true
  try {
    const res = await fetchPreschoolClasses({ page: 1, perPage: 100 })
    classOptions.value = normalizeClassOptions(res.items || [])
  } catch {
    classOptions.value = []
  } finally {
    loadingClasses.value = false
  }
}
async function loadStudents() {
  if (!selectedClassId.value) { students.value=[]; return }
  loadingStudents.value = true; selectedStudentIds.value = []
  try {
    const res = await fetchPreschoolStudents({ page:1, perPage:200, classId: selectedClassId.value })
    students.value = res.items || []
  } catch { students.value = [] }
  finally { loadingStudents.value = false }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Generate
// ─────────────────────────────────────────────────────────────────────────────
async function generateFilePreview() {
  if (!selectedStudentIds.value.length) return
  generating.value = true
  const blobUrls = []
  try {
    const chosen = filterSelectedStudents(students.value, selectedStudentIds.value)
    const { name: className, level: classLevel } = getClassInfo(classOptions.value, selectedClassId.value)
    const year = getAcademicYear()
    const safeName = sanitizeFileName(className)
    const fmt = selectedFormat.value
    const batchFmt = chosen.length > 1 ? 'pdf' : fmt
    const orient = selectedOrientation.value
    const lang = selectedLang.value
    const { W: CARD_W, H: CARD_H } = getCurrentCardSize(CARD_SIZES, selectedSize.value, orient)
    const exportWidthPx = calculateExportWidth(CARD_W)
    const gapPx = calculateGapPixels(selectedGapMm.value)

    const photoImgCache = new Map()
    await Promise.allSettled(chosen.map(async (s) => {
      if (!s.avatarUrl) return
      try {
        const { img, objectUrl } = await loadStudentPhotoAsImg(s.avatarUrl, PUBLIC_IMAGE_ORIGIN)
        photoImgCache.set(s.id, img)
        blobUrls.push(objectUrl)
      } catch (error) {
        console.warn(`[ID Card] Photo failed for "${s.fullName || s.id}" (${s.avatarUrl}):`, error)
      }
    }))

    const photoDataUrlCache = new Map()
    for (const [studentId, photoImg] of photoImgCache.entries()) {
      try {
        photoDataUrlCache.set(studentId, imgToDataUrl(photoImg))
      } catch (error) {
        console.warn(`[ID Card] Photo data URL failed for "${studentId}":`, error)
      }
    }

    const qrDataCache = new Map()
    await Promise.allSettled(chosen.map(async (s) => {
      try {
        qrDataCache.set(s.id, await buildBackQrDataUrl(s))
      } catch (error) {
        console.warn(`[ID Card] QR generation failed for "${s.fullName || s.id}":`, error)
      }
    }))

    const captureFront = (student) => renderCardComponentToCanvas(
      IdCardPreview,
      {
        student: { ...student, avatarUrl: '' },
        className,
        classLevel,
        academicYear: year,
        orientation: orient,
        lang,
        width: exportWidthPx,
        photoSrc: photoDataUrlCache.get(student.id) || '',
      },
      exportWidthPx,
    )

    const captureBack = (student) => renderCardComponentToCanvas(
      IdCardBackPreview,
      {
        student: { ...student, avatarUrl: '' },
        className,
        classLevel,
        academicYear: year,
        orientation: orient,
        lang,
        width: exportWidthPx,
        qrDataUrl: qrDataCache.get(student.id) || '',
      },
      exportWidthPx,
    )

    if (batchFmt === 'pdf') {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: orient, unit: 'mm', format: [CARD_W, CARD_H] })
      let pageIndex = 0

      for (const student of chosen) {
        if (pageIndex > 0) doc.addPage([CARD_W, CARD_H])
        const frontCanvas = await captureFront(student)
        doc.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, CARD_W, CARD_H)
        pageIndex += 1

        doc.addPage([CARD_W, CARD_H])
        const backCanvas = await captureBack(student)
        doc.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, CARD_W, CARD_H)
        pageIndex += 1
      }

      doc.save(`id-cards-${safeName}-${year}.pdf`)
      return
    }

    const renderedCards = []
    for (const student of chosen) {
      renderedCards.push(await captureFront(student))
      renderedCards.push(await captureBack(student))
    }

    const canvas = document.createElement('canvas')
    canvas.width = renderedCards[0]?.width || exportWidthPx
    canvas.height = renderedCards.reduce((sum, card, index) => sum + card.height + (index > 0 ? gapPx : 0), 0)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    let y = 0
    renderedCards.forEach((card, index) => {
      ctx.drawImage(card, 0, y)
      y += card.height
      if (index < renderedCards.length - 1) y += gapPx
    })

    const mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png'
    const dataUrl = fmt === 'jpg' ? canvas.toDataURL(mime, 0.92) : canvas.toDataURL(mime)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `id-cards-${safeName}-${year}.${fmt}`
    a.click()
  } catch (error) {
    console.error('Preview generation failed', error)
    alert('Generation failed: ' + (error?.message || error))
  } finally {
    blobUrls.forEach((u) => URL.revokeObjectURL(u))
    generating.value = false
  }
}

onMounted(loadClasses)
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolAttendanceHubPage.cards.idCard.title')"
        :subtitle="t('preschoolAttendanceHubPage.cards.idCard.description')"
      />

      <!-- Controls -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-start gap-4">

          <!-- Class picker -->
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {{ t('preschoolAdminAttendancePage.filters.class') }}
            </span>
            <Select
              v-model="selectedClassId"
              :options="classOptions"
              option-label="label"
              option-value="value"
              class="min-w-[200px]"
              :placeholder="t('preschoolAdminAttendancePage.placeholders.class')"
              :loading="loadingClasses"
              @change="loadStudents"
            />
          </label>

          <!-- Card Size -->
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Card Size</span>
            <div class="flex gap-1">
              <button
                v-for="sz in CARD_SIZES"
                :key="sz.value"
                type="button"
                class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
                :class="selectedSize === sz.value
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'"
                @click="selectedSize = sz.value"
              >
                <i :class="['pi text-base', sz.icon]" />
                {{ sz.label }}
              </button>
            </div>
            <span class="text-xs text-slate-400">
              {{ currentSizeConfig.W }} × {{ currentSizeConfig.H }} mm
            </span>
          </label>

          <!-- Language -->
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Language</span>
            <div class="flex gap-1">
              <button
                v-for="lo in LANG_OPTIONS"
                :key="lo.value"
                type="button"
                class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
                :class="selectedLang === lo.value
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'"
                :title="lo.desc"
                @click="selectedLang = lo.value"
              >
                {{ lo.label }}
              </button>
            </div>
            <span v-if="selectedLang === 'kh' && selectedFormat === 'pdf'" class="text-xs text-amber-600">
              PDF in KH renders via canvas image
            </span>
          </label>

          <!-- Orientation -->
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Orientation</span>
            <div class="flex gap-1">
              <button
                v-for="opt in ORIENT_OPTIONS"
                :key="opt.value"
                type="button"
                class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
                :class="selectedOrientation === opt.value
                  ? 'border-teal-400 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'"
                @click="selectedOrientation = opt.value"
              >
                <i :class="['pi text-base', opt.icon]" />
                {{ opt.label }}
              </button>
            </div>
          </label>

          <!-- Format -->
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">File Format</span>
            <div class="flex gap-1">
              <button
                v-for="fmt in FORMAT_OPTIONS"
                :key="fmt.value"
                type="button"
                class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
                :class="selectedFormat === fmt.value
                  ? 'border-violet-400 bg-violet-50 text-violet-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'"
                @click="selectedFormat = fmt.value"
              >
                <i :class="['pi text-base', fmt.icon]" />
                {{ fmt.label }}
              </button>
            </div>
            <span class="text-xs text-slate-400">{{ FORMAT_OPTIONS.find((f) => f.value === selectedFormat)?.desc }}</span>
            <span class="text-xs text-amber-600">Each generated card includes front + back. 2+ selected cards export as PDF automatically.</span>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Card Gap (mm)</span>
            <input
              v-model.number="selectedGapMm"
              type="number"
              min="0"
              step="1"
              class="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
            <span class="text-xs text-slate-400">Used for PNG/JPG exports only</span>
          </label>

          <div class="ml-auto self-end">
            <Button
              type="button"
              variant="ghost"
              size="md"
              rounded="xl"
              @click="router.push({ name: 'dashboard-preschool-admin-attendance' })"
            >
              {{ t('preschoolAdminAttendancePage.actions.back') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loadingStudents" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        {{ t('preschoolReportsShared.loading') }}
      </div>

      <div v-else-if="selectedClassId && !students.length" class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        No students found in this class.
      </div>

      <!-- Student list -->
      <div v-else-if="students.length" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div class="flex items-center gap-3">
            <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" :checked="allSelected" class="h-4 w-4 rounded accent-violet-600" @change="toggleSelectAll">
              <span>Select all <span class="text-slate-400">({{ students.length }})</span></span>
            </label>
            <span v-if="selectedStudentIds.length" class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
              {{ selectedStudentIds.length }} selected
            </span>
          </div>
          <Button
            type="button" variant="primary" size="md" rounded="xl"
            :loading="generating" :disabled="generating || !selectedStudentIds.length"
            @click="generateFilePreview"
          >
            <i :class="['pi mr-1.5', selectedFormat==='pdf' ? 'pi-file-pdf' : 'pi-image']" />
            {{ generating ? 'Generating…' : `Generate ${selectedFormat.toUpperCase()}` }}
          </Button>
        </div>

        <div class="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <label
            v-for="student in students" :key="student.id"
            class="flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors"
            :class="selectedStudentIds.includes(student.id)
              ? 'border-violet-300 bg-violet-50'
              : 'border-slate-200 bg-white hover:border-slate-300'"
          >
            <input type="checkbox" :checked="selectedStudentIds.includes(student.id)"
              class="h-4 w-4 flex-shrink-0 rounded accent-violet-600" @change="toggleStudent(student.id)">
            <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800 ring-2 ring-blue-200">
              {{ getInitials(student) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-900">{{ student.fullName||student.name||'—' }}</p>
              <p class="text-xs text-slate-400">
                <span v-if="student.publicId || student.studentCode">#{{ student.publicId || student.studentCode }}</span>
                <span v-if="(student.publicId || student.studentCode) && student.gender"> · </span>
                <span v-if="student.gender" class="capitalize">{{ student.gender }}</span>
              </p>
            </div>
            <span
              :title="student.avatarUrl ? 'Has photo' : 'No photo'"
              class="shrink-0 text-xs"
              :class="student.avatarUrl ? 'text-emerald-500' : 'text-slate-300'"
            >
              <i class="pi pi-image" />
            </span>
          </label>
        </div>
      </div>

      <div v-else class="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-400">
        Select a class above to load students.
      </div>

      <!-- ── Card Preview ──────────────────────────────────────────────────── -->
      <div v-if="students.length" class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span class="text-sm font-semibold text-slate-700">Card Preview</span>
          <span class="text-xs text-slate-400">
            {{ selectedStudentIds.length || students.length }} card{{ (selectedStudentIds.length || students.length) !== 1 ? 's' : '' }}
            · {{ selectedOrientation }} · {{ CARD_SIZES.find(s => s.value === selectedSize)?.label }}
            · {{ currentSizeConfig.W }}×{{ currentSizeConfig.H }} mm
          </span>
        </div>

        <div class="flex flex-wrap p-4" :style="{ gap: `${Math.max(0, Number(selectedGapMm) || 0)}mm` }">
          <div
            v-for="student in (selectedStudentIds.length ? students.filter(s => selectedStudentIds.includes(s.id)) : students)"
            :key="student.id"
            class="flex flex-col gap-2"
          >
            <div class="flex items-center justify-between px-1">
              <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Front
              </span>
              <span class="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                Back
              </span>
            </div>
            <div class="flex flex-wrap items-start gap-3">
              <IdCardPreview
                :student="student"
                :class-name="classOptions.find(c => c.value === selectedClassId)?.label || ''"
                :class-level="classOptions.find(c => c.value === selectedClassId)?.level || ''"
                :academic-year="new Date().getMonth() >= 8
                  ? `${new Date().getFullYear()}-${new Date().getFullYear()+1}`
                  : `${new Date().getFullYear()-1}-${new Date().getFullYear()}`"
                :orientation="selectedOrientation"
                :lang="selectedLang"
                :width="selectedOrientation === 'portrait' ? 160 : 260"
              />
              <IdCardBackPreview
                :student="student"
                :class-name="classOptions.find(c => c.value === selectedClassId)?.label || ''"
                :class-level="classOptions.find(c => c.value === selectedClassId)?.level || ''"
                :academic-year="new Date().getMonth() >= 8
                  ? `${new Date().getFullYear()}-${new Date().getFullYear()+1}`
                  : `${new Date().getFullYear()-1}-${new Date().getFullYear()}`"
                :orientation="selectedOrientation"
                :lang="selectedLang"
                :width="selectedOrientation === 'portrait' ? 160 : 260"
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  </MainLayout>
</template>



