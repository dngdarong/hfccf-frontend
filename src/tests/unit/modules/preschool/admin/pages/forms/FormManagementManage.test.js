import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'
import FormManagementManage from '@/modules/preschool/admin/pages/forms/FormManagementManage.vue'

beforeEach(() => {
  vi.restoreAllMocks()
})

function mountManagePage() {
  return mountWithPlugins(FormManagementManage, {
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

describe('Preschool form management manage page', () => {
  it('renders the manage launcher and keeps the legacy config routes active', async () => {
    const wrapper = mountManagePage()

    await flushPromises()

    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.pages.manage.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.cards.forms.title)
    expect(wrapper.text()).toContain(enPreschool.preschoolScaffold.formManagement.cards.auditLogs.title)

    const routeNames = wrapper
      .findAll('a[data-route-name]')
      .map((anchor) => anchor.attributes('data-route-name'))

    expect(routeNames).toContain('dashboard-preschool-admin-forms-manage')
    expect(routeNames).toContain('dashboard-preschool-admin-lifecycle-audit')
  })
})
