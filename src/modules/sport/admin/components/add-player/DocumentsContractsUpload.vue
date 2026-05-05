<script setup>
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import playersManagementData from '@/mocks/sport/players-management-data.json'

defineOptions({
  name: 'DocumentsContractsUpload',
})

const { t } = useI18n()
const route = useRoute()

// UI-only mock upload: we keep selected File objects in memory and never send them anywhere.
const MAX_FILE_BYTES = 10 * 1024 * 1024
const ACCEPTED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'application/pdf'])
const ACCEPT_ATTR = '.png,.jpg,.jpeg,.pdf'

const fileInputRef = ref(null)
const isHovering = ref(false)
const isDraggingOver = ref(false)
const errorMessage = ref('')
const isUploading = ref(false)

// Store minimal metadata for display + removal.
// Note: mock JSON can't store real File objects, so mock entries use `file: null`.
const selectedFiles = ref([])

function formatBytes(bytes) {
  const value = Number(bytes || 0)
  if (!value) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const display = value / 1024 ** index
  return `${display.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

function isPdf(file) {
  return String(file?.type || '').toLowerCase() === 'application/pdf'
}

function validateFile(file) {
  if (!file) return t('sportAddPlayer.documentsContracts.errors.empty')
  if (!ACCEPTED_MIME_TYPES.has(file.type)) return t('sportAddPlayer.documentsContracts.errors.type')
  if (file.size > MAX_FILE_BYTES) return t('sportAddPlayer.documentsContracts.errors.size')
  return ''
}

function addFiles(files) {
  const list = Array.from(files || [])
  if (!list.length) return

  // Reset error for a new selection attempt; the first invalid file will set it again.
  errorMessage.value = ''
  isUploading.value = true

  // Deduplicate by stable file signature (name + size + lastModified).
  // This prevents users from seeing “double entries” when they pick/drag the same file again.
  const existingKeys = new Set(
    selectedFiles.value.map((item) => {
      const name = String(item?.name || item?.file?.name || '')
      const size = Number(item?.size ?? item?.file?.size ?? 0)
      const lastModified = Number(item?.lastModified ?? item?.file?.lastModified ?? 0)
      return `${name}|${size}|${lastModified}`
    }),
  )

  const next = []
  for (const file of list) {
    const message = validateFile(file)
    if (message) {
      errorMessage.value = message
      // Stop at the first error to keep UX simple and obvious.
      break
    }

    const key = `${file.name}|${file.size}|${file.lastModified}`
    if (existingKeys.has(key)) continue
    existingKeys.add(key)

    next.push({
      // Use the stable key for the list `:key` so Vue can track items reliably.
      id: key,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      file,
      source: 'local',
    })
  }

  if (!next.length) return
  // Append unique files (dedupe prevents duplicates).
  selectedFiles.value = [...selectedFiles.value, ...next]
  // Mock loading: keep it short but visible so users understand the UI is processing their files.
  setTimeout(() => {
    isUploading.value = false
  }, 450)
}

function openPicker() {
  errorMessage.value = ''
  // Keep this synchronous: browsers may block file pickers if triggered after an async boundary.
  if (isUploading.value) return
  fileInputRef.value?.click?.()
}

function onFileChange(event) {
  addFiles(event?.target?.files)
  // Allow picking the same file again after removal.
  if (event?.target) event.target.value = ''
}

function onDrop(event) {
  event.preventDefault()
  event.stopPropagation()
  if (isUploading.value) return
  isDraggingOver.value = false
  addFiles(event?.dataTransfer?.files)
}

function onDragOver(event) {
  event.preventDefault()
  event.stopPropagation()
  if (isUploading.value) return
  isDraggingOver.value = true
}

function onDragLeave(event) {
  event.preventDefault()
  event.stopPropagation()
  isDraggingOver.value = false
}

function removeFile(id) {
  if (isUploading.value) return
  selectedFiles.value = selectedFiles.value.filter((item) => item.id !== id)
}

function onDropzoneKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openPicker()
  }
}

const dropzoneClass = computed(() => {
  const base =
    'mt-3 rounded-[14px] border-2 border-dashed bg-slate-50/60 p-8 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-200'
  if (errorMessage.value) return `${base} border-rose-400 bg-rose-50/40`
  if (isUploading.value) return `${base} border-slate-300 bg-slate-50 opacity-80`
  if (isDraggingOver.value) return `${base} border-sky-500 border-solid bg-sky-50/70`
  if (isHovering.value) return `${base} border-slate-400 bg-slate-50`
  return `${base} border-slate-300`
})

const labels = computed(() => ({
  title: t('sportAddPlayer.documentsContracts.title'),
  signedContract: t('sportAddPlayer.documentsContracts.signedContract'),
  uploadFiles: t('sportAddPlayer.documentsContracts.uploadFiles'),
  dragAndDrop: t('sportAddPlayer.documentsContracts.dragAndDrop'),
  helper: t('sportAddPlayer.documentsContracts.helper'),
}))

watchEffect(() => {
  // Prefill from mock when the page is opened with `?id=ply_001`.
  const id = String(route.query.id || '').trim()
  if (!id) return

  const found = (Array.isArray(playersManagementData) ? playersManagementData : []).find(
    (item) => String(item?.id || '') === id,
  )
  if (!found) return

  const mockFiles = Array.isArray(found.signedContractFiles) ? found.signedContractFiles : []
  selectedFiles.value = mockFiles
    .filter((item) => item && item.name && Number.isFinite(Number(item.size)))
    .map((item) => {
      const name = String(item.name || '')
      const size = Number(item.size || 0)
      const type = String(item.type || '')
      const lastModified = 0
      return {
        id: `${name}|${size}|${lastModified}`,
        name,
        size,
        type,
        lastModified,
        file: null,
        source: 'mock',
      }
    })
})
</script>

<template>
  <section class="rounded-[14px] border border-[#e5e7eb] bg-white p-6 sm:p-7">
    <header class="flex items-start gap-3">
      <div
        class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-rose-500 text-[0.8rem] font-bold text-white"
        aria-hidden="true"
      >
        4
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="text-[1.05rem] font-semibold text-slate-900">{{ labels.title }}</h2>
        <div class="mt-3 h-px w-full bg-[#e5e7eb]" role="presentation"></div>
      </div>
    </header>

    <div class="mt-7">
      <label class="block">
        <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {{ labels.signedContract }}
        </span>

        <!-- Hidden input: opened by clicking the action text or using keyboard on the dropzone. -->
        <input
          ref="fileInputRef"
          type="file"
          :accept="ACCEPT_ATTR"
          multiple
          class="sr-only"
          @change="onFileChange"
        />

        <div
          :class="dropzoneClass"
          role="button"
          tabindex="0"
          aria-label="Upload signed contract files"
          :aria-invalid="Boolean(errorMessage)"
          @mouseenter="isHovering = true"
          @mouseleave="isHovering = false"
          @keydown="onDropzoneKeydown"
          @click="openPicker"
          @dragenter="onDragOver"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <div class="mx-auto flex max-w-[420px] flex-col items-center text-center">
            <!-- Minimal file icon -->
            <svg
              class="h-10 w-10 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
              <path
                d="M14 2v5h5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
              />
            </svg>

            <p class="mt-3 text-[0.95rem] font-medium text-slate-900">
              <button
                type="button"
                class="font-semibold text-sky-600 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-200 rounded"
                @click.stop="openPicker"
              >
                {{ labels.uploadFiles }}
              </button>
              <span class="text-slate-600"> {{ labels.dragAndDrop }}</span>
            </p>

            <p class="mt-1.5 text-[0.82rem] text-slate-500">
              {{ labels.helper }}
            </p>

            <div v-if="isUploading" class="mt-4 flex items-center gap-2 text-slate-600">
              <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  stroke-width="2"
                  class="opacity-25"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  class="opacity-75"
                />
              </svg>
              <span class="text-[0.85rem] font-medium">{{ t('common.loading') }}</span>
            </div>

            <p v-if="errorMessage" class="mt-3 text-[0.85rem] font-medium text-rose-600">
              {{ errorMessage }}
            </p>
          </div>

          <TransitionGroup
            v-if="selectedFiles.length"
            name="docs-files"
            tag="ul"
            class="mt-6 grid grid-cols-1 gap-3"
            aria-label="Selected files"
          >
            <li
              v-for="item in selectedFiles"
              :key="item.id"
              class="flex items-center justify-between gap-3 rounded-[12px] border border-slate-200 bg-white px-4 py-3"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50 text-slate-500"
                  aria-hidden="true"
                >
                  <svg
                    v-if="isPdf({ type: item.type || item.file?.type })"
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="none"
                  >
                    <path
                      d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M14 2v5h5"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8 14h8"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none">
                    <path
                      d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <path
                      d="M8 14l2-2 2 2 4-4 2 2"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>

                <div class="min-w-0">
                  <p class="truncate text-[0.92rem] font-semibold text-slate-900">
                    {{ item.name || item.file?.name }}
                  </p>
                  <p class="text-[0.78rem] text-slate-500">
                    {{ formatBytes(item.size ?? item.file?.size) }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
                :aria-label="`Remove ${item.name || item.file?.name || ''}`"
                @click.stop="removeFile(item.id)"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </li>
          </TransitionGroup>
        </div>
      </label>
    </div>
  </section>
</template>

<style scoped>
.docs-files-enter-active,
.docs-files-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}
.docs-files-enter-from,
.docs-files-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
