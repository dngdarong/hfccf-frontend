export function buildStatusOptions(t: any) {
  return [
    { label: t('preschoolPaymentManagementPage.options.paid'), value: 'paid' },
    { label: t('preschoolPaymentManagementPage.options.pending'), value: 'pending' },
    { label: t('preschoolPaymentManagementPage.options.overdue'), value: 'overdue' },
    { label: t('preschoolPaymentManagementPage.options.cancelled'), value: 'cancelled' },
  ]
}

export function buildMethodOptions(t: any, paymentMethods: any[] = []) {
  if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
    return paymentMethods.map((method) => ({
      label: method.name || method.code || '-',
      value: method.code || method.name || '',
    }))
  }

  return [
    { label: t('preschoolPaymentManagementPage.options.cash'), value: 'cash' },
    { label: t('preschoolPaymentManagementPage.options.mobilePayment'), value: 'mobile_payment' },
    { label: t('preschoolPaymentManagementPage.options.bankTransfer'), value: 'bank_transfer' },
    { label: t('preschoolPaymentManagementPage.options.card'), value: 'card' },
    { label: t('preschoolPaymentManagementPage.options.other'), value: 'other' },
  ]
}

export function buildTableColumns(t: any) {
  return [
    { key: 'number', label: t('preschoolPaymentManagementPage.columns.no'), align: 'left' },
    { key: 'studentName', label: t('preschoolPaymentManagementPage.columns.student'), align: 'left' },
    { key: 'className', label: t('preschoolPaymentManagementPage.columns.class'), align: 'left' },
    { key: 'amountLabel', label: t('preschoolPaymentManagementPage.columns.amount'), align: 'left' },
    { key: 'paymentMethod', label: t('preschoolPaymentManagementPage.columns.method'), align: 'left' },
    { key: 'dueDate', label: t('preschoolPaymentManagementPage.columns.dueDate'), align: 'left' },
    { key: 'paymentStatus', label: t('preschoolPaymentManagementPage.columns.status'), align: 'left' },
    { key: 'actions', label: t('preschoolPaymentManagementPage.columns.actions'), align: 'right' },
  ]
}

export function formatMoney(amount: number, currency: string = 'USD'): string {
  return `${Number(amount || 0).toFixed(2)} ${currency}`
}

export function normalize(value: any): string {
  return String(value ?? '').trim().toLowerCase()
}

export function mapPayment(row: any, classMap: any, studentMap: any): any {
  return {
    ...row,
    studentName: row.studentName || studentMap[String(row.studentId)] || '-',
    className: row.className || classMap[String(row.classId)] || '-',
    amountLabel: formatMoney(row.amount, row.currency),
    status: row.paymentStatus || row.status || '-',
  }
}

export function normalizePayload(form: any) {
  return {
    student_id: form.student_id,
    class_id: form.class_id,
    payment_reference: form.payment_reference.trim(),
    amount: Number(form.amount || 0),
    currency: form.currency,
    payment_method: form.payment_method,
    payment_status: form.payment_status,
    paid_at: form.paid_at || null,
    due_date: form.due_date || null,
    note: form.note.trim(),
  }
}

export function buildClassOptions(classes: any[]) {
  return (classes || []).map((item) => ({
    label: `${item.code} - ${item.name}`,
    value: item.id,
  }))
}

export function buildStudentOptions(students: any[]) {
  return (students || [])
    .filter((item) => String(item.studentType || '').trim() === 'paying')
    .map((item) => ({
      label: item.fullName || item.name || '-',
      value: item.id,
      classes: Array.isArray(item.classes) ? item.classes : [],
    }))
}
