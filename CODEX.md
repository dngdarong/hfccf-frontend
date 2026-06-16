# Codex Working Rules

This file defines the conditions Codex should follow when generating code or creating new files in this repository.

## 1. When Code May Be Generated

- Generate code only when the request is explicit or the task clearly requires an implementation.
- Prefer fixing or extending existing files before creating new ones.
- Do not invent new abstractions when an existing component, composable, or utility can be reused.
- Keep changes aligned with the current frontend contract, mock data structure, and SQL schema.
- Add comments for important logic blocks, non-obvious conditions, and state transitions.

## 2. Required Project Conventions

- Use PrimeVue for UI components whenever possible.
- Use Tailwind CSS for layout, spacing, and responsive styling.
- Use i18n for all user-facing text. Do not hardcode labels, placeholders, or alerts.
- Keep mock data in `src/mocks/` when the feature is frontend-driven.
- Put API calls in service files instead of calling `http` directly from page components.
- Preserve existing route names, role codes, and domain codes unless the task explicitly requires a change.
- Keep players, coaches, staff, and system users separate when the domain model treats them separately.
- Keep frontend-only persistence behind a service layer so it can be replaced by backend API calls later.

## 3. File Creation Rules

- Create a new file only if no existing file in the current feature area can be safely extended.
- New files must follow the current module structure and naming convention.
- Do not create files outside the feature area unless the task is clearly cross-cutting.
- When creating a file, inspect the nearest existing nodes first:
  - page node
  - component node
  - shared component node
  - i18n node
  - mock data node
  - database schema node

## 4. Preferred Nodes To Inspect Before Creating Files

- `src/modules/<domain>/pages/`
- `src/modules/<domain>/components/`
- `src/components/`
- `src/i18n/en/`
- `src/i18n/kh/`
- `src/mocks/`
- `database_table.sql`

Use the smallest valid scope first. For example:

- If the task is a page UI change, inspect the page and its local components first.
- If the task is a reusable widget, inspect the module component folder before using shared components.
- If the task needs new labels, inspect the matching i18n files before writing template text.
- If the task touches data fields, inspect `database_table.sql` before changing the frontend model.

## 5. Safe Generation Checklist

- Confirm the target folder already exists.
- Match the current feature naming style.
- Keep components small and single-purpose.
- Avoid duplicating existing UI logic.
- Update English and Khmer i18n keys together.
- Run lint after structural or template changes when practical.
- When a task creates or changes implementation files, stage the result with `git add` and create a commit before closing the task.
- If the task needs a branch name or branch split, create the branch that matches the requested scope before committing.

## 6. Database and Contract Alignment

- Treat `database_table.sql` as the source of truth for field names and relations.
- Preserve frontend-compatible string IDs and role codes.
- If a field is intentionally denormalized, document it in the schema or code comment.
- If a new UI field needs persistence later, add the schema note now and keep the frontend mapper clear.

## 7. Backend API Connection Rules

- Use `src/services/http.js` for shared API requests.
- In local development, `VITE_API_BASE_URL=http://hfccf-backend.test/api` points directly to the Laravel backend origin.
- If the backend returns public avatar URLs from Cloudflare R2, set `VITE_IMAGE_PUBLIC_ORIGIN` to the exact trusted image origin so CSP and avatar rendering allow it.
- Do not bypass the shared HTTP client for authenticated frontend requests.
- Store backend bearer tokens only through `src/services/auth.js`.
- Keep auth response mapping compatible with the backend `AuthUserResource` shape:
  - `id`
  - `firstName`
  - `lastName`
  - `username`
  - `email`
  - `phone`
  - `role`
  - `scope`
  - `domain`
  - `departmentCode`
  - `department`
  - `bio`
  - `status`
  - `avatar`
  - `createdAt`
  - `lastLoginAt`
  - `role_permission`
- Current connected auth endpoints:
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/logout`
  - `POST /auth/forgot-password`
  - `POST /auth/verify-otp`
  - `POST /auth/reset-password`
- Restart `npm run dev` after changing `.env.*` or Vite proxy settings.

## 8. Super Admin User API

- Super Admin user add/edit/delete is backed by the real backend Users API.
- All CRUD calls go through `src/modules/super-admin/services/adminUsersApi.js`.
- Do not restore localStorage persistence for this feature.

## 9. Domain Boundaries

- System users are authentication/RBAC accounts.
- Players are sport data records, not system users.
- Preschool students are preschool data records, not system users.
- Coaches can be system users because they log in, but player records must not be modeled as users.
- User status and player status must stay separate because they represent different workflows.

## 10. Backend Schema Notes To Preserve

- Keep string IDs such as `usr_001`, `team_001`, and `preschool-class-1`.
- Do not rename the role code `adminscholaship`; the frontend depends on that exact value.
- Keep `roles.department_code` and `users.department_code` normalized against `departments.code`.
- Keep `sport_matches.home_score` and `sport_matches.away_score` normalized; format display scores in the frontend/API layer.
- Keep `sport_standings.goal_difference` numeric; format positive values with `+` in the frontend/API layer.
- If team names are needed for players, prefer joining through `team_id` instead of duplicating `team_name`.

## 11. i18n Organization

- Split locale files by feature and page when translations grow large.
- Keep a root `index.js` in each locale folder that merges the feature indexes.
- Keep a feature `index.js` in each section folder that merges its child files.
- Preserve existing translation key paths whenever possible so `t('...')` calls do not need to change.
- Update English and Khmer translations together for any new or changed user-facing text.
- Prefer shared `common` keys for cross-cutting labels such as actions, statuses, roles, and table text.
- Avoid introducing empty or partial translation keys that would generate invalid paths like `common.role.` or `common.status.`.
- Example structure:
  - `src/i18n/en/auth/index.js` with `login.js`, `forgotPassword.js`, `createPassword.js`
  - `src/i18n/en/dashboard/index.js` with `overview.js`, `commandCenter.js`
  - `src/i18n/en/users/index.js` with `manageUsers.js`, `addUser.js`, `viewUser.js`, `roles.js`, `permissions.js`
  - `src/i18n/en/notifications/index.js` with `notifications.js`, `createNotification.js`
  - `src/i18n/en/sport/index.js` with `dashboard.js`, `teams.js`, `players.js`, `matches.js`, `results.js`
  - `src/i18n/en/preschool/index.js` with `dashboard.js`, `classes.js`, `students.js`, `attendance.js`, `payments.js`
