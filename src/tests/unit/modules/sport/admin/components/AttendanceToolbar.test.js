import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestI18n } from '@/tests/helpers/mount'
import AttendanceToolbar from '@/modules/sport/admin/components/AttendanceToolbar.vue'

function mountToolbar(locale = 'en', showBack = true) {
  const messages = {
    en: {
      common: { today: 'Today' },
      sportAdminPlayerAttendancePage: {
        filters: {
          team: 'Team',
          date: 'Date',
        },
        placeholders: {
          team: 'Select a team',
        },
        actions: {
          back: 'Back',
        },
      },
    },
    kh: {
      common: { today: 'ថ្ងៃនេះ' },
      sportAdminPlayerAttendancePage: {
        filters: {
          team: 'ក្រុម',
          date: 'កាលបរិច្ឆេទ',
        },
        placeholders: {
          team: 'ជ្រើសរើសក្រុម',
        },
        actions: {
          back: 'ត្រឡប់',
        },
      },
    },
  }

  const i18n = createTestI18n(messages)
  i18n.global.locale.value = locale

  return mount(AttendanceToolbar, {
    props: {
      teamId: 'team-1',
      date: '2026-07-14',
      teamOptions: [],
      loading: false,
      teamsLoading: false,
      showBack,
    },
    global: {
      plugins: [i18n],
      stubs: {
        Select: { template: '<div />' },
        Button: { template: '<button><slot /></button>' },
      },
    },
  })
}

describe('AttendanceToolbar', () => {
  it.each([
    ['en', 'Today'],
    ['kh', 'ថ្ងៃនេះ'],
  ])('localizes the Today button in %s', (locale, expectedTodayLabel) => {
    const wrapper = mountToolbar(locale)

    expect(wrapper.text()).toContain(expectedTodayLabel)
  })

  it('hides the Back action when the coach route is the canonical entry point', () => {
    const wrapper = mountToolbar('en', false)

    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).not.toContain('Back')
  })

  it('keeps the Back action available when enabled', () => {
    const wrapper = mountToolbar('en', true)

    expect(wrapper.text()).toContain('Back')
  })
})
