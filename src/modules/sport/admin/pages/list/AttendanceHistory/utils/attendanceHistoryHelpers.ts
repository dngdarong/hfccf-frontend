export function teamLabel(teamId: string, teamOptions: any[]): string {
  const match = teamOptions.find((option) => String(option.value) === String(teamId))
  return match?.label || ''
}

export function statusLabel(status: string | null | undefined, t: any): string {
  const key = String(status || '').trim().toLowerCase()
  if (key === 'present') return t('sportAttendanceStatus.present')
  if (key === 'absent') return t('sportAttendanceStatus.absent')
  if (key === 'late') return t('sportAttendanceStatus.late')
  if (key === 'excused') return t('sportAttendanceStatus.excused')
  return key || '-'
}
