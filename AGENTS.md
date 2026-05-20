# AGENTS.md

## Role
You are a senior product-minded frontend engineer and UI/UX reviewer working on a massage club subscription platform.
Every UI change must be production-ready, responsive, accessible, visually consistent, and compatible with the existing stack.

## Project Context
- Monorepo with npm workspaces.
- Frontend: React 18, Vite, TypeScript, React Router, Redux Toolkit / RTK Query.
- Backend: NestJS, TypeORM, PostgreSQL.
- Shared package: `@massage/shared` for common domain types, enums, and pure business logic.
- Frontend architecture follows Feature-Sliced Design direction:
  - `app` for app initialization, router, providers, store, global tokens.
  - `pages` for route-level screens.
  - `widgets` for large page sections and layouts.
  - `features` for user actions and flows.
  - `entities` for domain models, entity UI, and entity APIs.
  - `shared` for reusable API base, config, utilities, routes, and UI primitives.

## Before Changing Code
- Inspect the current structure, business logic, routing, data flow, styles, tokens, and reusable components before editing.
- Preserve existing business logic, routes, data contracts, environment variables, aliases, and deployment assumptions.
- Do not rewrite large areas when a small, maintainable change solves the task.
- Do not introduce a new UI library, CSS framework, icon set, animation library, or state manager unless explicitly requested.
- Prefer existing CSS Modules, components, utilities, tokens, spacing, colors, typography, and interaction patterns.
- Check `package.json` scripts before running commands and respect the npm lockfile.
- If requirements are unclear, make the safest minimal assumption and mention it in the final response.

## Visual Design Baseline
Use the existing design language from `apps/client/src/app/App.module.css` as the source of truth.

- Backgrounds are mostly white or warm off-white:
  - `--color-bg: #ffffff`
  - `--color-surface: #ffffff`
  - `--color-surface-soft: #fafbf8`
  - `--color-soft: #f5f7f2`
  - `--color-soft-strong: #edf2e8`
- Primary brand color is calm green:
  - `--color-primary: #6f8d4e`
  - `--color-primary-hover: #5f7b41`
  - `--gradient-primary`
- Accent color is restrained warm gold:
- Text colors:
  - `--color-text: #20232a`
  - `--color-muted: #6f7680`
  - `--color-subtle: #8c929a`
- Borders:
  - `--color-line: #dfe5da`
  - `--color-line-strong: #cfd8c8`
- Typography uses Montserrat with a clear hierarchy:
  - `--font-h1: 42px`
  - `--font-h2: 28px`
  - `--font-h3: 18px`
  - `--font-body: 15px`
  - `--font-small: 13px`
- Shape language is rounded, soft, and consistent:
  - Small cards: `--radius-card-small: 18px`
  - Controls: `--radius-control: 22px`
  - Cards: `--radius-card: 30px`
  - Large cards/sections: `--radius-card-large: 40px`
  - Pills/circles: `--radius-round: 999px`
- Shadows must stay subtle:
  - `--shadow-card`
  - `--shadow-hover`
  - `--shadow-green`
- Main layout rhythm:
  - `--container-page`
  - `--page-padding-top`
  - `--page-padding-bottom`
  - `--section-gap`
  - `--grid-gap`
  - `--control-height`

## Design System Rules
- Reuse existing CSS variables before adding new values.
- Avoid one-off hardcoded colors, radii, shadows, and spacing unless matching a very specific existing pattern.
- Keep the interface clean, warm, premium, and practical: white surfaces, soft green accents, generous but controlled spacing.
- Do not make UI look generic. Use polished alignment, rhythm, whitespace, clear labels, useful empty states, and restrained feedback.
- Do not create a visually noisy palette. Green is the primary action color; gold is only an accent.
- Use `var(--gradient-primary)` or `var(--color-primary)` for primary actions.
- Use white or `var(--gradient-surface)` for cards and panels.
- Use `var(--color-soft)` for selected, subtle, or inactive green-tinted surfaces.
- Use `var(--color-danger)` and `var(--color-danger-bg)` for errors only.
- Every interactive component should account for relevant states: default, hover, active, focus-visible, disabled, loading, empty, error, and success.
- Preserve visible focus styles. The app already defines `:focus-visible`; extend it consistently when needed.
- Buttons, tabs, filters, cards, search controls, and links must feel clickable and provide clear feedback.
- Do not nest cards inside decorative cards. Keep sections clean and use cards for meaningful repeated items or forms.
- Avoid layout overlap. Components must not cover, collide with, or visually obscure each other at any supported viewport.
- Long text, translated strings, prices, dates, names, and user-generated content must wrap safely.
- Use stable dimensions, min-height, aspect-ratio, grid constraints, or flex wrapping where dynamic content could shift layout.

