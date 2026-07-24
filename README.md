# HFCCF Frontend

Frontend dashboard application for HFCCF, built with Vue 3 and Vite.

## Stack

- Vue 3
- Vite
- Vue Router
- Pinia
- Vue I18n
- PrimeVue 4
- PrimeIcons
- Tailwind CSS 4
- Axios

## Requirements

- Node.js: `^20.19.0 || >=22.12.0`
- npm

Recommended Node version:

```sh
node -v
# v22.12.0 or newer is recommended
```

On Windows, use `nvm-windows` if you need to update or switch Node versions:

```sh
nvm install 22.12.0
nvm use 22.12.0
node -v
npm -v
```

## Setup

After cloning or pulling the project, install dependencies from `package-lock.json`:

```sh
npm ci
```

If `npm ci` fails because of the current peer dependency mismatch between `vite@8` and `@tailwindcss/vite@4.2.1`, use:

```sh
npm install --legacy-peer-deps
```

Do not commit or push `node_modules`. Each team member installs dependencies locally.

## Team Pull Checklist

When a team member pulls the latest project:

```sh
git pull
node -v
npm ci
npm run dev
```

If dependencies changed and the app behaves unexpectedly, reinstall cleanly:

```sh
Remove-Item -Recurse -Force node_modules
npm ci
```

If `npm ci` fails because of peer dependency resolution, use:

```sh
npm install --legacy-peer-deps
```

Before pushing work, run:

```sh
npm run lint
npm run build
```

## Environment

The app can run with mock data without a backend API.

Development defaults are committed in [.env.development](/D:/Thesis2026/hfccf-project/hfccf-frontend/.env.development):

  ```env
  VITE_API_BASE_URL=http://hfccf-backend.test/api
  VITE_IMAGE_PUBLIC_ORIGIN=https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev
  ```

If you need a different backend host locally, create a local `.env` file:

  ```env
  VITE_API_BASE_URL=http://hfccf-backend.test/api
  VITE_IMAGE_PUBLIC_ORIGIN=https://pub-04c60dfb58ea4e43969c54044749b899.r2.dev
  ```

For production, `VITE_API_BASE_URL` must use HTTPS.

## Run Locally

```sh
npm run dev
```

The app uses mock authentication data from [src/mocks/users.json](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/mocks/users.json).

## PrimeVue

PrimeVue is installed and configured globally in [src/main.js](/D:/Thesis2026/frontend/hfccf-frontend/src/main.js) with:

- `primevue`
- `@primeuix/themes`
- `primeicons`
- `Aura` theme preset

Example usage:

```vue
<script setup>
import Button from 'primevue/button'
</script>

<template>
  <Button label="Save" icon="pi pi-check" />
</template>
```

## Routing

- Root router setup lives in [src/router/index.js](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/router/index.js).
- Feature routes are defined inside modules such as [src/modules/auth/routes.js](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/modules/auth/routes.js), `src/modules/dashboard/routes.js`, `src/modules/super-admin/routes.js`, `src/modules/english/routes.js`, `src/modules/preschool/routes.js`, `src/modules/scholarship/routes.js`, and `src/modules/sport/routes.js`.
- Layout wrappers live in [src/layouts](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/layouts).
- App routes use shared access metadata via [src/router/defineAppRoute.js](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/router/defineAppRoute.js).

Example route definition:

```js
defineAppRoute({
  path: '/module/sport-admin/dashboard',
  name: 'dashboard-sport-admin',
  component: SportAdminDashboard,
  access: {
    domains: [DOMAINS.SPORT],
    scopes: [ACCESS_SCOPES.ADMIN],
  },
})
```

## Navigation And RBAC

- Sidebar configuration is driven by [src/data/sidebar-nav.json](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/data/sidebar-nav.json).
- Sidebar resolution and route validation live in [src/components/navigation/sidebarNavigation.js](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/components/navigation/sidebarNavigation.js).
- Shared access helpers live in [src/services/accessControl.js](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/services/accessControl.js) and [src/constants/access.js](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/constants/access.js).
- The router guard uses the same access layer as the sidebar, so hidden links and blocked routes stay consistent.

