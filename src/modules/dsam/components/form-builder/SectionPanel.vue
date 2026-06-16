<script setup>
import { ref } from 'vue'
import { useDsamFormBuilderStore } from '../../stores/useDsamFormBuilderStore'

const store = useDsamFormBuilderStore()

const newTitle = ref('')
const showAdd  = ref(false)

async function add() {
  if (!newTitle.value.trim()) return
  await store.addSection({ title: newTitle.value.trim(), scoring_weight: 1 })
  newTitle.value = ''
  showAdd.value = false
}
</script>

<template>
  <aside class="flex h-full flex-col border-r border-slate-200 bg-slate-50 w-56 shrink-0">
    <div class="flex items-center justify-between px-3 py-3 border-b border-slate-200">
      <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Sections</span>
      <button
        v-if="!store.isPublished"
        class="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
        title="Add section"
        @click="showAdd = !showAdd"
      >
        <i class="pi pi-plus text-xs" />
      </button>
    </div>

    <div v-if="showAdd" class="p-2 border-b border-slate-200">
      <input
        v-model="newTitle"
        class="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Section title"
        autofocus
        @keyup.enter="add"
        @keyup.escape="showAdd = false"
      />
      <div class="mt-1.5 flex gap-1">
        <button class="flex-1 rounded bg-blue-600 py-1 text-xs text-white hover:bg-blue-700" @click="add">Add</button>
        <button class="flex-1 rounded bg-slate-200 py-1 text-xs text-slate-600" @click="showAdd = false">Cancel</button>
      </div>
    </div>

    <ul class="flex-1 overflow-y-auto py-1">
      <li
        v-for="(section, idx) in store.sections"
        :key="section.id"
        :class="[
          'group flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
          store.activeSectionId === section.id
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-slate-600 hover:bg-slate-100',
        ]"
        @click="store.setActiveSection(section.id)"
      >
        <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500 group-[.bg-blue-50]:bg-blue-200 group-[.bg-blue-50]:text-blue-700">
          {{ idx + 1 }}
        </span>
        <span class="flex-1 truncate">{{ section.title }}</span>
        <span class="text-xs text-slate-400">{{ (section.questions ?? []).length }}</span>
      </li>
      <li v-if="!store.sections.length" class="px-3 py-6 text-center text-xs text-slate-400">
        No sections yet
      </li>
    </ul>
  </aside>
</template>
