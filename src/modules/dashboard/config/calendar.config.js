import { DOMAINS } from '@/constants/access'

export const EVENT_TYPE_OPTIONS = Object.freeze([
  { value: 'match', labelKey: 'match', color: '#00AEEF' },
  { value: 'training', labelKey: 'training', color: '#8DC63F' },
  { value: 'meeting', labelKey: 'meeting', color: '#FDC116' },
  { value: 'urgent', labelKey: 'urgent', color: '#ED1C24' },
])

const CALENDAR_TEAM_TARGETS = Object.freeze({
  [DOMAINS.ENGLISH]: [
    { id: 101, nameKey: 'common.dashboard.calendar.targets.englishLevel1', groupKey: 'common.dashboard.calendar.groups.morningClass' },
    { id: 102, nameKey: 'common.dashboard.calendar.targets.englishLevel2', groupKey: 'common.dashboard.calendar.groups.afternoonClass' },
    { id: 103, nameKey: 'common.dashboard.calendar.targets.englishLevel3', groupKey: 'common.dashboard.calendar.groups.examPreparation' },
    { id: 104, nameKey: 'common.dashboard.calendar.targets.englishTeachers', groupKey: 'common.dashboard.calendar.groups.staff' },
  ],
  [DOMAINS.PRESCHOOL]: [
    { id: 201, nameKey: 'common.dashboard.calendar.targets.nurseryA', groupKey: 'common.dashboard.calendar.groups.preschool' },
    { id: 202, nameKey: 'common.dashboard.calendar.targets.nurseryB', groupKey: 'common.dashboard.calendar.groups.preschool' },
    { id: 203, nameKey: 'common.dashboard.calendar.targets.kindergarten', groupKey: 'common.dashboard.calendar.groups.preschool' },
    { id: 204, nameKey: 'common.dashboard.calendar.targets.preschoolTeachers', groupKey: 'common.dashboard.calendar.groups.staff' },
  ],
  [DOMAINS.SCHOLARSHIP]: [
    { id: 301, nameKey: 'common.dashboard.calendar.targets.newApplicants', groupKey: 'common.dashboard.calendar.groups.education' },
    { id: 302, nameKey: 'common.dashboard.calendar.targets.shortlistedStudents', groupKey: 'common.dashboard.calendar.groups.reviewStage' },
    { id: 303, nameKey: 'common.dashboard.calendar.targets.currentScholars', groupKey: 'common.dashboard.calendar.groups.activeSupport' },
    { id: 304, nameKey: 'common.dashboard.calendar.targets.scholarshipStaff', groupKey: 'common.dashboard.calendar.groups.staff' },
  ],
  [DOMAINS.SPORT]: [
    { id: 1, nameKey: 'common.dashboard.calendar.targets.u18Falcons', groupKey: 'common.dashboard.calendar.groups.girlsFootball' },
    { id: 2, nameKey: 'common.dashboard.calendar.targets.risingStrikers', groupKey: 'common.dashboard.calendar.groups.boysFootball' },
    { id: 3, nameKey: 'common.dashboard.calendar.targets.cyanCourt', groupKey: 'common.dashboard.calendar.groups.basketball' },
    { id: 4, nameKey: 'common.dashboard.calendar.targets.limeSprinters', groupKey: 'common.dashboard.calendar.groups.athletics' },
    { id: 5, nameKey: 'common.dashboard.calendar.targets.redDefenders', groupKey: 'common.dashboard.calendar.groups.volleyball' },
    { id: 6, nameKey: 'common.dashboard.calendar.targets.yellowTactics', groupKey: 'common.dashboard.calendar.groups.staff' },
  ],
  [DOMAINS.GLOBAL]: [
    { id: 400, nameKey: 'common.dashboard.calendar.targets.allPrograms', groupKey: 'common.dashboard.calendar.groups.organizationWide' },
    { id: 401, nameKey: 'common.dashboard.calendar.targets.englishProgram', groupKey: 'common.dashboard.calendar.groups.education' },
    { id: 402, nameKey: 'common.dashboard.calendar.targets.preschoolProgram', groupKey: 'common.dashboard.calendar.groups.education' },
    { id: 403, nameKey: 'common.dashboard.calendar.targets.scholarshipProgram', groupKey: 'common.dashboard.calendar.groups.education' },
    { id: 404, nameKey: 'common.dashboard.calendar.targets.sportProgram', groupKey: 'common.dashboard.calendar.groups.athletics' },
    { id: 405, nameKey: 'common.dashboard.calendar.targets.operationsTeam', groupKey: 'common.dashboard.calendar.groups.administration' },
  ],
})

function resolveTargets(t, targets) {
  return targets.map((target) => ({
    ...target,
    name: t(target.nameKey),
    group: t(target.groupKey),
  }))
}

function createEventTypeList(t, domain, options = EVENT_TYPE_OPTIONS) {
  return options.map((item) => ({
    ...item,
    label: t(`pages.calendar.roles.${domain}.eventTypes.${item.labelKey}`),
  }))
}

