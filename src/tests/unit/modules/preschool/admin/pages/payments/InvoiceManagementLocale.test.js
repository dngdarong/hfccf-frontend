import { describe, expect, it } from 'vitest'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'

function readKey(source, path) {
  return path.split('.').reduce((carry, key) => carry?.[key], source)
}

describe('preschool invoice management locale coverage', () => {
  it('exposes every invoice management page key used by the screen in both locales', () => {
    const keys = [
      'preschoolInvoiceManagementPage.title',
      'preschoolInvoiceManagementPage.subtitle',
      'preschoolInvoiceManagementPage.summary.total',
      'preschoolInvoiceManagementPage.toolbar.eyebrow',
      'preschoolInvoiceManagementPage.toolbar.clear',
      'preschoolInvoiceManagementPage.toolbar.range',
      'preschoolInvoiceManagementPage.searchPlaceholder',
      'preschoolInvoiceManagementPage.messages.noResults',
      'preschoolInvoiceManagementPage.messages.loadFailed',
      'preschoolInvoiceManagementPage.messages.saveFailed',
      'preschoolInvoiceManagementPage.messages.deleteSuccess',
      'preschoolInvoiceManagementPage.messages.cancelSuccess',
      'preschoolInvoiceManagementPage.messages.exporting',
      'preschoolInvoiceManagementPage.messages.exportFailed',
      'preschoolInvoiceManagementPage.alerts.successTitle',
      'preschoolInvoiceManagementPage.alerts.close',
      'preschoolPaymentManagementPage.invoiceLabels.total',
      'preschoolPaymentManagementPage.invoiceLabels.balance',
      'preschoolPaymentManagementPage.invoiceStatus.overdue',
      'preschoolPaymentManagementPage.invoiceStatus.draft',
    ]

    keys.forEach((key) => {
      expect(readKey(enPreschool, key), `missing en locale key: ${key}`).toBeTypeOf('string')
      expect(readKey(khPreschool, key), `missing kh locale key: ${key}`).toBeTypeOf('string')
    })
  })
})
