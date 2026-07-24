import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import OperationsHeaderSection from '@/modules/preschool/admin/pages/operations/sections/OperationsHeaderSection.vue'

describe('OperationsHeaderSection', () => {
  it('renders the action button without unresolved component warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountWithPlugins(OperationsHeaderSection, {
      props: {
        title: 'Executive Operations Center',
        subtitle: 'Operational overview',
        generatedAt: 'Generated at 2026-07-02 10:00',
        refreshLabel: 'Refresh',
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Executive Operations Center')
    expect(wrapper.text()).toContain('Refresh')
    expect(warnSpy).not.toHaveBeenCalled()

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('refresh')).toBeTruthy()

    warnSpy.mockRestore()
  })
})
