<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SidebarLink from '@/components/navigation/SidebarLink.vue'
import { useLanguage } from '@/composables/useLanguage'
import sidebarNavData from '@/data/sidebar'
import HomeIcon from '@/assets/icons/Home.vue'
import CalendarIcon from '@/assets/icons/Calendar.vue'
import AttendanceIcon from '@/assets/icons/Attendance.vue'
import ClassIcon from '@/assets/icons/Class.vue'
import EnrollmentsIcon from '@/assets/icons/Enrollments.vue'
import FormsIcon from '@/assets/icons/Forms.vue'
import GovernanceIcon from '@/assets/icons/Governance.vue'
import HealthIcon from '@/assets/icons/Health.vue'
import InventoryIcon from '@/assets/icons/Inventory.vue'
import PaymentsIcon from '@/assets/icons/Payments.vue'
import PerformanceIcon from '@/assets/icons/Performance.vue'
import NotificationIcon from '@/assets/icons/Notification.vue'
import UsersIcon from '@/assets/icons/Users.vue'
import ReportsIcon from '@/assets/icons/Reports.vue'
import SettingsIcon from '@/assets/icons/Settings.vue'
import TournamentsIcon from '@/assets/icons/Tournaments.vue'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import { useUserStore } from '@/store/userStore'

defineOptions({
  name: 'SidebarNavigation',
})

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()
const { t } = useLanguage()
const userStore = useUserStore()
// Map icon keys from JSON config to concrete Vue components.
const iconByName = {
  home: HomeIcon,
  calendar: CalendarIcon,
  attendance: AttendanceIcon,
  class: ClassIcon,
  enrollments: EnrollmentsIcon,
  forms: FormsIcon,
  governance: GovernanceIcon,
  health: HealthIcon,
  inventory: InventoryIcon,
  payments: PaymentsIcon,
  performance: PerformanceIcon,
  notification: NotificationIcon,
  info: UsersIcon,
  users: UsersIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
  tournaments: TournamentsIcon,
}

const currentPath = computed(() => route.path)
const currentRouteName = computed(() => String(route.name || ''))
const currentUser = computed(() => userStore.currentUser || null)
const SECTION_STATE_STORAGE_KEY = 'sidebar-navigation-section-state'
const sectionStateById = ref({})
const navigationSections = computed(() => {
  return buildSidebarSections({
    config: sidebarNavData,
    router,
    user: currentUser.value,
    t,
  }).map((section) => ({
    ...section,
    items: section.items.map((item) => decorateNavItem(item)),
  }))
})

function loadSectionState() {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(SECTION_STATE_STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      sectionStateById.value = Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => typeof value === 'boolean'),
      )
    }
  } catch {
    sectionStateById.value = {}
  }
}

function saveSectionState() {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(SECTION_STATE_STORAGE_KEY, JSON.stringify(sectionStateById.value))
}

loadSectionState()

function decorateNavItem(item) {
  return {
    ...item,
    iconComponent: iconByName[item.icon] || null,
    children: (item.children || []).map((child) => decorateNavItem(child)),
  }
}

function isPathActive(path) {
  return (
    currentPath.value === path ||
    currentPath.value.startsWith(`${path}/`)
  )
}

function isNavItemActive(item) {
  return (
    currentRouteName.value === item.routeName ||
    (item.activeRouteNames || []).includes(currentRouteName.value) ||
    isPathActive(item.routePath) ||
    (item.children || []).some((child) => isNavItemActive(child))
  )
}

function isSectionActive(section) {
  return (section.items || []).some((item) => isNavItemActive(item))
}

function isSectionExpanded(section) {
  if (!section.collapsible) return true

  if (Object.prototype.hasOwnProperty.call(sectionStateById.value, section.id)) {
    return sectionStateById.value[section.id]
  }

  return isSectionActive(section)
}

function toggleSection(section) {
  if (!section.collapsible) return

  sectionStateById.value = {
    ...sectionStateById.value,
    [section.id]: !isSectionExpanded(section),
  }
  saveSectionState()
}

function countSectionItems(section) {
  return (section.items || []).reduce((total, item) => total + 1 + (item.children || []).length, 0)
}

function hasChildItems(item) {
  return Array.isArray(item.children) && item.children.length > 0
}

function hasSecondaryItems(section) {
  return (section.items || []).some((item) => hasChildItems(item))
}

function getNavItemActiveClass(item) {
  if (!item.secondary) return 'sidebar-link--active'
  return 'sidebar-link--active sidebar-link--secondary sidebar-link--secondary-active'
}

