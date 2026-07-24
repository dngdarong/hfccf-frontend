import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import FormManagement from '@/modules/preschool/admin/pages/forms/FormManagement.vue'
import { preschoolRoutes } from '@/modules/preschool/routes'

beforeEach(() => {
  vi.restoreAllMocks()
})

function mountFormManagement() {
  return mountWithPlugins(FormManagement, {
    messages: {
      en: enPreschool,
      kh: khPreschool,
    },
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Button: {
          props: ['label', 'icon'],
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')">{{ label }}</button>',
        },
        RouterLink: {
          props: ['to'],
          template: '<a :data-route-name="to.name"><slot /></a>',
        },
        Card: {
          template: '<section><slot name="content" /></section>',
        },
      },
    },
  })
}

describe('Preschool form management navigation', () => {
  it('routes the live forms entry to the canonical FormManagement page', async () => {
    const route = preschoolRoutes.find((entry) => entry.name === 'dashboard-preschool-admin-forms')

    expect(route).toBeTruthy()
    expect(typeof route.component).toBe('function')

    const module = await route.component()

    expect(module.default.name).toBe('PreschoolAdminFormManagementPage')
    expect(module.default.name).not.toBe('FormTrackerPage')
  })

  it('renders the canonical overview labels and route targets', async () => {
    const wrapper = mountFormManagement()

    await flushPromises()

    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.pages.overview.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.pages.quickActions.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.pages.workflow.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.pages.resources.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.cards.forms.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.cards.newForm.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.pages.review.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.pages.overview.metrics.totalTemplates.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.pages.overview.steps.createTemplate.title)

    const routeNames = wrapper
      .findAll('a[data-route-name]')
      .map((anchor) => anchor.attributes('data-route-name'))

    expect(routeNames).toContain('dashboard-preschool-admin-forms-manage')
    expect(routeNames).toContain('dashboard-preschool-admin-forms-build')
    expect(routeNames).toContain('dashboard-preschool-admin-forms-review')
    expect(routeNames).toContain('preschool-assessment-reports')
    expect(routeNames).toContain('dashboard-preschool-admin-lifecycle-audit')
  })

  it('keeps the active form management labels localized in both locales', () => {
    const englishKeys = [
      enPreschool.preschoolScaffold.formManagement.title,
      enPreschool.preschoolScaffold.formManagement.pages.manage.title,
      enPreschool.preschoolScaffold.formManagement.pages.build.title,
      enPreschool.preschoolScaffold.formManagement.pages.review.title,
    ]
    const khmerKeys = [
      khPreschool.preschoolScaffold.formManagement.title,
      khPreschool.preschoolScaffold.formManagement.pages.manage.title,
      khPreschool.preschoolScaffold.formManagement.pages.build.title,
      khPreschool.preschoolScaffold.formManagement.pages.review.title,
    ]

    expect(englishKeys.every(Boolean)).toBe(true)
    expect(khmerKeys.every(Boolean)).toBe(true)
  })
})
