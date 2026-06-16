<script setup>
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({ name: 'PreschoolAdminAttendanceManagementPage' })

const { t } = useLanguage()
const router = useRouter()

const CARDS = [
  { key: 'students',  icon: 'pi-users',       accent: 'card--violet', route: 'dashboard-preschool-admin-attendance-students' },
  { key: 'history',   icon: 'pi-history',     accent: 'card--slate',  route: 'dashboard-preschool-admin-attendance-history' },
  { key: 'dashboard', icon: 'pi-chart-bar',   accent: 'card--indigo', route: 'dashboard-preschool-admin-attendance-dashboard' },
  { key: 'alerts',    icon: 'pi-bell',        accent: 'card--rose',   route: 'dashboard-preschool-admin-attendance-alerts' },
  { key: 'calendar',  icon: 'pi-calendar',    accent: 'card--emerald',route: 'dashboard-preschool-admin-attendance-calendar' },
  { key: 'profile',   icon: 'pi-user-edit',   accent: 'card--amber',  route: 'dashboard-preschool-admin-attendance-profile' },
  { key: 'idCard',    icon: 'pi-id-card',     accent: 'card--teal',   route: 'dashboard-preschool-admin-attendance-id-card' },
]
</script>

<template>
  <MainLayout>
    <section class="space-y-5">
      <HeaderSection
        :title="t('preschoolAttendanceHubPage.title')"
        :subtitle="t('preschoolAttendanceHubPage.subtitle')"
      />

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <button
          v-for="card in CARDS"
          :key="card.key"
          type="button"
          class="att-card"
          :class="card.accent"
          @click="router.push({ name: card.route })"
        >
          <div class="att-card__icon-wrap">
            <i :class="['pi', card.icon]" aria-hidden="true" />
          </div>
          <div class="att-card__body">
            <h3 class="att-card__title">{{ t(`preschoolAttendanceHubPage.cards.${card.key}.title`) }}</h3>
            <p class="att-card__desc">{{ t(`preschoolAttendanceHubPage.cards.${card.key}.description`) }}</p>
          </div>
          <i class="pi pi-arrow-right att-card__arrow" aria-hidden="true" />
        </button>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.att-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1.1rem;
  border-radius: 1.15rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  text-align: left;
  width: 100%;
  box-shadow: 0 12px 32px -24px rgba(15, 23, 42, 0.3);
  transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
  cursor: pointer;
}

.att-card:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -24px rgba(15, 23, 42, 0.38); }

.att-card__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
  font-size: 1.05rem;
}

.att-card__body { flex: 1; min-width: 0; }
.att-card__title { margin: 0 0 0.25rem; font-size: 0.9rem; font-weight: 700; color: #0f172a; }
.att-card__desc { margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.5; }
.att-card__arrow { font-size: 0.75rem; color: #cbd5e1; align-self: center; flex-shrink: 0; transition: transform 0.14s; }
.att-card:hover .att-card__arrow { transform: translateX(3px); color: #94a3b8; }

.card--violet .att-card__icon-wrap { background: #ede9fe; color: #6d28d9; }
.card--violet:hover { border-color: #c4b5fd; }
.card--sky .att-card__icon-wrap { background: #e0f2fe; color: #0369a1; }
.card--sky:hover { border-color: #7dd3fc; }
.card--slate .att-card__icon-wrap { background: #f1f5f9; color: #475569; }
.card--slate:hover { border-color: #cbd5e1; }
.card--indigo .att-card__icon-wrap { background: #e0e7ff; color: #4338ca; }
.card--indigo:hover { border-color: #a5b4fc; }
.card--rose .att-card__icon-wrap { background: #ffe4e6; color: #be123c; }
.card--rose:hover { border-color: #fda4af; }
.card--emerald .att-card__icon-wrap { background: #d1fae5; color: #065f46; }
.card--emerald:hover { border-color: #6ee7b7; }
.card--amber .att-card__icon-wrap { background: #fef3c7; color: #92400e; }
.card--amber:hover { border-color: #fcd34d; }
.card--teal .att-card__icon-wrap { background: #ccfbf1; color: #0f766e; }
.card--teal:hover { border-color: #5eead4; }
</style>
