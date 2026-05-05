<script setup>
import { computed, reactive, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import playersManagementData from '@/mocks/sport/players-management-data.json'

defineOptions({
  name: 'ParentGuardianInformation',
})

const { t, te } = useI18n()
const route = useRoute()

// UI-only component: these defaults match the screenshot request.
// When wiring to an API later, lift this state up and v-model it from the page.
const form = reactive({
  fatherName: '',
  fatherAge: '',
  fatherOccupation: '',
  motherName: '',
  motherAge: '',
  motherOccupation: '',
  guardianPhone: '',
  // Store as a stable value; translate the visible label via i18n.
  relationship: '',
})

watchEffect(() => {
  // Component uses the same mock dataset as the rest of the Add Player page.
  // When the Add Player page is opened with `?id=ply_001`, we auto-fill the fields.
  const id = String(route.query.id || '').trim()
  if (!id) return

  const found = (Array.isArray(playersManagementData) ? playersManagementData : []).find(
    (item) => String(item?.id || '') === id,
  )
  if (!found) return

  form.fatherName = String(found.fatherName || form.fatherName)
  form.fatherAge = String(found.fatherAge || '')
  form.fatherOccupation = String(found.fatherOccupation || form.fatherOccupation)
  form.motherName = String(found.motherName || form.motherName)
  form.motherAge = String(found.motherAge || '')
  form.motherOccupation = String(found.motherOccupation || form.motherOccupation)
  form.guardianPhone = String(found.guardianPhone || form.guardianPhone)
  form.relationship = String(found.relationship || form.relationship)
})

const labels = computed(() => ({
  title: t('sportAddPlayer.parentGuardian.title'),
  fatherTitle: t('sportAddPlayer.parentGuardian.fatherTitle'),
  motherTitle: t('sportAddPlayer.parentGuardian.motherTitle'),
  name: t('sportAddPlayer.parentGuardian.fields.name'),
  age: t('sportAddPlayer.parentGuardian.fields.age'),
  occupation: t('sportAddPlayer.parentGuardian.fields.occupation'),
  guardianPhone: t('sportAddPlayer.parentGuardian.fields.guardianPhone'),
  relationship: t('sportAddPlayer.parentGuardian.fields.relationship'),
}))

function relationshipLabel(value) {
  const key = `sportAddPlayer.parentGuardian.relationshipOptions.${String(value || '').trim().toLowerCase()}`
  return te(key) ? t(key) : String(value || '')
}

const relationshipOptions = computed(() => ['father', 'mother', 'guardian'])
</script>

<template>
  <section class="rounded-[14px] border border-[#e5e7eb] bg-white p-6 sm:p-7">
    <header class="flex items-start gap-3">
      <div
        class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-orange-500 text-[0.8rem] font-bold text-white"
        aria-hidden="true"
      >
        3
      </div>

      <div class="min-w-0 flex-1">
        <h2 class="text-[1.05rem] font-semibold text-slate-900">
          {{ labels.title }}
        </h2>
        <div class="mt-3 h-px w-full bg-[#e5e7eb]" role="presentation"></div>
      </div>
    </header>

    <div class="mt-7 flex flex-col gap-8">
      <!-- Father -->
      <article class="rounded-[14px] border border-[#e5e7eb] bg-white p-6 sm:p-7">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-sky-500" aria-hidden="true"></span>
          <h3 class="text-[0.98rem] font-semibold text-slate-900">{{ labels.fatherTitle }}</h3>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <label class="block">
            <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
              {{ labels.name }}
            </span>
            <input
              v-model="form.fatherName"
              type="text"
              class="mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-300"
              autocomplete="off"
            />
          </label>

          <label class="block">
            <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
              {{ labels.age }}
            </span>
            <input
              v-model="form.fatherAge"
              type="text"
              inputmode="numeric"
              class="mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-300"
              autocomplete="off"
            />
          </label>

          <label class="block">
            <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
              {{ labels.occupation }}
            </span>
            <input
              v-model="form.fatherOccupation"
              type="text"
              class="mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-300"
              autocomplete="off"
            />
          </label>
        </div>
      </article>

      <!-- Mother -->
      <article class="rounded-[14px] border border-[#e5e7eb] bg-white p-6 sm:p-7">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-pink-500" aria-hidden="true"></span>
          <h3 class="text-[0.98rem] font-semibold text-slate-900">{{ labels.motherTitle }}</h3>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <label class="block">
            <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
              {{ labels.name }}
            </span>
            <input
              v-model="form.motherName"
              type="text"
              class="mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-300"
              autocomplete="off"
            />
          </label>

          <label class="block">
            <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
              {{ labels.age }}
            </span>
            <input
              v-model="form.motherAge"
              type="text"
              inputmode="numeric"
              class="mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-300"
              autocomplete="off"
            />
          </label>

          <label class="block">
            <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
              {{ labels.occupation }}
            </span>
            <input
              v-model="form.motherOccupation"
              type="text"
              class="mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-300"
              autocomplete="off"
            />
          </label>
        </div>
      </article>

      <!-- Contact + relationship -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <label class="block">
          <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
            {{ labels.guardianPhone }} <span class="text-red-500">*</span>
          </span>

          <div class="relative mt-2">
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500" aria-hidden="true">
              <!-- Phone icon -->
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.2 3.4c.4-1 1.5-1.5 2.5-1l2.1 1c.9.4 1.3 1.4 1 2.3l-.6 1.7c-.2.6-.1 1.2.3 1.7l2 2.3c.4.4 1 .6 1.6.4l1.8-.6c.9-.3 1.9.1 2.3 1l1 2.1c.4 1 0 2.1-1 2.5l-1.3.6c-1.4.6-3 .7-4.5.2-3.4-1.1-7.2-4.9-8.3-8.3-.5-1.5-.4-3.1.2-4.5l.6-1.3Z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>

            <input
              v-model="form.guardianPhone"
              type="tel"
              class="w-full rounded-[12px] border border-[#e5e7eb] bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-slate-300"
              autocomplete="tel"
            />
          </div>
        </label>

        <label class="block">
          <span class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate-600">
            {{ labels.relationship }}
          </span>
          <select
            v-model="form.relationship"
            class="mt-2 w-full rounded-[12px] border border-[#e5e7eb] bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-300"
          >
            <option
              v-for="option in relationshipOptions"
              :key="option"
              :value="option"
            >
              {{ relationshipLabel(option) }}
            </option>
          </select>
        </label>
      </div>
    </div>
  </section>
</template>
