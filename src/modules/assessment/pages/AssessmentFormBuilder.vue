<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import { useLanguage } from '@/composables/useLanguage'
import { useFormBuilderStore } from '../stores/useFormBuilderStore'
import { useAutoSave } from '../composables/useAutoSave'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import FormSectionCanvas from '../components/form-builder/FormSectionCanvas.vue'

defineOptions({ name: 'AssessmentFormBuilderPage' })

const route   = useRoute()
const router  = useRouter()
const { t }   = useLanguage()
const store   = useFormBuilderStore()
const toast   = useToast()
const confirm = useConfirm()

// ── Active section ────────────────────────────────────────────────────────────
const activeSectionId = ref(null)
const activeSection   = computed(() =>
  store.sortedSections.find((s) => s.id === activeSectionId.value) ?? null,
)

watch(
  () => store.sortedSections,
  (sections) => {
    if (sections.length && !activeSectionId.value) {
      activeSectionId.value = sections[0].id
    }
  },
  { immediate: true },
)

// ── Inline form-name editing ──────────────────────────────────────────────────
const editingName = ref(false)
const localName   = ref('')

function startEditName() {
  if (store.template?.status === 'published') return
  localName.value = store.template?.name ?? ''
  editingName.value = true
}

function commitName() {
  if (localName.value.trim()) {
    store.template.name = localName.value.trim()
    store.markDirty()
  }
  editingName.value = false
}

// ── Add section ───────────────────────────────────────────────────────────────
const addingSectionTitle = ref('')
const showAddSection     = ref(false)

async function addSection() {
  const title = addingSectionTitle.value.trim() || t('formBuilder.sections.sectionTitle')
  await store.addSection({ title, order: store.sections.length + 1 })
  showAddSection.value    = false
  addingSectionTitle.value = ''
  // section returned by addSection is pushed into store — activate the new one
  const last = store.sortedSections[store.sortedSections.length - 1]
  if (last) activeSectionId.value = last.id
}

// ── Auto-save ────────────────────────────────────────────────────────────────
const { lastSavedAt, isSaving: autoSaving, scheduleAutoSave } = useAutoSave(
  () => store.saveTemplate({
    name:        store.template?.name,
    description: store.template?.description,
    module:      store.template?.module ?? 'preschool',
  }),
)

watch(() => store.isDirty, (dirty) => { if (dirty) scheduleAutoSave() })

// ── Publish ───────────────────────────────────────────────────────────────────
const statusSeverity = { draft: 'warn', published: 'success', archived: 'secondary' }

async function publish() {
  confirm.require({
    message:     t('formBuilder.publishConfirm'),
    header:      t('formBuilder.publish'),
    icon:        'pi pi-send',
    acceptClass: 'p-button-success',
    accept: async () => {
      try {
        await store.publishTemplate()
        toast.add({ severity: 'success', summary: t('formBuilder.published'), life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: t('common.error'), life: 3000 })
      }
    },
  })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await store.loadQuestionTypes()
  if (route.params.id) await store.loadTemplate(route.params.id)
})

onUnmounted(() => store.reset())
</script>

