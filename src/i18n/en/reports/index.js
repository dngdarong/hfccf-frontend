// Merge reports at the root `reports` key to preserve t('reports.auditLogs.*')
// and avoid the double-nesting regression that broke the Audit Logs page.
import auditLogs from './auditLogs.js'

export default {
  auditLogs,
}
