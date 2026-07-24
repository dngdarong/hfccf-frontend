import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enPreschool from '@/i18n/en/preschool'
import ClassTable from '@/modules/classes/components/ClassTable.vue'

function mountTable(classes) {
  return mountWithPlugins(ClassTable, {
    messages: { en: enPreschool },
    props: {
      classes,
    },
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        Avatar: { template: '<div class="avatar-stub" />' },
        StatusBadge: { props: ['status', 'label'], template: '<span class="status-stub">{{ label || status }}</span>' },
        ActionsButton: { template: '<div class="actions-stub" />' },
        Loading: { template: '<div class="loading-stub" />' },
      },
    },
  })
}

describe('ClassTable', () => {
  it('shows row numbers, class codes under names, and compact schedule labels', async () => {
    const wrapper = mountTable([
      {
        id: 'class-1',
        code: 'PS-NUR-001',
        name: 'Morning Nursery',
        teacher: 'Teacher One',
        level: 'Nursery',
        schedule: 'Monday, Tuesday, Wednesday, Thursday, Friday, 16:00–17:30',
        students: 12,
        status: 'active',
      },
      {
        id: 'class-2',
        code: 'PS-KIN-002',
        name: 'Saturday Explorers',
        teacher: 'Teacher Two',
        level: 'Kindergarten',
        schedule: 'Monday, Wednesday, Friday, 08:00–10:00',
        students: 8,
        status: 'pending',
      },
    ])

    await flushPromises()

    expect(wrapper.find('thead').text()).toContain('No.')
    expect(wrapper.find('thead').text()).not.toContain('Code')

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)

    const firstCells = rows[0].findAll('td')
    const secondCells = rows[1].findAll('td')

    expect(firstCells[0].text()).toBe('1')
    expect(firstCells[1].text()).toContain('Morning Nursery')
    expect(firstCells[1].text()).toContain('PS-NUR-001')
    expect(firstCells[4].text()).toBe('Mon–Fri · 16:00–17:30')
    expect(secondCells[0].text()).toBe('2')
    expect(secondCells[4].text()).toBe('Mon, Wed, Fri · 08:00–10:00')
  })

  it('truncates legacy schedules safely and exposes the full tooltip', async () => {
    const rawSchedule = 'Mon-Fri, 8:00 AM, arts, music, science, water play, afternoon reading, parent pickup'
    const wrapper = mountTable([
      {
        id: 'class-1',
        code: 'PS-CLS-001',
        name: 'Legacy Class',
        teacher: 'Teacher One',
        level: '11',
        schedule: rawSchedule,
        students: 4,
        status: 'active',
      },
    ])

    await flushPromises()

    const scheduleCell = wrapper.find('tbody tr td:nth-child(5) span[title]')
    expect(scheduleCell.exists()).toBe(true)
    expect(scheduleCell.attributes('title')).toBe(rawSchedule)
    expect(scheduleCell.text()).toContain('Mon-Fri, 8:00 AM')
    expect(scheduleCell.text()).toContain('…')
    expect(wrapper.text()).toContain('Legacy schedule')
  })
})
