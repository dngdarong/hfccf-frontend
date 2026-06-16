<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'MainFooter',
})

const { t } = useLanguage()
</script>

<template>
  <footer class="border-t border-surface-200">
    <div class="container mx-auto px-4 py-6 text-center text-surface-500">
      <p>
        &copy; {{ new Date().getFullYear() }} HFCCF. {{ t('common.shell.allRightsReserved') }}
      </p>
    </div>
  </footer>
</template>
