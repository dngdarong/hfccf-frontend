import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestI18n } from '@/tests/helpers/mount'
import AttendanceTable from '@/modules/sport/admin/components/AttendanceTable.vue'

function mountTable(locale = 'en') {
  const messages = {
    en: {
      common: {
        table: {
          number: 'No.',
        },
      },
      sportAttendanceShared: {
        progress: 'Progress',
      },
      sportAdminPlayerAttendancePage: {
        columns: {
          player: 'Player',
          dateOfBirth: 'Date of Birth',
          gender: 'Gender',
          status: 'Status',
          note: 'Note',
        },
        placeholders: {
          note: 'Add a note',
          reason: 'Reason (optional)',
        },
        actions: {
          markAllPresent: 'Mark All Present',
          markAllAbsent: 'Mark All Absent',
          clearAll: 'Clear All',
          save: 'Save Attendance',
          saving: 'Saving...',
        },
        messages: {
          skippedNote: 'Only players with a selected status will be saved.',
        },
      },
    },
    kh: {
      common: {
        table: {
          number: 'ល.រ',
        },
      },
      sportAttendanceShared: {
        progress: 'វឌ្ឍនភាព',
      },
      sportAdminPlayerAttendancePage: {
        columns: {
          player: 'កីឡាករ',
          dateOfBirth: 'ថ្ងៃកំណើត',
          gender: 'ភេទ',
          status: 'ស្ថានភាព',
          note: 'កំណត់ចំណាំ',
        },
        placeholders: {
          note: 'បញ្ចូលកំណត់ចំណាំ',
          reason: 'មូលហេតុ (ឯកស្ថម)',
        },
        actions: {
          markAllPresent: 'កំណត់ទាំងអស់ថាមានវត្តមាន',
          markAllAbsent: 'កំណត់ទាំងអស់ថាអវត្តមាន',
          clearAll: 'សម្អាតទាំងអស់',
          save: 'រក្សាទុកវត្តមាន',
          saving: 'កំពុងរក្សាទុក...',
        },
        messages: {
          skippedNote: 'មានតែកីឡាករដែលជ្រើសរើសស្ថានភាពប៉ុណ្ណោះដែលនឹងត្រូវរក្សាទុក។',
        },
      },
    },
  }

  const i18n = createTestI18n(messages)
  i18n.global.locale.value = locale

  const statusLabels = locale === 'kh'
    ? {
        present: 'មានវត្តមាន',
        absent: 'អវត្តមាន',
        late: 'មកយឺត',
        excused: 'បានលើកលែង',
      }
    : {
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        excused: 'Excused',
      }

  return mount(AttendanceTable, {
    props: {
      players: [
        { id: 'player-1', fullName: 'Player One', playerCode: 'P-001', dateOfBirth: '2000-01-15', gender: 'male' },
        { id: 'player-2', fullName: 'Player Two', playerCode: 'P-002', dateOfBirth: '2001-06-20', gender: 'female' },
      ],
      attendanceMap: {
        'player-1': { status: 'present', note: '', existingId: 'att-1' },
        'player-2': { status: 'absent', note: '', existingId: 'att-2' },
      },
      statusOptions: [
        { value: 'present', label: statusLabels.present, short: 'P', active: 'is-active', ring: 'is-ring' },
        { value: 'absent', label: statusLabels.absent, short: 'A', active: 'is-active', ring: 'is-ring' },
        { value: 'late', label: statusLabels.late, short: 'L', active: 'is-active', ring: 'is-ring' },
        { value: 'excused', label: statusLabels.excused, short: 'E', active: 'is-active', ring: 'is-ring' },
      ],
      summary: '1 of 1 players marked',
      markedCount: 1,
      loading: false,
      saving: false,
    },
    global: {
      plugins: [i18n],
      stubs: {
        Button: { template: '<button><slot /></button>' },
        AttendanceStatusButton: {
          props: ['label', 'short'],
          template: '<button :aria-label="label">{{ short }}</button>',
        },
      },
    },
  })
}

