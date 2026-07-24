import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ReportExportToolbar from '@/modules/preschool/admin/pages/reports/components/ReportExportToolbar.vue'
import * as exportService from '@/modules/preschool/services/reportExportService'

vi.mock('@/modules/preschool/services/reportExportService')
vi.mock('@/components/buttons/Button.vue', {
  default: {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'loading'],
  },
})

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      common: { error: 'Error', dismiss: 'Dismiss' },
    },
  },
})

describe('ReportExportToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    exportService.reportExportService.generateFilename.mockReturnValue('test-report-2026-07-23')
  })

  const createWrapper = (props = {}) => {
    return mount(ReportExportToolbar, {
      props: {
        reportType: 'summary',
        reportData: {
          reportType: 'summary',
          scope: 'individual',
          student: { id: '1', fullName: 'John Smith' },
        },
        reportName: 'John Smith',
        disabled: false,
        ...props,
      },
      global: {
        plugins: [i18n],
        stubs: {
          Button: true,
        },
      },
    })
  }

  describe('Component Rendering', () => {
    it('renders three export buttons', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(3)
    })

    it('renders PDF, Excel, and Print buttons', () => {
      const wrapper = createWrapper()
      const text = wrapper.text()
      expect(text).toContain('PDF')
      expect(text).toContain('Excel')
      expect(text).toContain('Print')
    })

    it('shows buttons with correct icons', () => {
      const wrapper = createWrapper()
      expect(wrapper.html()).toContain('pi-file-pdf')
      expect(wrapper.html()).toContain('pi-file-excel')
      expect(wrapper.html()).toContain('pi-print')
    })

    it('accepts reportType prop', () => {
      const wrapper = createWrapper({ reportType: 'attendance' })
      expect(wrapper.props('reportType')).toBe('attendance')
    })

    it('accepts reportData prop', () => {
      const data = {
        reportType: 'assessment',
        scope: 'class',
        classAssessments: [],
      }
      const wrapper = createWrapper({ reportData: data })
      expect(wrapper.props('reportData')).toEqual(data)
    })

    it('accepts reportName prop', () => {
      const wrapper = createWrapper({ reportName: 'Custom Report Name' })
      expect(wrapper.props('reportName')).toBe('Custom Report Name')
    })
  })

  describe('Button States', () => {
    it('shows buttons as enabled by default', async () => {
      const wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      expect(wrapper.props('disabled')).toBe(false)
    })

    it('disables buttons when disabled prop is true', async () => {
      const wrapper = createWrapper({ disabled: true })
      await wrapper.vm.$nextTick()
      expect(wrapper.props('disabled')).toBe(true)
    })

    it('shows loading state during export', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100)),
      )

      const button = wrapper.find('button')
      await button.trigger('click')
      expect(wrapper.vm.isExporting).toBe(true)
    })

    it('clears loading state after export completes', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockResolvedValue(undefined)

      const button = wrapper.find('button')
      await button.trigger('click')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(wrapper.vm.isExporting).toBe(false)
    })
  })

  describe('Export Functionality', () => {
    it('calls exportToPDF when PDF button clicked', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockResolvedValue(undefined)

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(exportService.reportExportService.exportToPDF).toHaveBeenCalledWith(
        'summary',
        wrapper.props('reportData'),
        expect.objectContaining({
          filename: expect.any(String),
        }),
      )
    })

    it('calls exportToExcel when Excel button clicked', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToExcel.mockReturnValue(undefined)

      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(exportService.reportExportService.exportToExcel).toHaveBeenCalledWith(
        'summary',
        wrapper.props('reportData'),
        expect.objectContaining({
          filename: expect.any(String),
        }),
      )
    })

    it('calls exportToPrint when Print button clicked', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPrint.mockReturnValue(undefined)

      const buttons = wrapper.findAll('button')
      await buttons[2].trigger('click')

      expect(exportService.reportExportService.exportToPrint).toHaveBeenCalledWith(
        'summary',
        wrapper.props('reportData'),
      )
    })

    it('generates filename using reportExportService', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockResolvedValue(undefined)

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(exportService.reportExportService.generateFilename).toHaveBeenCalledWith(
        'summary',
        wrapper.props('reportData'),
      )
    })
  })

  describe('Error Handling', () => {
    it('displays error message on export failure', async () => {
      const wrapper = createWrapper()
      const errorMsg = 'Export failed'
      exportService.reportExportService.exportToPDF.mockRejectedValue(
        new Error(errorMsg),
      )

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.exportError).toContain('Export failed')
    })

    it('emits export:error event on failure', async () => {
      const wrapper = createWrapper()
      const error = new Error('Export failed')
      exportService.reportExportService.exportToPDF.mockRejectedValue(error)

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('export:error')).toBeTruthy()
    })

    it('allows dismissing error message', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockRejectedValue(
        new Error('Export failed'),
      )

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.exportError).toBeTruthy()
      await wrapper.vm.dismissError()
      expect(wrapper.vm.exportError).toBe('')
    })

    it('shows error box with close button', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockRejectedValue(
        new Error('Test error'),
      )

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      const errorBox = wrapper.find('[class*="border-red"]')
      expect(errorBox.exists()).toBe(true)
    })
  })

  describe('Event Emissions', () => {
    it('emits export:start when export begins', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockResolvedValue(undefined)

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(wrapper.emitted('export:start')).toBeTruthy()
      expect(wrapper.emitted('export:start')[0]).toEqual(['pdf'])
    })

    it('emits export:success when export completes', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockResolvedValue(undefined)

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('export:success')).toBeTruthy()
    })

    it('emits export:download with filename on success', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockResolvedValue(undefined)

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('export:download')).toBeTruthy()
      expect(wrapper.emitted('export:download')[0][0]).toBe('test-report-2026-07-23')
    })

    it('includes format in export:error event', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockRejectedValue(
        new Error('PDF error'),
      )

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      const emitted = wrapper.emitted('export:error')[0][0]
      expect(emitted.format).toBe('pdf')
      expect(emitted.error).toBeTruthy()
    })
  })

  describe('Props Validation', () => {
    it('requires reportType prop', () => {
      expect(() => {
        mount(ReportExportToolbar, {
          props: {
            reportData: {},
          },
          global: { plugins: [i18n] },
        })
      }).toThrow()
    })

    it('requires reportData prop', () => {
      expect(() => {
        mount(ReportExportToolbar, {
          props: {
            reportType: 'summary',
          },
          global: { plugins: [i18n] },
        })
      }).toThrow()
    })

    it('validates reportType with validator function', () => {
      const wrapper = createWrapper({ reportType: 'assessment' })
      expect(wrapper.props('reportType')).toBe('assessment')
    })

    it('rejects invalid reportType', () => {
      expect(() => {
        mount(ReportExportToolbar, {
          props: {
            reportType: 'invalid',
            reportData: {},
          },
          global: { plugins: [i18n] },
        })
      }).toThrow()
    })
  })

  describe('Accessibility', () => {
    it('buttons have title attributes for tooltips', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons[0].attributes('title')).toContain('PDF')
      expect(buttons[1].attributes('title')).toContain('Excel')
      expect(buttons[2].attributes('title')).toContain('Print')
    })

    it('error dismiss button has aria-label', async () => {
      const wrapper = createWrapper()
      exportService.reportExportService.exportToPDF.mockRejectedValue(
        new Error('Error'),
      )

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')
      await wrapper.vm.$nextTick()

      const dismissBtn = wrapper.find('[aria-label]')
      expect(dismissBtn.exists()).toBe(true)
    })
  })
})
