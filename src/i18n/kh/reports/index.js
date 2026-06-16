// Merge reports at the root `reports` key to preserve t('reports.auditLogs.*')
// and keep EN/KH locale trees aligned for Vue I18n.
import auditLogs from './auditLogs.js'

export default {
  auditLogs,
}