describe('AttendanceTable', () => {
  it.each([
    ['en', 'Present'],
    ['kh', 'មានវត្តមាន'],
  ])('renders a compact status legend in %s', (locale, expectedLabel) => {
    const wrapper = mountTable(locale)

    expect(wrapper.text()).toContain(expectedLabel)
    expect(wrapper.findAll('.att-panel__legend-item')).toHaveLength(4)
  })

  it.each([
    ['en', 'No.'],
    ['kh', 'ល.រ'],
  ])('renders the row-number header in %s', (locale, expectedLabel) => {
    const wrapper = mountTable(locale)

    expect(wrapper.text()).toContain(expectedLabel)
    expect(wrapper.findAll('tbody tr')[0].find('.att-panel__number-cell').text()).toBe('1')
    expect(wrapper.findAll('tbody tr')[1].find('.att-panel__number-cell').text()).toBe('2')
    expect(wrapper.findAll('tbody tr')[0].text()).not.toContain('player-1')
  })

  it('keeps the summary focused on attendance progress instead of repeating the page title', () => {
    const wrapper = mountTable('en')

    expect(wrapper.text()).toContain('Progress')
    expect(wrapper.text()).toContain('1 / 2')
    expect(wrapper.text()).not.toContain('Player Attendance')
  })

  it('keeps the save event payload unchanged', async () => {
    const wrapper = mountTable('en')

    await wrapper.findAll('button').at(-1)?.trigger('click')

    expect(wrapper.emitted('save')).toHaveLength(1)
    expect(wrapper.emitted('save')?.[0]).toEqual([])
  })

  it.each([
    ['en', 'Date of Birth', 'Gender'],
    ['kh', 'ថ្ងៃកំណើត', 'ភេទ'],
  ])('renders Date of Birth and Gender columns in %s', (locale, expectedDobHeader, expectedGenderHeader) => {
    const wrapper = mountTable(locale)

    expect(wrapper.text()).toContain(expectedDobHeader)
    expect(wrapper.text()).toContain(expectedGenderHeader)
  })

  it('displays formatted date of birth and gender values', () => {
    const wrapper = mountTable('en')

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(2)

    // Verify date and gender are rendered for first player
    const firstRow = rows[0]
    expect(firstRow.text()).toContain('15 Jan 2000')
    expect(firstRow.text()).toContain('male')

    // Verify date and gender are rendered for second player
    const secondRow = rows[1]
    expect(secondRow.text()).toContain('20 Jun 2001')
    expect(secondRow.text()).toContain('female')
  })

  it('displays — for missing Date of Birth and Gender values', () => {
    const i18n = createTestI18n({
      en: {
        common: { table: { number: 'No.' } },
        sportAttendanceShared: { progress: 'Progress' },
        sportAdminPlayerAttendancePage: {
          columns: {
            player: 'Player',
            dateOfBirth: 'Date of Birth',
            gender: 'Gender',
            status: 'Status',
            note: 'Note',
          },
          placeholders: { note: 'Add a note', reason: 'Reason (optional)' },
          actions: {
            markAllPresent: 'Mark All Present',
            markAllAbsent: 'Mark All Absent',
            clearAll: 'Clear All',
            save: 'Save Attendance',
            saving: 'Saving...',
          },
          messages: { skippedNote: 'Only players with a selected status will be saved.' },
        },
      },
    })
    i18n.global.locale.value = 'en'

    const wrapper = mount(AttendanceTable, {
      props: {
        players: [
          { id: 'player-1', fullName: 'Player One', playerCode: 'P-001' },
        ],
        attendanceMap: { 'player-1': { status: '', note: '', existingId: null } },
        statusOptions: [
          { value: 'present', label: 'Present', short: 'P', active: 'is-active', ring: 'is-ring' },
          { value: 'absent', label: 'Absent', short: 'A', active: 'is-active', ring: 'is-ring' },
          { value: 'late', label: 'Late', short: 'L', active: 'is-active', ring: 'is-ring' },
          { value: 'excused', label: 'Excused', short: 'E', active: 'is-active', ring: 'is-ring' },
        ],
        markedCount: 0,
        loading: false,
        saving: false,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Button: { template: '<button><slot /></button>' },
          AttendanceStatusButton: {
            props: ['label', 'short'],
            template: '<button :aria-label="label">{{ short }}</button>',
          },
        },
      },
    })

    const row = wrapper.find('tbody tr')
    expect(row.text()).toContain('—')
  })
})
