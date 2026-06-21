export const DEFAULT_INVOICE_ITEM = () => ({
  description: '',
  quantity: 1,
  unit_price: 0,
  sort_order: 1,
})

export const DEFAULT_INVOICE_FORM = () => ({
  student_id: '',
  class_id: '',
  academic_year_id: '',
  term_id: '',
  invoice_number: '',
  issue_date: '',
  due_date: '',
  discount_amount: 0,
})

function normalizeText(value: any): string {
  return String(value ?? '').trim()
}

export function buildInvoiceColumns(t: any) {
  return [
    { key: 'number', label: t('preschoolPaymentManagementPage.columns.no'), align: 'left' },
    { key: 'invoiceNumber', label: t('preschoolPaymentManagementPage.invoiceLabels.number'), align: 'left' },
    { key: 'studentName', label: t('preschoolPaymentManagementPage.columns.student'), align: 'left' },
    { key: 'className', label: t('preschoolPaymentManagementPage.columns.class'), align: 'left' },
    { key: 'totalAmountLabel', label: t('preschoolPaymentManagementPage.invoiceLabels.total'), align: 'left' },
    { key: 'balanceDueLabel', label: t('preschoolPaymentManagementPage.invoiceLabels.balance'), align: 'left' },
    { key: 'status', label: t('preschoolPaymentManagementPage.columns.status'), align: 'left' },
    { key: 'actions', label: t('preschoolPaymentManagementPage.columns.actions'), align: 'right' },
  ]
}

export function mapInvoice(row: any, classMap: Record<string, string>, studentMap: Record<string, string>) {
  return {
    ...row,
    studentName: row.studentName || studentMap[String(row.studentId)] || '-',
    className: row.className || classMap[String(row.classId)] || '-',
    totalAmountLabel: `${Number(row.totalAmount || 0).toFixed(2)} ${row.currency || 'USD'}`,
    balanceDueLabel: `${Number(row.balanceDue || 0).toFixed(2)} ${row.currency || 'USD'}`,
    status: row.status || 'draft',
  }
}

export function normalizeInvoicePayload(form: any, items: any[] = []) {
  return {
    student_id: form.student_id,
    class_id: form.class_id,
    academic_year_id: form.academic_year_id || null,
    term_id: form.term_id || null,
    invoice_number: normalizeText(form.invoice_number),
    issue_date: form.issue_date || null,
    due_date: form.due_date || null,
    discount_amount: Number(form.discount_amount || 0),
    items: items.map((item, index) => ({
      description: normalizeText(item.description),
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      sort_order: Number(item.sort_order || index + 1),
    })),
  }
}
