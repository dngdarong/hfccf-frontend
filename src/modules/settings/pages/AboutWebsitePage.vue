<script setup>
import { computed } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import usersMock from '@/mocks/users.json'
import { mapUsers } from '@/services/mappers/userMapper'

const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')
const developmentTeams = computed(() => {
  // Keep department names from the system, but leave three empty member slots for manual edits later.
  const departmentList = [...new Set(
    mapUsers(usersMock)
      .map((user) => String(user.department || '').trim())
      .filter(Boolean),
  )]

  return departmentList
    .sort((left, right) => left.localeCompare(right))
    .map((department) => ({
      department,
      members: ['1', '2', '3'],
    }))
})

// Keep page copy centralized so the detail page stays aligned with the profile settings i18n keys.
const content = computed(() => ({
  title: t('pages.profile.aboutWebsite.pageTitle'),
  subtitle: t('pages.profile.aboutWebsite.pageSubtitle'),
  sections: [
    {
      title: t('pages.profile.aboutWebsite.overviewTitle'),
      text: t('pages.profile.aboutWebsite.overviewText'),
    },
    {
      title: t('pages.profile.aboutWebsite.releaseTitle'),
      text: t('pages.profile.aboutWebsite.releaseText'),
    },
    {
      title: t('pages.profile.aboutWebsite.teamTitle'),
      text: t('pages.profile.aboutWebsite.teamText'),
      groups: developmentTeams.value,
    },
    {
      title: t('pages.profile.aboutWebsite.supportDetailTitle'),
      text: t('pages.profile.aboutWebsite.supportDetailText'),
    },
  ],
}))
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'about-website-page about-website-page--kh' : 'about-website-page'">
      <HeaderSection :title="content.title" :subtitle="content.subtitle" />

      <div class="about-website-page__grid">
        <article
          v-for="section in content.sections"
          :key="section.title"
          class="about-website-page__card"
        >
          <h3 class="about-website-page__card-title">{{ section.title }}</h3>
          <p class="about-website-page__card-copy">{{ section.text }}</p>
          <!-- Render grouped team details when a section needs department-specific member lists. -->
          <div v-if="Array.isArray(section.groups) && section.groups.length" class="about-website-page__team-groups">
            <section
              v-for="group in section.groups"
              :key="group.department"
              class="about-website-page__team-group"
            >
              <p class="about-website-page__team-group-title">{{ group.department }}</p>
              <p class="about-website-page__team-group-label">
                {{ t('pages.profile.aboutWebsite.teamMembersTitle') }}
              </p>
              <ul class="about-website-page__team-group-members">
                <li
                  v-for="(member, index) in group.members"
                  :key="`${group.department}-${index}`"
                  class="about-website-page__team-group-member"
                >
                  {{ member || '________________' }}
                </li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.about-website-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.about-website-page__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.about-website-page__card {
  border: 1px solid #e2e8f0;
  border-radius: 1.1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
  box-shadow:
    0 12px 30px -20px rgba(15, 23, 42, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 1.1rem 1.15rem;
}

.about-website-page__card-title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
}

.about-website-page__card-copy {
  margin: 0.55rem 0 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.75;
}

.about-website-page__team-groups {
  margin-top: 1rem;
  display: grid;
  gap: 0.85rem;
}

.about-website-page__team-group {
  border: 1px solid #e2e8f0;
  border-radius: 0.9rem;
  background: rgba(248, 250, 252, 0.75);
  padding: 0.85rem 0.95rem;
}

.about-website-page__team-group-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 800;
}

.about-website-page__team-group-label {
  margin: 0.4rem 0 0.5rem;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.about-website-page__team-group-members {
  margin: 0;
  padding-left: 1.1rem;
  color: #475569;
  display: grid;
  gap: 0.35rem;
}

.about-website-page__team-group-member {
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .about-website-page__grid {
    grid-template-columns: 1fr;
  }
}

.about-website-page--kh .about-website-page__card-title,
.about-website-page--kh .about-website-page__card-copy {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>
