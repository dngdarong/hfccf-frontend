<script setup>
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/layouts/AuthLayout.vue'
import LoginForm from '@/modules/auth/components/LoginForm.vue'
import { useLanguage } from '@/composables/useLanguage'
import { ROLES } from '@/constants/roles'

const { t } = useI18n()
const { language, setLanguage } = useLanguage()

const loginAccessPolicy = Object.freeze({
  guestOnly: true,
  defaultRedirect: '/module/dashboard',
  recoveryRole: ROLES.SUPER_ADMIN,
  // Keep exact backend roles here; LoginForm groups them into Admin and Staff for the UI.
  allowedRoles: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN_ENGLISH,
    ROLES.ADMIN_PRESCHOOL,
    ROLES.ADMIN_SCHOLARSHIP,
    ROLES.ADMIN_SPORT,
    ROLES.TEACHER_ENGLISH,
    ROLES.TEACHER_PRESCHOOL,
    ROLES.TEACHER_SCHOLARSHIP,
    ROLES.COACH,
  ],
  requiredPermissionsByRole: {
    [ROLES.SUPER_ADMIN]: ['all:*'],
    [ROLES.ADMIN_ENGLISH]: ['dashboard:read', 'users:read'],
    [ROLES.ADMIN_PRESCHOOL]: ['dashboard:read', 'users:read'],
    [ROLES.ADMIN_SCHOLARSHIP]: ['dashboard:read', 'users:read'],
    [ROLES.ADMIN_SPORT]: ['dashboard:read', 'users:read'],
    [ROLES.TEACHER_ENGLISH]: ['dashboard:read', 'tasks:read'],
    [ROLES.TEACHER_PRESCHOOL]: ['dashboard:read', 'tasks:read'],
    [ROLES.TEACHER_SCHOLARSHIP]: ['dashboard:read', 'tasks:read'],
    [ROLES.COACH]: ['dashboard:read', 'training:write'],
  },
})
</script>

<template>
  <AuthLayout>
    <main
      class="login-page relative flex min-h-screen items-center overflow-hidden px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
    >
      <section
        class="login-page-shell relative z-10 mx-auto grid w-full max-w-4xl overflow-hidden lg:grid-cols-[0.88fr_1.12fr]"
      >
        <div class="login-page-brand hidden min-h-[540px] flex-col justify-between lg:flex">
          <div class="login-page-language" aria-label="Language">
            <i class="pi pi-globe" aria-hidden="true"></i>

            <button
              type="button"
              :class="{ 'login-page-language__option--active': language === 'EN' }"
              class="login-page-language__option"
              aria-label="English"
              @click="setLanguage('EN')"
            >
              EN
            </button>

            <button
              type="button"
              :class="{ 'login-page-language__option--active': language === 'KH' }"
              class="login-page-language__option"
              aria-label="Khmer"
              @click="setLanguage('KH')"
            >
              {{ t('common.navigation.languages.khmer') }}
            </button>
          </div>

          <div class="login-page-brand-center">
            <div class="login-page-logo login-page-logo--hero">
              <img src="@/assets/images/logo.jpg" alt="HFCCF" class="h-20 w-auto" />
            </div>

            <div class="login-page-welcome" :class="{ 'login-page-khmer': language === 'KH' }">
              <p class="login-page-eyebrow">
                {{ t('auth.login.staffPortal') }}
              </p>

              <p>
                {{ t('auth.login.welcome') }}
              </p>

              <span>
                {{ t('auth.login.subtitle') }}
              </span>
            </div>
          </div>

          <div class="grid gap-3">
            <div class="login-page-metric-grid grid grid-cols-2 gap-3">
              <div class="login-page-metric">
                <span class="pi pi-clock text-sky-600" aria-hidden="true"></span>
                <div>
                  <p class="text-xl font-black text-slate-950">24/7</p>
                  <p class="text-xs font-bold uppercase text-slate-500">
                    {{ t('auth.login.accessMetric') }}
                  </p>
                </div>
              </div>

              <div class="login-page-metric">
                <span class="pi pi-check-circle text-lime-600" aria-hidden="true"></span>
                <div>
                  <p class="text-xl font-black text-slate-950">5+</p>
                  <p class="text-xs font-bold uppercase text-slate-500">
                    {{ t('auth.login.areasMetric') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="login-page-form-panel">
          <div class="login-page-form-shell mx-auto w-full max-w-md">
            <div class="mb-5 flex items-start justify-between gap-4 lg:hidden">
              <div class="flex min-w-0 items-center gap-3">
                <div class="login-page-logo login-page-logo--compact">
                  <img src="@/assets/images/logo.jpg" alt="HFCCF" class="h-9 w-auto" />
                </div>

                <div class="min-w-0">
                  <p
                    class="text-xs font-black uppercase text-sky-800"
                    :class="{ 'login-page-khmer': language === 'KH' }"
                  >
                    {{ t('auth.login.portal') }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mb-4 px-1">
              <p class="login-page-eyebrow" :class="{ 'login-page-khmer': language === 'KH' }">
                {{ t('auth.login.staffPortal') }}
              </p>

              <h1
                class="mt-2 text-[1.55rem] leading-tight font-black text-slate-950 sm:text-[1.85rem] lg:text-[1.95rem]"
                :class="{ 'login-page-khmer': language === 'KH' }"
              >
                {{ t('auth.login.signIn') }}
              </h1>
            </div>

            <LoginForm :access-policy="loginAccessPolicy" />
          </div>
        </div>
      </section>
    </main>
  </AuthLayout>
</template>

<style scoped>
.login-page {
  background:
    linear-gradient(135deg, rgba(0, 174, 239, 0.08) 0 18%, transparent 18% 100%),
    linear-gradient(315deg, rgba(253, 193, 22, 0.12) 0 14%, transparent 14% 100%),
    linear-gradient(180deg, #f8fcff 0%, #eef6fb 100%);
}

.login-page::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgba(14, 165, 233, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 165, 233, 0.07) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.68), transparent 78%);
}

.login-page-shell {
  border: 1px solid rgba(203, 213, 225, 0.82);
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.84);
  color: #0f172a;
  box-shadow: 0 30px 70px -42px rgba(15, 23, 42, 0.36);
  backdrop-filter: blur(16px);
}

