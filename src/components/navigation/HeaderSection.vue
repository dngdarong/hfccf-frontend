<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import Breadcrumb from './Breadcrumb.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()
// Allow parent overrides while keeping localized defaults for standalone usage.
const resolvedTitle = computed(() => props.title || t('common.dashboardOverview'))
const resolvedSubtitle = computed(() => props.subtitle || t('common.dashboardOverviewSubtitle'))
</script>

<template>
  <header class="mb-4 max-sm:mb-[0.7rem]">
    <Breadcrumb />
    <h2 class="m-0 text-[clamp(1.35rem,2.2vw,1.95rem)] leading-tight font-extrabold text-hope-dark max-sm:text-[1.2rem] max-[420px]:text-[1.08rem]">
      {{ resolvedTitle }}
    </h2>
    <p
      class="mt-[0.35rem] text-[0.95rem] leading-[1.35] text-[color-mix(in_srgb,var(--hope-dark)_62%,white)] max-sm:mt-[0.3rem] max-sm:text-[0.84rem] max-[420px]:text-[0.8rem]"
    >
      {{ resolvedSubtitle }}
    </p>
  </header>
</template>
