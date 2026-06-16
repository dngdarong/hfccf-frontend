export function buildTableColumns(t: any) {
  return [
    { key: 'number', label: t('preschoolTeachersManagement.table.number'), align: 'left' },
    { key: 'user', label: t('preschoolTeachersManagement.table.user'), align: 'left' },
    { key: 'email', label: t('preschoolTeachersManagement.table.email'), align: 'left' },
    { key: 'role', label: t('preschoolTeachersManagement.table.role'), align: 'left' },
    { key: 'permission', label: t('preschoolTeachersManagement.table.permission'), align: 'left' },
    { key: 'status', label: t('preschoolTeachersManagement.table.status'), align: 'left' },
    { key: 'phone', label: t('preschoolTeachersManagement.table.phone'), align: 'left' },
    { key: 'actions', label: t('preschoolTeachersManagement.table.actions'), align: 'right' },
  ]
}