<template>
  <!-- Full-screen builder — no MainLayout chrome -->
  <div class="flex h-screen flex-col overflow-hidden bg-slate-100">

    <!-- ── Top bar ────────────────────────────────────────────────────────── -->
    <header class="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">

      <!-- Back -->
      <button
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        @click="router.push({ name: 'assessment-form-list' })"
      >
        <i class="pi pi-arrow-left text-sm" />
      </button>

      <!-- Form name (inline editable) -->
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <InputText
          v-if="editingName"
          v-model="localName"
          class="h-8 flex-1 text-sm font-semibold"
          autofocus
          @blur="commitName"
          @keyup.enter="commitName"
          @keyup.escape="editingName = false"
        />
        <button
          v-else
          class="group flex min-w-0 items-center gap-1.5 truncate"
          :disabled="store.template?.status === 'published'"
          @click="startEditName"
        >
          <span class="truncate text-sm font-semibold text-slate-800">
            {{ store.template?.name || t('formBuilder.newForm') }}
          </span>
          <i
            v-if="store.template?.status !== 'published'"
            class="pi pi-pencil text-xs text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </button>

        <Tag
          v-if="store.template?.status"
          :severity="statusSeverity[store.template.status] ?? 'secondary'"
          :value="store.template.status"
          class="shrink-0"
        />
      </div>

      <!-- Right controls -->
      <div class="flex shrink-0 items-center gap-3">
        <!-- Save indicator -->
        <span v-if="autoSaving" class="flex items-center gap-1.5 text-xs text-slate-400">
          <i class="pi pi-spin pi-spinner" />{{ t('formBuilder.autoSaving') }}
        </span>
        <span v-else-if="lastSavedAt" class="flex items-center gap-1.5 text-xs text-emerald-600">
          <i class="pi pi-check" />{{ t('formBuilder.autoSaved') }}
        </span>

        <!-- Description popover trigger (optional open field) -->
        <div v-if="store.template?.id" class="hidden md:block">
          <Textarea
            v-model="store.template.description"
            rows="1"
            auto-resize
            class="w-56 text-xs"
            :placeholder="t('formBuilder.formDescription')"
            @input="store.markDirty()"
          />
        </div>

        <Button
          v-if="store.template?.id && store.template?.status === 'draft'"
          :label="t('formBuilder.publish')"
          icon="pi pi-send"
          size="sm"
          @click="publish"
        />
      </div>
    </header>

    <!-- ── Body: sidebar + canvas ─────────────────────────────────────────── -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Left sidebar: section list -->
      <aside class="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">

        <div class="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Sections</span>
          <span class="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
            {{ store.sortedSections.length }}
          </span>
        </div>

        <!-- Loading skeleton -->
        <div v-if="store.isLoading" class="flex-1 space-y-2 p-3">
          <div v-for="i in 3" :key="i" class="h-8 animate-pulse rounded-lg bg-slate-100" />
        </div>

        <!-- Section list -->
        <ul v-else class="flex-1 overflow-y-auto py-1.5">
          <li
            v-for="(section, idx) in store.sortedSections"
            :key="section.id"
          >
            <button
              :class="[
                'group flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                activeSectionId === section.id
                  ? 'bg-blue-50 font-semibold text-blue-700'
                  : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800',
              ]"
              @click="activeSectionId = section.id"
            >
              <span
                :class="[
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  activeSectionId === section.id
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-slate-100 text-slate-500',
                ]"
              >
                {{ idx + 1 }}
              </span>
              <span class="flex-1 truncate">{{ section.title }}</span>
              <span class="shrink-0 text-xs text-slate-300">
                {{ (store.template?.questions ?? []).filter(q => q.section_id === section.id).length }}
              </span>
            </button>
          </li>

          <li v-if="!store.sortedSections.length" class="px-3 py-6 text-center text-xs text-slate-400">
            No sections yet
          </li>
        </ul>

        <!-- Add section -->
        <div class="border-t border-slate-100 p-2">
          <div v-if="showAddSection" class="space-y-1.5">
            <InputText
              v-model="addingSectionTitle"
              class="w-full text-sm"
              placeholder="Section title"
              autofocus
              @keyup.enter="addSection"
              @keyup.escape="showAddSection = false"
            />
            <div class="flex gap-1">
              <button
                class="flex-1 rounded bg-blue-600 py-1 text-xs font-medium text-white hover:bg-blue-700"
                @click="addSection"
              >
                Add
              </button>
              <button
                class="flex-1 rounded bg-slate-100 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                @click="showAddSection = false"
              >
                Cancel
              </button>
            </div>
          </div>
          <button
            v-else
            class="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            @click="showAddSection = true"
          >
            <i class="pi pi-plus" />
            {{ t('formBuilder.sections.addSection') }}
          </button>
        </div>
      </aside>

      <!-- Center: canvas -->
      <main class="flex flex-1 flex-col overflow-hidden">

        <!-- No template id yet — save prompt -->
        <div
          v-if="!store.template?.id && !store.isLoading"
          class="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        >
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <i class="pi pi-save text-2xl" />
          </div>
          <div>
            <p class="font-semibold text-slate-700">{{ t('formBuilder.saveBeforeSections') }}</p>
            <p class="mt-1 text-sm text-slate-400">Give the form a name in the topbar — it will auto-save.</p>
          </div>
        </div>

        <!-- No section selected -->
        <div
          v-else-if="!activeSection && !store.isLoading"
          class="flex flex-1 flex-col items-center justify-center gap-3 text-center"
        >
          <i class="pi pi-arrow-left text-3xl text-slate-200" />
          <p class="text-sm text-slate-400">Select or create a section to start adding questions.</p>
        </div>

        <!-- Loading -->
        <div v-else-if="store.isLoading" class="flex flex-1 items-center justify-center">
          <i class="pi pi-spin pi-spinner text-2xl text-slate-300" />
        </div>

        <!-- Section canvas -->
        <FormSectionCanvas
          v-else-if="activeSection"
          :key="activeSection.id"
          :section="activeSection"
          :form-id="store.template?.id"
          @deleted="activeSectionId = store.sortedSections[0]?.id ?? null"
        />
      </main>
    </div>
  </div>
</template>
