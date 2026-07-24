import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPages from '@/i18n/en/dashboard/pages'
import khPages from '@/i18n/kh/dashboard/pages'
import Calendar from '@/modules/dashboard/pages/Calendar.vue'

const testUser = reactive({ role: 'adminsport' })

vi.mock('@/store/userStore', () => ({
  useUserStore: () => ({ currentUser: testUser }),
}))

function baseMessages() {
  return {
    en: { pages: enPages },
    kh: { pages: khPages },
  }
}

async function mountPage(role = 'adminsport') {
  testUser.role = role

  const wrapper = mountWithPlugins(Calendar, {
    messages: baseMessages(),
    global: {
      stubs: {
        MainLayout: { template: '<div><slot /></div>' },
        CalendarLayoutShell: { template: '<div><slot name="header" /><slot /></div>' },
        CalendarPageHeader: {
          props: ['title', 'subtitle', 'eyebrowLabel', 'actionLabel'],
          template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p><span>{{ eyebrowLabel }}</span><span v-if="actionLabel">{{ actionLabel }}</span></header>',
        },
        CalendarCard: {
          props: ['monthLabel', 'days'],
          emits: ['previous', 'next', 'today'],
          template: `
            <section data-testid="calendar-card">
              <button data-testid="previous" @click="$emit('previous')">Previous</button>
              <button data-testid="next" @click="$emit('next')">Next</button>
              <strong>{{ monthLabel }}</strong>
              <div v-for="day in days" :key="day.key">
                <span v-for="event in day.events" :key="event.id">{{ event.title }}</span>
              </div>
            </section>
          `,
        },
        UpcomingEventsCard: {
          props: ['events'],
          template: '<section data-testid="upcoming-events"><span v-for="event in events" :key="event.id">{{ event.title }}</span></section>',
        },
      },
    },
  })

  await flushPromises()
  return wrapper
}

describe('Calendar preview page', () => {
  beforeEach(() => {
    testUser.role = 'adminsport'
  })

  it.each(['adminsport', 'coach'])('renders the read-only preview for %s', async (role) => {
    const wrapper = await mountPage(role)

    expect(wrapper.text()).toContain('This calendar is currently a preview. Changes are not saved.')
    expect(wrapper.text()).not.toContain('Add Event')
    expect(wrapper.find('[data-testid="calendar-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Morning Conditioning Block')
    expect(wrapper.text()).toContain('Falcons vs River Academy')
    expect(wrapper.findAll('button').filter((button) => ['Add Event', 'Edit', 'Delete'].includes(button.text())).length).toBe(0)
  })

  it('does not render an event dialog or editing controls', async () => {
    const wrapper = await mountPage()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.findAll('button').filter((button) => /add|edit|delete/i.test(button.text())).length).toBe(0)
  })

  it('keeps month navigation working', async () => {
    const wrapper = await mountPage()
    const initialMonth = wrapper.find('[data-testid="calendar-card"] strong').text()

    await wrapper.find('[data-testid="previous"]').trigger('click')

    expect(wrapper.find('[data-testid="calendar-card"] strong').text()).not.toBe(initialMonth)
  })

  it('renders the preview notice in Khmer', async () => {
    const wrapper = await mountPage()

    wrapper.vm.$i18n.locale = 'kh'
    await flushPromises()

    expect(wrapper.text()).toContain('ប្រតិទិននេះបច្ចុប្បន្នជាការមើលជាមុន')
  })
})
