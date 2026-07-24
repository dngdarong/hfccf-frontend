import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PrimeVue from 'primevue/config'
import { createMemoryHistory, createRouter } from 'vue-router'
import ProfileSettings from '@/modules/settings/pages/ProfileSettings.vue'
import { createTestI18n } from '@/tests/helpers/mount'
import { makeTeacherPreschool } from '@/tests/helpers/factories'
import { useUserStore } from '@/store/userStore'
import enCommon from '@/i18n/en/common'
import enDashboardPages from '@/i18n/en/dashboard/pages'
import khCommon from '@/i18n/kh/common'
import khDashboardPages from '@/i18n/kh/dashboard/pages'

const longTeacherProfile = makeTeacherPreschool({
  fullName: 'Teacher Alexandra Penelope Montgomery-Sivara With A Very Long Display Name',
  name: 'Teacher Alexandra Penelope Montgomery-Sivara With A Very Long Display Name',
  username: 'teacher.preschool.alexandra.montgomery.sivara.with.an.exceptionally.long.username',
  email: 'teacher.preschool.alexandra.montgomery.sivara.with.an.exceptionally.long.email.address@hfccf-school-example.org',
  phone: '+855 12 345 678 901 234',
  department: 'Preschool Curriculum and Family Support Coordination',
  bio: 'Maintains daily teacher notes, parent contact summaries, and classroom follow-up reminders.',
})

function mountProfileSettings(locale = 'en') {
  const i18n = createTestI18n({
    en: { pages: enDashboardPages, common: enCommon },
    kh: { pages: khDashboardPages, common: khCommon },
  })
  i18n.global.locale.value = locale

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  })
  const pinia = createPinia()
  setActivePinia(pinia)

  const userStore = useUserStore()
  userStore.currentUser = longTeacherProfile

  return mount(ProfileSettings, {
    global: {
      plugins: [i18n, pinia, router, PrimeVue],
      stubs: {
        MainLayout: { template: '<div class="main-layout"><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header class="header-section"><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        GeneralInformation: { template: '<section class="general-information-stub" />' },
        SecuritySettings: { template: '<section class="security-settings-stub" />' },
        AboutWebsite: { template: '<section class="about-website-stub" />' },
        AlertSuccess: { template: '<div class="alert-success-stub" />' },
        Button: { template: '<button type="button"><slot /></button>' },
      },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProfileSettings', () => {
  it('renders long profile values with stable stacked contact rows', async () => {
    const wrapper = mountProfileSettings('en')
    const emailValue = wrapper.find('[data-profile-field="email"]')

    expect(wrapper.text()).toContain(longTeacherProfile.email)
    expect(wrapper.text()).toContain(longTeacherProfile.username)
    expect(wrapper.text()).toContain('Profile & Settings')
    expect(wrapper.text()).not.toContain('pages.profile.')
    expect(wrapper.find('.profile-settings-layout').exists()).toBe(true)
    expect(wrapper.find('.profile-settings-layout__sidebar').exists()).toBe(true)
    expect(wrapper.find('.profile-settings-layout__content').exists()).toBe(true)
    expect(emailValue.exists()).toBe(true)
    expect(emailValue.classes()).toContain('truncate')
    expect(emailValue.attributes('title')).toBe(longTeacherProfile.email)
  })

  it('renders the Khmer locale title and keeps long values readable', async () => {
    const wrapper = mountProfileSettings('kh')

    expect(wrapper.text()).toContain('ប្រវត្តិរូប និងការកំណត់')
    expect(wrapper.text()).toContain(longTeacherProfile.email)
    expect(wrapper.text()).not.toContain('pages.profile.')
    expect(wrapper.find('#profileDisplayName').exists()).toBe(true)
    expect(wrapper.find('#profileDisplayBio').exists()).toBe(true)
    expect(wrapper.find('[data-profile-field="email"]').exists()).toBe(true)
  })
})