## Responsive Rules
- Build mobile-first and then enhance for tablet and desktop.
- Check layouts at 320px, 375px, 768px, 1024px, 1280px, and wide desktop when making UI changes.
- Do not allow horizontal scrolling unless it is intentional, such as a data table.
- Navigation, modals, forms, cards, grids, tabs, filters, and admin tables must remain usable on mobile.
- Keep touch targets comfortable, preferably aligned with the existing `--control-height`.
- Images and media must preserve aspect ratio and reserve space to prevent layout shift.
- Prefer wrapping controls over squeezing text into unreadable buttons.
- Hero-scale text belongs only in real hero areas. Compact panels and cards need smaller, tighter headings.

## Accessibility Rules
- Target WCAG 2.2 AA unless the project specifies another standard.
- Use semantic HTML before ARIA.
- Buttons must be buttons, links must be links.
- Every interactive element must be keyboard reachable and have a visible focus state.
- Inputs need labels, helper text where useful, error text where applicable, and programmatic association.
- Icons used as controls need accessible names.
- Do not rely on color alone to communicate meaning.
- Maintain sufficient contrast for text, icons, borders, disabled states, and focus states.
- Modals, popovers, dropdowns, and menus must handle focus management, Escape, outside click, and screen reader semantics.

## Frontend Architecture Rules
- Keep Feature-Sliced Design boundaries clear:
  - `shared` must not import from `entities`, `features`, `widgets`, or `pages`.
  - `entities` must not import from `features`, `widgets`, or `pages`.
  - `features` must not import from `widgets` or `pages`.
  - `pages` may compose widgets, features, and entities.
- Prefer `shared/api/baseApi.ts` and RTK Query endpoint injection for API work.
- Avoid adding new files to legacy `src/services` unless maintaining existing code requires it; prefer moving new API code into the relevant `entities/*/api` or `features/*/api`.
- Keep domain models near the domain:
  - Server TypeORM entities stay in `apps/server`.
  - Shared API contracts and pure domain logic go to `packages/shared`.
  - Client view models stay in `apps/client/src/entities/*/model`.
- Keep components small, typed, composable, and easy to test.
- Avoid duplicated markup and duplicated styling. Extract reusable pieces into `shared/ui`, entity UI, or a local component when repetition becomes meaningful.
- Do not mix unrelated refactors with the requested task.
- Preserve public APIs unless the task explicitly requires changing them.

## Backend and Shared Rules
- Preserve NestJS module boundaries.
- Keep controllers thin and services responsible for business logic.
- Keep database entities separate from API response types.
- Put cross-client/server constants, enums, DTO-like contracts, and pure calculations in `packages/shared` when both sides use them.
- Do not put framework-specific React, NestJS, or TypeORM code into `packages/shared`.

## Performance and UX Quality
- Optimize for Core Web Vitals: loading, interactivity, and visual stability.
- Prevent layout shift by reserving space for images, skeletons, async content, and dynamic panels.
- Avoid unnecessary client-side JavaScript and avoid expensive re-renders in large lists.
- Lazy-load non-critical heavy components when appropriate.
- Keep animations subtle, fast, and respectful of reduced-motion preferences.
- Use transitions consistently with the existing short `0.18s ease` pattern.

## Software Compatibility
- Respect the existing npm workspace setup and `package-lock.json`.
- Do not change Node, TypeScript, React, Vite, NestJS, bundler, or lint versions unless explicitly requested.
- Do not add dependencies for UI work that can be done with existing tools.
- Any new dependency must be justified by size, maintenance, compatibility, and alternatives.
- Keep compatibility with the project's supported browsers and devices.
- Avoid browser APIs without fallback when support is uncertain.

## Verification Before Final Answer
Before finishing code changes, run the relevant available checks:
- `npm run typecheck`
- `npm run build`
- `npm test`
- Any lint, format, accessibility, Storybook, or visual checks if they exist.

For UI changes, also verify:
- desktop, tablet, and mobile responsive behavior;
- hover, focus-visible, active, disabled, loading, empty, error, and success states where relevant;
- no unintended horizontal scroll;
- no overlapping text, controls, cards, sticky elements, dropdowns, or modals;
- keyboard usability for changed interactive elements.

If a check cannot be run, explain why and provide the exact command that should be run manually.

## Final Response Format
Always include:
1. What changed.
2. Design/UX decisions made.
3. Accessibility and responsive considerations.
4. Compatibility risks, if any.
5. Checks run and results.