.login-page-shell::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.35rem;
  content: '';
  background: linear-gradient(
    180deg,
    var(--hope-o-cyan-blue),
    var(--hope-h-lime-green),
    var(--hope-e-golden-yellow)
  );
}

.login-page-brand {
  position: relative;
  padding: 1.45rem 1.25rem 1.45rem 1.55rem;
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.88), rgba(236, 251, 255, 0.78)),
    repeating-linear-gradient(135deg, rgba(0, 174, 239, 0.08) 0 1px, transparent 1px 14px);
}

.login-page-language {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid rgba(203, 213, 225, 0.88);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  padding: 0.25rem;
  color: #64748b;
  box-shadow: 0 12px 24px -20px rgba(15, 23, 42, 0.28);
}

.login-page-language .pi {
  padding: 0 0.4rem;
  color: #0284c7;
  font-size: 0.82rem;
}

.login-page-language__option {
  min-width: 2rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 0.32rem 0.45rem;
  color: #64748b;
  cursor: pointer;
  font-size: 0.68rem;
  font-weight: 900;
}

.login-page-language__option--active {
  background: #0ea5e9;
  color: #ffffff;
}

.login-page-khmer {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
  line-height: 1.6;
}

.login-page-brand-center {
  display: grid;
  min-height: 22rem;
  place-items: center;
  align-content: center;
  gap: 1rem;
  text-align: center;
}

.login-page-welcome {
  display: grid;
  justify-items: center;
  gap: 0.55rem;
  max-width: 16rem;
}

.login-page-welcome p:not(.login-page-eyebrow) {
  margin: 0;
  color: #0f172a;
  font-size: 1.15rem;
  font-weight: 900;
  line-height: 1.25;
}

.login-page-welcome span {
  color: #64748b;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.55;
}

.login-page-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.55rem;
  min-height: 3.25rem;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1.15rem;
  background: #ffffff;
  box-shadow: 0 16px 30px -24px rgba(15, 23, 42, 0.3);
}

.login-page-logo--hero {
  min-width: 8.5rem;
  min-height: 7.25rem;
  border-radius: 1.35rem;
  box-shadow: 0 22px 42px -28px rgba(15, 23, 42, 0.35);
}

.login-page-logo--compact {
  min-width: 3rem;
  min-height: 2.85rem;
  border-radius: 1rem;
  box-shadow: 0 10px 22px -18px rgba(15, 23, 42, 0.32);
}

.login-page-eyebrow {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 999px;
  background: rgba(240, 249, 255, 0.92);
  padding: 0.28rem 0.75rem;
  color: #0369a1;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
}

.login-page-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 540px;
  padding: 1.4rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92)),
    linear-gradient(90deg, rgba(141, 198, 63, 0.08), transparent 42%);
}

.login-page-form-shell {
  padding: 0.75rem;
}

.login-page-metric {
  border: 1px solid rgba(226, 232, 240, 0.82);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.76);
}

.login-page-metric {
  display: flex;
  min-height: 4.25rem;
  align-items: center;
  gap: 0.85rem;
  padding: 0.8rem;
}

.login-page-metric .pi {
  display: inline-grid;
  height: 2.1rem;
  width: 2.1rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background: #f8fafc;
}

@media (max-width: 1023px) {
  .login-page-shell {
    max-width: 32rem;
    border-radius: 1.25rem;
  }

  .login-page-form-panel {
    min-height: auto;
    padding: 1.15rem;
  }

  .login-page-form-shell {
    padding: 0.5rem;
  }
}

@media (max-width: 639px) {
  .login-page {
    align-items: flex-start;
    padding: 0.85rem;
  }

  .login-page-shell {
    border-radius: 1.1rem;
    box-shadow: 0 18px 40px -30px rgba(15, 23, 42, 0.35);
  }

  .login-page-shell::before {
    width: 100%;
    height: 0.28rem;
  }

  .login-page-form-panel {
    padding: 0.9rem 0.75rem;
  }

  .login-page-form-shell {
    padding: 0.2rem;
  }
}

@media (max-width: 420px) {
  .login-page-form-panel {
    padding: 0.75rem 0.65rem;
  }

  .login-page-logo--compact {
    min-width: 2.75rem;
    min-height: 2.6rem;
  }
}
</style>

