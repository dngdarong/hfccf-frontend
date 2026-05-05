<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

// Keep all display copy together because this component is informational and has no form state.
const content = computed(() => ({
  title: t('pages.profile.aboutWebsite.title'),
  description: t('pages.profile.aboutWebsite.description'),
  detailsButton: t('pages.profile.aboutWebsite.detailsButton'),
  items: [
    {
      label: t('pages.profile.aboutWebsite.platform'),
      value: 'HFCCF Frontend',
    },
    {
      label: t('pages.profile.aboutWebsite.version'),
      value: 'v1.0.0',
    },
    {
      label: t('pages.profile.aboutWebsite.status'),
      value: t('pages.profile.aboutWebsite.statusValue'),
    },
  ],
  noteTitle: t('pages.profile.aboutWebsite.supportTitle'),
  note: t('pages.profile.aboutWebsite.supportMessage'),
}))
</script>

<template>
  <section
    class="about-website-card overflow-hidden rounded-[1.1rem] border border-surface-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.92)_100%)] shadow-[0_12px_30px_-20px_rgba(15,23,42,0.55),inset_0_1px_0_rgba(255,255,255,0.9)]"
  >
    <header
      class="border-b border-surface-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 pt-4 pb-[0.85rem] sm:px-[1.15rem] sm:pt-[1.05rem] sm:pb-[0.9rem]"
    >
      <h3 class="m-0 text-base leading-tight font-extrabold text-surface-900">
        {{ content.title }}
      </h3>
      <p class="mt-[0.32rem] text-[0.86rem] leading-[1.5] text-surface-600">
        {{ content.description }}
      </p>
    </header>

    <div class="grid gap-4 p-4 sm:px-[1.15rem] sm:py-[1.1rem]">
      <!-- Use a compact stat list so the website details are easy to scan beside editable settings forms. -->
      <div class="grid gap-3">
        <div
          v-for="item in content.items"
          :key="item.label"
          class="flex items-center justify-between rounded-xl border border-surface-200 bg-white px-4 py-3"
        >
          <span class="text-sm font-semibold text-surface-700">{{ item.label }}</span>
          <span class="text-sm font-bold text-surface-900">{{ item.value }}</span>
        </div>
      </div>

      <div class="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
        <p class="text-sm font-bold text-sky-900">{{ content.noteTitle }}</p>
        <p class="mt-1 text-sm leading-6 text-sky-800">{{ content.note }}</p>
      </div>

      <div class="flex justify-end">
        <!-- Use a link here because this action is navigation only. -->
        <RouterLink
          :to="{ name: 'settings-about-website' }"
          class="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4.5 py-2.5 text-sm font-bold text-surface-700 shadow-[0_8px_18px_-18px_rgba(15,23,42,0.16)] transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 hover:text-surface-900 focus-visible:outline-none focus-visible:shadow-focus active:scale-[0.98]"
        >
          {{ content.detailsButton }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>