function getNavItemInactiveClass(item) {
  return item.secondary ? 'sidebar-link--secondary' : ''
}
</script>

<template>
  <div class="sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-3">
    <div class="flex flex-col gap-[0.68rem]">
      <section
        v-for="section in navigationSections"
        :key="section.id"
        class="sidebar-section"
        :class="[
          section.className,
          {
            'sidebar-section--collapsed': collapsed,
            'sidebar-section--has-secondary': hasSecondaryItems(section),
          },
        ]"
        :aria-label="section.label"
      >
        <component
          :is="section.collapsible ? 'button' : 'div'"
          v-if="!collapsed"
          :type="section.collapsible ? 'button' : undefined"
          class="sidebar-section__header"
          :class="{ 'sidebar-section__header--button': section.collapsible }"
          :aria-expanded="section.collapsible ? isSectionExpanded(section) : undefined"
          @click="toggleSection(section)"
        >
          <span class="sidebar-section__dot" aria-hidden="true" />
          <div class="min-w-0">
            <p class="sidebar-section__label">{{ section.label }}</p>
            <p class="sidebar-section__caption">{{ section.caption }}</p>
          </div>
          <span class="sidebar-section__count" aria-hidden="true">
            {{ section.badge || countSectionItems(section) }}
          </span>
          <i
            v-if="section.collapsible"
            class="pi text-[0.66rem] text-surface-400"
            :class="isSectionExpanded(section) ? 'pi-chevron-up' : 'pi-chevron-down'"
            aria-hidden="true"
          />
        </component>
        <div v-else class="sidebar-section__divider" aria-hidden="true" />

        <div v-if="collapsed || isSectionExpanded(section)" class="sidebar-section__items">
          <div v-for="item in section.items" :key="item.id || item.to" class="sidebar-nav-group">
            <SidebarLink
              :to="item.to"
              :icon="item.iconComponent"
              :collapsed="collapsed"
              :force-active="isNavItemActive(item)"
              :active-class="getNavItemActiveClass(item)"
              :inactive-class="getNavItemInactiveClass(item)"
              class="sidebar-nav-link"
            >
              <span v-if="!collapsed" class="sidebar-link-content">
                <span class="truncate">{{ item.label }}</span>
                <span v-if="item.badge" class="sidebar-link-badge">{{ item.badge }}</span>
              </span>
              <span v-else class="sr-only">{{ `${section.label} ${item.label}` }}</span>
            </SidebarLink>

            <div
              v-if="hasChildItems(item) && (collapsed || isSectionExpanded(section))"
              class="sidebar-subnav"
            >
              <SidebarLink
                v-for="child in item.children"
                :key="child.id || child.to"
                :to="child.to"
                :icon="child.iconComponent"
                :collapsed="collapsed"
                :force-active="isNavItemActive(child)"
                :active-class="getNavItemActiveClass(child)"
                :inactive-class="getNavItemInactiveClass(child)"
                class="sidebar-nav-link"
              >
                <span v-if="!collapsed" class="sidebar-link-content">
                  <span class="truncate">{{ child.label }}</span>
                  <span v-if="child.badge" class="sidebar-link-badge">{{ child.badge }}</span>
                </span>
                <span v-else class="sr-only">{{ `${section.label} ${child.label}` }}</span>
              </SidebarLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #cbd5e1;
}

.sidebar-menu-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.35rem;
  padding: 0 0.6rem;
  color: var(--brand-surface-500);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  line-height: 1.1;
  text-transform: uppercase;
}

.sidebar-menu-label__dot {
  width: 0.42rem;
  height: 0.42rem;
  flex: none;
  border-radius: 999px;
  background: var(--sidebar-shell-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--sidebar-shell-accent) 13%, transparent);
}

.sidebar-section {
  --sidebar-section-accent: var(--hope-cyan);
  --sidebar-section-accent-weak: color-mix(in srgb, var(--sidebar-section-accent) 14%, transparent);
  --color-base: var(--sidebar-section-accent);
  padding: 0.54rem 0.28rem 0.6rem;
  border: 1px solid color-mix(in srgb, var(--sidebar-section-accent) 12%, transparent);
  border-radius: 1rem;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--sidebar-section-accent) 10%, transparent) 0 3px,
      transparent 3px
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.76) 0%, rgba(248, 251, 255, 0.5) 100%);
}

.sidebar-section--collapsed {
  padding: 0.28rem 0 0.34rem;
  border-color: transparent;
  background: transparent;
}