Current access model:

- `super_admin`: global access across every module
- `admin`: access limited to one domain module
- `staff`: access limited to their own working pages

Current domain model:

- `english`
- `preschool`
- `scholarship`
- `sport`
- `global`

Sidebar behavior:

- Super Admin sees grouped sections:
  - `Command Center`
  - `English Program`
  - `Preschool Program`
  - `Scholarship Program`
  - `Sport Program`
- Domain admins see only direct links for their own module.
- Staff users see only their assigned dashboard/workspace links.
- Every visible sidebar link must resolve to a registered route. Invalid targets are filtered out by the shared navigation resolver.

When adding a new page:

1. Add the route in the correct module `routes.js` file with `defineAppRoute`.
2. Add `access` metadata for the correct scope and domain.
3. Add the sidebar item in `src/data/sidebar-nav.json` only if the route already exists.
4. Run `npm run lint` and `npm run build`.

## Mock Roles

Current mock roles include:

- `superadmin`
- `adminenglish`
- `adminpreschool`
- `adminscholarship`
- `adminsport`
- `teacher-english`
- `teacher-preschool`
- `teacher-scholarship`
- `coach`

If you add or rename roles, review route guards, navigation, and dashboard selection logic in the router and user module.

Also review:

- [src/constants/access.js](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/constants/access.js)
- [src/services/accessControl.js](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/services/accessControl.js)
- [src/data/sidebar-nav.json](/D:/Thesis2026/hfccf-project/hfccf-frontend/src/data/sidebar-nav.json)

## Preschool Module Notes

- Preschool enrollment management now uses the standard module shell, breadcrumb trail, and locale-driven sidebar labels.
- Preschool governance pages are intentionally kept backend-driven so the UI stays aligned with the shared API contract.
- Preschool invoice downloads are served by the backend as standards-compliant XLSX workbooks via `/api/preschool/invoices/{invoice}/download?format=xlsx`.
- The XLSX export is generated server-side with branded layout, Khmer text support, and Excel-compatible print settings; PDF export remains unchanged.

## Security Notes

The frontend currently includes:

- client-side session expiry handling
- HTTPS enforcement outside local development
- hardened Axios defaults for authenticated requests
- CSP and browser security headers via Vite config
- trusted public image origin for R2 avatars via `VITE_IMAGE_PUBLIC_ORIGIN`

This is still frontend-side protection. Real production auth should be enforced by the backend.

## Available Scripts

```sh
# start dev server
npm run dev

# build production bundle
npm run build

# preview production build locally
npm run preview

# run all linters with auto-fix
npm run lint

# run only oxlint with auto-fix
npm run lint:oxlint

# run only eslint with auto-fix and cache
npm run lint:eslint

# format source files with prettier
npm run format
```

## Project Structure

- `src/assets`: global styles, icons, images
- `src/components`: shared reusable UI components
- `src/composables`: shared composables
- `src/i18n`: English and Khmer translations
- `src/layouts`: app layouts
- `src/mocks`: mock data
- `src/modules`: feature modules such as `auth`, `dashboard`, `super-admin`, `english`, `preschool`, `scholarship`, and `sport`
- `src/router`: root router setup
- `src/services`: shared API and auth utilities
- `src/store`: global state

Recommended module shape:

```text
src/modules/<feature>/
|- components/
|- pages/
|- services/
|- routes.js
\- index.js
```

## CI

GitHub Actions workflow: [`.github/workflows/main.yml`](.github/workflows/main.yml)

The CI pipeline runs on push to `main` and on pull requests:

1. Install dependencies with `npm ci`
2. Run `npm run lint`
3. Fail if lint auto-fixes changed tracked files (`git diff --exit-code`)
4. Run `npm run build`

## References

- [Vue 3](https://vuejs.org/)
- [Vite](https://vite.dev/)
- [Vue Router](https://router.vuejs.org/)
- [PrimeVue](https://primevue.org/)