function createRoleConfig({
  t,
  domain,
  eventTypes,
  targets,
  contextIcon,
  defaultContext,
  defaultType,
  targetIcon,
  defaultTargetIds,
}) {
  return {
    title: t(`pages.calendar.roles.${domain}.title`),
    createTitle: t(`pages.calendar.roles.${domain}.createTitle`),
    editTitle: t(`pages.calendar.roles.${domain}.editTitle`),
    description: t(`pages.calendar.roles.${domain}.description`),
    eventTypes,
    contextLabel: t(`pages.calendar.roles.${domain}.contextLabel`),
    contextPlaceholder: t(`pages.calendar.roles.${domain}.contextPlaceholder`),
    titlePlaceholder: t(`pages.calendar.roles.${domain}.titlePlaceholder`),
    notePlaceholder: t(`pages.calendar.roles.${domain}.notePlaceholder`),
    audienceLabel: t(`pages.calendar.roles.${domain}.audienceLabel`),
    audienceSearchPlaceholder: t(`pages.calendar.roles.${domain}.audienceSearchPlaceholder`),
    audienceEmptyLabel: t(`pages.calendar.roles.${domain}.audienceEmptyLabel`),
    upcomingTitle: t(`pages.calendar.roles.${domain}.upcomingTitle`),
    upcomingSubtitle: t(`pages.calendar.roles.${domain}.upcomingSubtitle`),
    upcomingEmptyLabel: t(`pages.calendar.roles.${domain}.upcomingEmptyLabel`),
    targetIcon,
    contextIcon,
    targetSummaryLabel: t('pages.calendar.summary.teamsInvolved'),
    defaultContext,
    defaultType,
    defaultTargetIds,
    targets,
  }
}

export function buildRoleCalendarConfig({ t }) {
  return {
    [DOMAINS.GLOBAL]: createRoleConfig({
      t,
      domain: DOMAINS.GLOBAL,
      eventTypes: createEventTypeList(t, DOMAINS.GLOBAL),
      contextIcon: 'pi pi-briefcase',
      defaultContext: t('pages.calendar.roles.global.defaultContext'),
      defaultType: 'meeting',
      defaultTargetIds: [400],
      targetIcon: 'pi pi-sitemap',
      targets: resolveTargets(t, CALENDAR_TEAM_TARGETS[DOMAINS.GLOBAL]),
    }),
    [DOMAINS.ENGLISH]: createRoleConfig({
      t,
      domain: DOMAINS.ENGLISH,
      eventTypes: createEventTypeList(t, DOMAINS.ENGLISH, [
        { value: 'training', labelKey: 'training', color: '#8DC63F' },
        { value: 'meeting', labelKey: 'meeting', color: '#FDC116' },
        { value: 'match', labelKey: 'match', color: '#00AEEF' },
        { value: 'urgent', labelKey: 'urgent', color: '#ED1C24' },
      ]),
      contextIcon: 'pi pi-building',
      defaultContext: t('pages.calendar.roles.english.defaultContext'),
      defaultType: 'training',
      targetIcon: 'pi pi-book',
      targets: resolveTargets(t, CALENDAR_TEAM_TARGETS[DOMAINS.ENGLISH]),
    }),
    [DOMAINS.PRESCHOOL]: createRoleConfig({
      t,
      domain: DOMAINS.PRESCHOOL,
      eventTypes: createEventTypeList(t, DOMAINS.PRESCHOOL, [
        { value: 'training', labelKey: 'training', color: '#8DC63F' },
        { value: 'meeting', labelKey: 'meeting', color: '#FDC116' },
        { value: 'match', labelKey: 'match', color: '#00AEEF' },
        { value: 'urgent', labelKey: 'urgent', color: '#ED1C24' },
      ]),
      contextIcon: 'pi pi-building',
      defaultContext: t('pages.calendar.roles.preschool.defaultContext'),
      defaultType: 'training',
      targetIcon: 'pi pi-home',
      targets: resolveTargets(t, CALENDAR_TEAM_TARGETS[DOMAINS.PRESCHOOL]),
    }),
    [DOMAINS.SCHOLARSHIP]: createRoleConfig({
      t,
      domain: DOMAINS.SCHOLARSHIP,
      eventTypes: createEventTypeList(t, DOMAINS.SCHOLARSHIP, [
        { value: 'meeting', labelKey: 'meeting', color: '#FDC116' },
        { value: 'match', labelKey: 'match', color: '#00AEEF' },
        { value: 'training', labelKey: 'training', color: '#8DC63F' },
        { value: 'urgent', labelKey: 'urgent', color: '#ED1C24' },
      ]),
      contextIcon: 'pi pi-id-card',
      defaultContext: t('pages.calendar.roles.scholarship.defaultContext'),
      defaultType: 'meeting',
      targetIcon: 'pi pi-users',
      targets: resolveTargets(t, CALENDAR_TEAM_TARGETS[DOMAINS.SCHOLARSHIP]),
    }),
    [DOMAINS.SPORT]: createRoleConfig({
      t,
      domain: DOMAINS.SPORT,
      eventTypes: createEventTypeList(t, DOMAINS.SPORT, [
        { value: 'match', labelKey: 'match', color: '#00AEEF' },
        { value: 'training', labelKey: 'training', color: '#8DC63F' },
        { value: 'meeting', labelKey: 'meeting', color: '#FDC116' },
        { value: 'urgent', labelKey: 'urgent', color: '#ED1C24' },
      ]),
      contextIcon: 'pi pi-flag',
      defaultContext: t('pages.calendar.roles.sport.defaultContext'),
      defaultType: 'match',
      targetIcon: 'pi pi-users',
      targets: resolveTargets(t, CALENDAR_TEAM_TARGETS[DOMAINS.SPORT]),
    }),
  }
}
