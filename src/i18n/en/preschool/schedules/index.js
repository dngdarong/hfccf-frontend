import page from './page'
import shared from './shared'

export default {
  // Merge schedule copy at the Preschool module boundary so the new timetable
  // pages keep a predictable t('preschoolSchedulesPage.*') contract.
  ...page,
  ...shared,
}
