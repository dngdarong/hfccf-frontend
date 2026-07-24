import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import PreschoolDashboardSummary from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardSummary.vue'
import PreschoolDashboardActionList from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardActionList.vue'
import PreschoolDashboardActivity from '@/modules/preschool/admin/components/dashboard/PreschoolDashboardActivity.vue'

const sharedStubs = {
  RouterLink: { props: ['to'], template: '<a><slot /></a>' },
}

describe('Preschool dashboard executive widgets', () => {
  it('renders KPI trend labels and neutral fallbacks', () => {
    const wrapper = mountWithPlugins(PreschoolDashboardSummary, {
      messages: {
        en: enPreschool,
      },
      props: {
        cards: [
          {
            title: 'Active Students',
            value: '20',
            label: 'Live student records',
            comparison: '+8 this month',
            trend: {
              direction: 'up',
              label: '+8 this month',
            },
            status: 'success',
          },
          {
            title: 'Attendance Today',
            value: '18',
            label: 'Records marked today',
            comparison: 'No comparison yet',
            trend: {
              direction: 'neutral',
              label: 'No comparison yet',
            },
            status: 'info',
          },
        ],
      },
      global: {
        stubs: sharedStubs,
      },
    })

    expect(wrapper.text()).toContain('+8 this month')
    expect(wrapper.text()).toContain('No comparison yet')
    expect(wrapper.text().match(/\+8 this month/g)).toHaveLength(1)
    expect(wrapper.find('[data-direction="up"]').exists()).toBe(true)
    expect(wrapper.find('[data-direction="neutral"]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'AppStatusChip' }).exists()).toBe(true)
    expect(wrapper.find('.preschool-dashboard-summary__icon').exists()).toBe(true)
  })

  it('renders priority badges and action links', () => {
    const wrapper = mountWithPlugins(PreschoolDashboardActionList, {
      messages: {
        en: enPreschool,
      },
      props: {
        title: 'Priority Queue',
        items: [
          {
            label: 'Urgent health alerts',
            detail: '2 open alerts',
            value: '2',
            priority: 'critical',
            priorityLabel: 'Critical',
            tone: 'error',
            actionLabel: 'Review now',
            actionTo: { name: 'dashboard-preschool-admin-health' },
          },
        ],
        emptyText: 'No urgent items right now.',
      },
      global: {
        stubs: sharedStubs,
      },
    })

    expect(wrapper.text()).toContain('Critical')
    expect(wrapper.text()).toContain('Review now')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.findComponent({ name: 'AppStatusChip' }).exists()).toBe(true)
  })

  it('shows the empty state when the priority queue is empty', () => {
    const wrapper = mountWithPlugins(PreschoolDashboardActionList, {
      messages: {
        en: enPreschool,
      },
      props: {
        title: 'Priority Queue',
        items: [],
        emptyText: 'No urgent items right now.',
      },
      global: {
        stubs: sharedStubs,
      },
    })

    expect(wrapper.text()).toContain('No urgent items right now.')
  })

  it('renders a compact activity card with a view-all link and fallback copy', () => {
    const wrapper = mountWithPlugins(PreschoolDashboardActivity, {
      messages: {
        en: enPreschool,
      },
      props: {
        items: [
          { title: 'Alice Student', text: 'Morning Nursery • 2026-05-19 • present' },
        ],
        emptyText: 'No attendance activity has been recorded yet.',
        viewAllTo: { name: 'dashboard-preschool-admin-attendance-history' },
        viewAllText: 'View all',
        maxItems: 4,
      },
      global: {
        stubs: sharedStubs,
      },
    })

    expect(wrapper.text()).toContain('View all')
    expect(wrapper.text()).toContain('Alice Student')
    expect(wrapper.text()).toContain('Morning Nursery')
  })
})
