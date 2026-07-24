<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  columns: {
    type: Array,
    default: () => [],
  },
  rows: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '',
  },
  rowTo: {
    type: Function,
    default: null,
  },
})

const router = useRouter()

const hasRows = computed(() => props.rows.length > 0)

function resolveTo(row) {
  if (typeof props.rowTo !== 'function') {
    return null
  }

  const target = props.rowTo(row)
  if (!target) {
    return null
  }

  if (typeof target === 'string') {
    return target
  }

  if (target?.name && router.hasRoute(target.name)) {
    return target
  }

  return null
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-4">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div v-if="!hasRows" class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
      {{ emptyText }}
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-slate-200">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left font-semibold text-slate-700"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-for="(row, rowIndex) in rows" :key="row.id || rowIndex">
            <template v-if="resolveTo(row)">
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-4 py-3 text-slate-700"
              >
                <RouterLink
                  v-if="column.key === columns[0]?.key"
                  :to="resolveTo(row)"
                  class="block cursor-pointer rounded-md px-1 py-1 font-medium text-slate-900 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  :aria-label="`${row[column.key] ?? '—'} ${emptyText || title}`"
                >
                  {{ row[column.key] ?? '—' }}
                </RouterLink>
                <span v-else>{{ row[column.key] ?? '—' }}</span>
              </td>
            </template>
            <template v-else>
              <td
                v-for="column in columns"
                :key="column.key"
                class="px-4 py-3 text-slate-700"
              >
                {{ row[column.key] ?? '—' }}
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
