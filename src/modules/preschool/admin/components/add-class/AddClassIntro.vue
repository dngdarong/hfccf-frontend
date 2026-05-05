<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AddClassIntro',
})

const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')
</script>

<template>
  <section :class="isKh ? 'add-class-intro add-class-intro--kh' : 'add-class-intro'">
    <p class="add-class-intro__eyebrow">{{ t('preschoolAddClass.introEyebrow') }}</p>
    <h3 class="add-class-intro__title">{{ t('preschoolAddClass.introTitle') }}</h3>
    <p class="add-class-intro__text">{{ t('preschoolAddClass.introText') }}</p>
  </section>
</template>

<style scoped>
.add-class-intro {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.7) 0%, rgba(255, 255, 255, 0.96) 100%);
}

.add-class-intro__eyebrow {
  margin: 0;
  color: #0f6f8f;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.add-class-intro__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 800;
}

.add-class-intro__text {
  margin: 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.add-class-intro--kh .add-class-intro__eyebrow,
.add-class-intro--kh .add-class-intro__title,
.add-class-intro--kh .add-class-intro__text {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-class-intro--kh .add-class-intro__eyebrow {
  text-transform: none;
  letter-spacing: 0.01em;
}

.add-class-intro--kh .add-class-intro__text {
  line-height: 1.7;
}
</style>