.sidebar-section__header {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.5rem 0 0.62rem;
  border: 0;
  background: transparent;
  font: inherit;
  text-align: left;
}

.sidebar-section__header--button {
  cursor: pointer;
}

.sidebar-section__header--button:hover .sidebar-section__label {
  color: var(--brand-surface-950);
}

.sidebar-section__dot {
  width: 0.5rem;
  height: 0.5rem;
  flex: none;
  border-radius: 999px;
  background: var(--sidebar-section-accent);
  box-shadow: 0 0 0 3px var(--sidebar-section-accent-weak);
}

.sidebar-section__count {
  display: inline-flex;
  min-width: 1.42rem;
  height: 1.42rem;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--sidebar-section-accent) 24%, white);
  border-radius: 999px;
  background: color-mix(in srgb, var(--sidebar-section-accent) 10%, white);
  color: var(--brand-surface-700);
  font-size: 0.66rem;
  font-weight: 900;
  line-height: 1;
}

.sidebar-section__label {
  margin: 0;
  overflow: hidden;
  color: var(--brand-surface-800);
  font-size: 0.7rem;
  font-weight: 900;
  line-height: 1.1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.sidebar-section__caption {
  margin: 0.16rem 0 0;
  overflow: hidden;
  color: var(--brand-surface-500);
  font-size: 0.64rem;
  font-weight: 700;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-section__divider {
  width: 2.35rem;
  height: 0.18rem;
  margin: 0.1rem auto 0.36rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--sidebar-section-accent) 54%, var(--brand-surface-200));
}

.sidebar-section__items {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  margin-top: 0.42rem;
}

.sidebar-nav-group {
  min-width: 0;
}

.sidebar-subnav {
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
  margin-top: 0.22rem;
}

.sidebar-link-content {
  display: flex;
  min-width: 0;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sidebar-link-badge {
  display: inline-flex;
  max-width: 5.6rem;
  min-height: 1.15rem;
  flex: none;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-base) 18%, white);
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-base) 8%, white);
  color: var(--brand-surface-600);
  font-size: 0.6rem;
  font-weight: 900;
  line-height: 1;
  padding: 0 0.38rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.sidebar-link--secondary) {
  position: relative;
  min-height: 2.35rem;
  margin-left: 1rem;
  padding: 0.5rem 0.7rem 0.5rem 0.82rem;
  border-radius: 0.78rem;
  color: var(--brand-surface-500);
  font-size: 0.82rem;
  font-weight: 700;
}

:deep(.sidebar-link--secondary::before) {
  position: absolute;
  left: -0.58rem;
  width: 0.45rem;
  height: 1px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--sidebar-section-accent) 36%, var(--brand-surface-300));
  content: '';
}

:deep(.sidebar-link--secondary .sidebar-link__icon) {
  width: 0.94rem;
  height: 0.94rem;
  color: color-mix(in srgb, var(--sidebar-section-accent) 62%, var(--brand-surface-500));
}

:deep(.sidebar-link--secondary-active) {
  color: var(--brand-surface-900);
  border-color: color-mix(in srgb, var(--sidebar-section-accent) 24%, white);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--sidebar-section-accent) 7%, white) 0%,
    color-mix(in srgb, var(--sidebar-section-accent) 13%, white) 100%
  );
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.sidebar-section--has-secondary:not(.sidebar-section--collapsed) .sidebar-section__items::before {
  position: absolute;
  top: 2.95rem;
  bottom: 0.82rem;
  left: 1.08rem;
  width: 1px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--sidebar-section-accent) 26%, var(--brand-surface-200));
  content: '';
}

.sidebar-section--collapsed :deep(.sidebar-link--secondary) {
  margin-left: auto;
  padding: 0.45rem;
  border-radius: 1rem;
  font-size: 0.8rem;
}

.sidebar-section--collapsed :deep(.sidebar-link--secondary::before),
.sidebar-section--collapsed .sidebar-section__items::before {
  content: none;
}

.sidebar-section--collapsed .sidebar-subnav {
  margin-top: 0.2rem;
}

.sidebar-section--super-admin {
  --sidebar-section-accent: var(--brand-surface-800);
}

.sidebar-section--default {
  --sidebar-section-accent: var(--sidebar-shell-accent);
}

.sidebar-section--english {
  --sidebar-section-accent: var(--hope-cyan);
}

.sidebar-section--preschool {
  --sidebar-section-accent: var(--hope-lime);
}

.sidebar-section--scholarship {
  --sidebar-section-accent: var(--hope-yellow);
}

.sidebar-section--sport {
  --sidebar-section-accent: var(--hope-red);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
