import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import OperationsFilterBar from '@/modules/preschool/admin/pages/operations/components/OperationsFilterBar.vue'

describe('OperationsFilterBar', () => {
  it('renders filter actions without unresolved component warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountWithPlugins(OperationsFilterBar, {
      props: {
        modelValue: {
          dateFrom: '',
          dateTo: '',
          classId: '',
          teacherUserId: '',
          status: '',
        },
        loading: false,
        labels: {
          title: 'Filters',
          subtitle: 'Refine the operational dashboard',
          apply: 'Apply',
          reset: 'Reset',
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Apply')
    expect(wrapper.text()).toContain('Reset')
    expect(warnSpy).not.toHaveBeenCalled()

    const buttons = wrapper.findAll('button')
    const resetButton = buttons.find((button) => button.text().includes('Reset'))
    const applyButton = buttons.find((button) => button.text().includes('Apply'))

    expect(resetButton).toBeTruthy()
    expect(applyButton).toBeTruthy()

    await resetButton.trigger('click')
    await applyButton.trigger('click')

    expect(wrapper.emitted('reset')).toBeTruthy()
    expect(wrapper.emitted('apply')).toBeTruthy()

    warnSpy.mockRestore()
  })
})
