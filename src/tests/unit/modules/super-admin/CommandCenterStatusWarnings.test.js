import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AppStatusChip from '@/components/ui/AppStatusChip.vue'
import SuperAdminCommandCenter from '@/modules/super-admin/pages/Dashboard.vue'

const messages = {
  en: {
    common: {
      status: {
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        info: 'Info',
        neutral: 'Neutral',
      },
    },
  },
}

function mountPage() {
  return mountWithPlugins(SuperAdminCommandCenter, {
    messages,
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        HeaderSection: {
          props: ['title', 'subtitle'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>',
        },
        Card: {
          template: '<section><slot name="title" /><slot name="content" /><slot /></section>',
        },
        Button: {
          props: ['type', 'severity', 'text', 'rounded', 'label', 'icon', 'iconPos'],
          template: '<button><slot /></button>',
        },
      },
    },
  })
}

describe('super-admin command center status chips', () => {
  it('accepts stable and watch without prop validation warnings', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const stableChip = mountWithPlugins(AppStatusChip, {
      props: { status: 'stable' },
      messages,
    })
    const watchChip = mountWithPlugins(AppStatusChip, {
      props: { status: 'watch' },
      messages,
    })

    expect(stableChip.attributes('data-status')).toBe('success')
    expect(watchChip.attributes('data-status')).toBe('warning')

    const combinedErrors = errorSpy.mock.calls.flat().join('\n')
    expect(combinedErrors).not.toContain('Invalid prop: custom validator check failed for prop "status"')

    errorSpy.mockRestore()
  })

  it('mounts the command center dashboard without status prop warnings', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mountPage()
    await flushPromises()
    await flushPromises()

    expect(wrapper.text()).toContain('Executive Command Center')
    expect(wrapper.text()).toContain('Watch')
    expect(wrapper.text()).toContain('Stable')

    const combinedErrors = errorSpy.mock.calls.flat().join('\n')
    expect(combinedErrors).not.toContain('Invalid prop: custom validator check failed for prop "status"')

    errorSpy.mockRestore()
  })
})
