# Project Development Standards (GEMINI.md)

This document outlines the foundational mandates for developing the HFCCF Frontend project. Adherence to these rules ensures consistency, speed, and correctness across the codebase.

## 1. Code Documentation & Commenting
*   **Mandate**: Every file and important logic block must be commented.
*   **Details**: 
    *   Use JSDoc-style headers for components to explain their purpose and props.
    *   Mark "important parts" of the logic with descriptive comments to aid future maintenance.

## 2. Tech Stack: PrimeVue + Tailwind CSS
*   **Mandate**: Use PrimeVue for UI components and Tailwind CSS for layout and styling.
*   **Priority**: 
    1.  Use PrimeVue components (`DataTable`, `Button`, `Dialog`, etc.) whenever possible.
    2.  Use Tailwind CSS for custom styling, spacing, and responsive design.
    3.  If a specific UI requirement cannot be met by PrimeVue, fallback to custom Vanilla CSS in scoped blocks.

## 3. Localization (i18n)
*   **Mandate**: ZERO hardcoded strings in templates or scripts.
*   **Workflow**:
    *   All display text must use the `i18n` system via the `t()` function.
    *   New keys must be added to both English (`src/i18n/en/`) and Khmer (`src/i18n/kh/`) files.
    *   Use the `useLanguage` composable for language-aware logic.

## 4. Mock Data Architecture
*   **Mandate**: Use JSON Mocks for all data-driven features.
*   **Details**:
    *   Store all mock data in `src/mocks/`.
    *   This allows for rapid development and testing before the real Backend (API) is ready.
    *   When the API is connected later, the only change required should be the data source in the service layer.

## 5. Database Schema Alignment
*   **Mandate**: Refer to `database_table.sql` as the source of truth.
*   **Details**:
    *   Mock data structures and frontend models must match the field names and types defined in the SQL schema.
    *   This ensures the Frontend will be perfectly compatible with the Backend (API) once it is built.

---

### Reference Information (from note.txt)

#### System User Roles & Credentials
*   **Super Admin**: `superadmin01@hfccf.org` / `superadmin@123`
*   **Sport Admin**: `sport.admin01@hfccf.org` / `sportAdmin@123`
*   **Coach**: `coach03@hfccf.org` / `Coach@123`
*   **Scholarship Admin**: `scholarship.admin02@hfccf.org` / `scholarshipadmin@123`
*   **Scholarship Teacher**: `teacher.scholarship04@hfccf.org` / `teacherscholarship@123`
*   **Preschool Admin**: `preschool.admin02@hfccf.org` / `preschooladmin@123`
*   **Preschool Teacher**: `teacher.preschool03@hfccf.org` / `teacherpreschool@123`
*   **English Admin**: `english.admin03@hfccf.org` / `adminenglish@123`
*   **English Teacher**: `teacher.english01@hfccf.org` / `teacherenglish@123`
