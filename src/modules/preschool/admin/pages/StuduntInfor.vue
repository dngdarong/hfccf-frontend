<script setup>
import { computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolAdminStuduntInforPage',
})

const { language } = useLanguage()
const isKh = computed(() => language.value === 'KH')
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'studunt-infor-page studunt-infor-page--kh' : 'studunt-infor-page'">
      <HeaderSection
        :title="isKh ? 'ព័ត៌មានសិស្ស' : 'Student Information'"
        :subtitle="
          isKh
            ? 'ទំព័រនេះត្រូវបានបង្កើតសម្រាប់គ្រប់គ្រងព័ត៌មានសិស្សមត្តេយ្យសិក្សា។'
            : 'This page is scaffolded for managing preschool student information.'
        "
      />

      <div class="studunt-infor-page__panel">
        <p class="studunt-infor-page__text">
          {{
            isKh
              ? 'អ្នកអាចបន្ថែមតារាងព័ត៌មានសិស្ស ការស្វែងរក ឬទម្រង់លម្អិតនៅទីនេះ។'
              : 'You can add a student directory, search tools, or detailed student forms here.'
          }}
        </p>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.studunt-infor-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.studunt-infor-page__panel {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px solid #dce6f2;
  background:
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 25px 60px -40px rgba(15, 23, 42, 0.5);
}

.studunt-infor-page__text {
  margin: 0;
  color: #475569;
  font-size: 0.96rem;
  line-height: 1.65;
}

.studunt-infor-page--kh .studunt-infor-page__text {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
  line-height: 1.75;
}

@media (max-width: 640px) {
  .studunt-infor-page__panel {
    padding: 1.1rem;
  }
}
</style>
