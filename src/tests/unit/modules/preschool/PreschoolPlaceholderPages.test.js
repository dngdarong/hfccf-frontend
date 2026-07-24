import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import FormManagement from '@/modules/preschool/admin/pages/forms/FormManagement.vue'
import AttendanceManagement from '@/modules/preschool/admin/pages/attendance/AttendanceManagement.vue'
import TeacherClassroomResources from '@/modules/preschool/teacher/pages/TeacherClassroomResources.vue'
import Healthy from '@/modules/preschool/teacher/pages/Healthy.vue'

// Keep scaffold pages visible and localized so unfinished Preschool routes do
// not silently drift into broken or misleading production copy.
const placeholderStubs = {
  MainLayout: { template: '<div><slot /></div>' },
  HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
  PreschoolPlaceholderState: { props: ['eyebrow', 'title', 'subtitle', 'description'], template: '<div><h2>{{ title }}</h2><p>{{ subtitle }}</p><small>{{ description }}</small></div>' },
  RouterLink: { props: ['to'], template: '<a><slot /></a>' },
}

beforeEach(() => {
  vi.restoreAllMocks()
})

function mountPlaceholder(page) {
  return mountWithPlugins(page, {
    messages: {
      en: enPreschool,
    },
    global: {
      stubs: placeholderStubs,
    },
  })
}

describe('Preschool placeholder pages', () => {
  it('renders the admin scaffold pages with explicit copy', async () => {
    const pages = [
      [FormManagement, enPreschool.preschoolScaffold.formManagement.title],
      [AttendanceManagement, enPreschool.preschoolAttendanceHubPage.title],
    ]

    for (const [page, title] of pages) {
      const wrapper = mountPlaceholder(page)
      await flushPromises()
      expect(wrapper.text()).toContain(title)
    }
  })

  it('renders the teacher scaffold pages with explicit copy', async () => {
    const pages = [
      [TeacherClassroomResources, enPreschool.preschoolClassroomResources.title],
      [Healthy, enPreschool.preschoolHealthPage.teacher.title],
    ]

    for (const [page, title] of pages) {
      const wrapper = mountPlaceholder(page)
      await flushPromises()
      expect(wrapper.text()).toContain(title)
    }
  })
})
