import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import FormManagementHeaderSection from '@/modules/preschool/admin/pages/forms/form-management/sections/FormManagementHeaderSection.vue'
import FormOverviewSection from '@/modules/preschool/admin/pages/forms/form-management/sections/FormOverviewSection.vue'
import FormQuickActionsSection from '@/modules/preschool/admin/pages/forms/form-management/sections/FormQuickActionsSection.vue'
import FormWorkflowSection from '@/modules/preschool/admin/pages/forms/form-management/sections/FormWorkflowSection.vue'
import FormResourcesSection from '@/modules/preschool/admin/pages/forms/form-management/sections/FormResourcesSection.vue'

const quickLinkAction = vi.fn()

beforeEach(() => {
  quickLinkAction.mockReset()
})

const stubs = {
  Button: {
    props: ['label', 'icon'],
    emits: ['click'],
    template: '<button type="button" :data-icon="icon" @click="$emit(\'click\')">{{ label }}</button>',
  },
  RouterLink: {
    props: ['to'],
    template: '<a :data-route-name="to.name"><slot /></a>',
  },
}

function mountSection(component, props) {
  return mountWithPlugins(component, {
    messages: {
      en: enPreschool,
    },
    global: {
      stubs,
    },
    props,
  })
}

describe('Preschool form management sections', () => {
  it('renders the header hero and triggers quick actions', async () => {
    const wrapper = mountSection(FormManagementHeaderSection, {
      hero: {
        eyebrow: 'Forms overview',
        title: 'Forms Overview',
        description: 'Manage the launch points for forms.',
        metaLabel: 'Launcher ready',
        metaNote: 'Choose a section below.',
        quickLinks: [
          { icon: 'pi pi-folder-open', label: 'Manage Templates', action: quickLinkAction },
          { icon: 'pi pi-wrench', label: 'Build Form', action: quickLinkAction },
        ],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Forms Overview')
    expect(wrapper.text()).toContain('Manage Templates')
    expect(wrapper.text()).toContain('Build Form')

    await wrapper.find('button').trigger('click')
    expect(quickLinkAction).toHaveBeenCalledTimes(1)
  })

  it('renders overview, quick actions, workflow, and resources cards safely', async () => {
    const overviewWrapper = mountSection(FormOverviewSection, {
      header: {
        eyebrow: 'Overview metrics',
        title: 'Overview metrics',
        description: 'Static metrics.',
      },
      cards: [
        { icon: 'pi pi-clone', title: 'Total templates', description: 'Current library snapshot.' },
      ],
    })
    const quickActionsWrapper = mountSection(FormQuickActionsSection, {
      header: {
        eyebrow: 'Quick actions',
        title: 'Quick actions',
        description: 'Jump into core tasks.',
      },
      actions: [
        {
          icon: 'pi pi-folder-open',
          title: 'Manage Templates',
          description: 'Open the catalog.',
          to: { name: 'dashboard-preschool-admin-forms-manage' },
        },
        {
          icon: 'pi pi-wrench',
          title: 'Build Form',
          description: 'Create a form.',
          to: { name: 'dashboard-preschool-admin-forms-build' },
        },
      ],
    })
    const workflowWrapper = mountSection(FormWorkflowSection, {
      header: {
        eyebrow: 'Workflow',
        title: 'Workflow',
        description: 'Current lifecycle.',
      },
      steps: [],
    })
    const resourcesWrapper = mountSection(FormResourcesSection, {
      header: {
        eyebrow: 'Resources',
        title: 'Resources',
        description: 'Related destinations.',
      },
      resources: [
        {
          icon: 'pi pi-chart-pie',
          title: 'Reports',
          description: 'View reporting outputs.',
          to: { name: 'preschool-assessment-reports' },
        },
      ],
    })

    await flushPromises()

    expect(overviewWrapper.text()).toContain('Total templates')
    expect(quickActionsWrapper.text()).toContain('Build Form')
    expect(workflowWrapper.text()).toContain('Workflow')
    expect(resourcesWrapper.text()).toContain('Reports')

    expect(quickActionsWrapper.findAll('a[data-route-name]').map((link) => link.attributes('data-route-name'))).toEqual([
      'dashboard-preschool-admin-forms-manage',
      'dashboard-preschool-admin-forms-build',
    ])
    expect(resourcesWrapper.find('a[data-route-name]').attributes('data-route-name')).toBe(
      'preschool-assessment-reports',
    )
  })

  it('handles empty arrays without crashing', async () => {
    const wrapper = mountSection(FormWorkflowSection, {
      header: {
        eyebrow: 'Workflow',
        title: 'Workflow',
        description: 'Current lifecycle.',
      },
      steps: [],
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Workflow')
    expect(wrapper.findAll('a[data-route-name]')).toHaveLength(0)
  })
})
