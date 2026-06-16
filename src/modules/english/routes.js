import { ACCESS_SCOPES, DOMAINS } from '@/constants/access'
import { defineAppRoute } from '@/router/defineAppRoute'

export const englishRoutes = [
  defineAppRoute({
    path: '/module/english-admin/dashboard',
    name: 'dashboard-english-admin',
    component: () => import('@/modules/english/admin/pages/Dashboard.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/users',
    name: 'dashboard-english-admin-users',
    component: () => import('@/modules/english/admin/pages/TeacherManagement.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/students',
    name: 'dashboard-english-admin-students',
    component: () => import('@/modules/english/admin/pages/StudentManagement.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/classes',
    name: 'dashboard-english-admin-classes',
    component: () => import('@/modules/english/admin/pages/ClassManagement.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/tasks',
    name: 'dashboard-english-admin-tasks',
    component: () => import('@/modules/english/admin/pages/TaskManagement.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.ADMIN],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/teacher',
    name: 'dashboard-english-teacher-root',
    component: () => import('@/modules/english/teacher/pages/Dashboard.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/teacher/dashboard',
    name: 'dashboard-english-teacher',
    component: () => import('@/modules/english/teacher/pages/Dashboard.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/teacher/classes',
    name: 'dashboard-english-teacher-classes',
    component: () => import('@/modules/english/teacher/pages/MyClasses.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/teacher/students',
    name: 'dashboard-english-teacher-students',
    component: () => import('@/modules/english/teacher/pages/MyStudents.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
  defineAppRoute({
    path: '/module/english-admin/teacher/homework',
    name: 'dashboard-english-teacher-homework',
    component: () => import('@/modules/english/teacher/pages/HomeworkManagement.vue'),
    access: {
      domains: [DOMAINS.ENGLISH],
      scopes: [ACCESS_SCOPES.STAFF],
    },
  }),
]
