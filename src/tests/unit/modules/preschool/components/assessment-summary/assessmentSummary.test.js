import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StatCard from '@/modules/preschool/components/assessment-summary/StatCard.vue'
import ProgressIndicator from '@/modules/preschool/components/assessment-summary/ProgressIndicator.vue'
import SummaryCard from '@/modules/preschool/components/assessment-summary/SummaryCard.vue'

describe('assessment summary components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the stat card and emits clicks when interactive', async () => {
    const wrapper = mount(StatCard, {
      props: {
        icon: 'chart',
        label: 'Total Assessments',
        value: 12,
        unit: '/100',
        color: 'blue',
        clickable: true,
      },
    })

    expect(wrapper.text()).toContain('Total Assessments')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('/100')

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('renders the progress indicator with percentage output', () => {
    const wrapper = mount(ProgressIndicator, {
      props: {
        current: 3,
        total: 4,
        label: 'Completion',
        color: 'emerald',
      },
    })

    expect(wrapper.text()).toContain('Completion')
    expect(wrapper.text()).toContain('75%')
  })

  it('renders the summary card and forwards stat clicks', async () => {
    const stat = {
      icon: 'check',
      label: 'Completed',
      value: 8,
      color: 'emerald',
      clickable: true,
    }

    const wrapper = mount(SummaryCard, {
      props: {
        title: 'Assessment Overview',
        subtitle: 'Track the current intake',
        stats: [stat],
        progress: {
          current: 8,
          total: 10,
          label: 'Progress',
          color: 'blue',
        },
      },
    })

    expect(wrapper.text()).toContain('Assessment Overview')
    expect(wrapper.text()).toContain('Track the current intake')
    expect(wrapper.text()).toContain('Progress')

    await wrapper.findComponent(StatCard).trigger('click')
    expect(wrapper.emitted('stat-click')).toEqual([[stat]])
  })
})
