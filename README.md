# CareFlow

**A fictional nursing workflow workspace — built with React and TypeScript.**

CareFlow explores a practical coordination problem: keeping patient-related work,
priorities and simple observation records visible in one place. It is a portfolio
prototype for nurses and shift coordinators in a simulated ward, with an emphasis
on clear interaction design, reliable local persistence and understandable code.

**All patients and measurements are fictional. This is not clinically validated,
not an EHR, and not suitable for real patient care. Never enter real patient data.**

![CareFlow desktop workspace](docs/screenshots/desktop-overview.png)

[Mobile screenshot](docs/screenshots/mobile-overview.png) ·
[Architecture](ARCHITECTURE.md) · [Code walkthrough](docs/LEARNING.md) ·
[Demonstration script](docs/DEMO.md)

## Features

- Ward overview with actual patient, pending, completed, due-today and overdue counts.
- Pending work grouped by priority and a completion progress bar derived from tasks.
- Searchable patient directory, editable profiles, ward/room information and notes.
- Patient-specific task, observation and activity workspaces.
- General and Observation task creation through Factory Method creators.
- Full task details, editable descriptions/categories/priorities/due dates,
  completion/reopening with timestamps, and confirmed deletion.
- Combined task search, status/category filtering and priority/due-date/newest sorting.
- Fictional temperature and heart-rate entry, history, patient filtering and removal.
- Activity events recorded from actual changes, saved with the affected records.
- Versioned local storage, legacy-data migration, failure feedback and a recovery
  screen that protects malformed data and can export the original storage.
- Responsive navigation, semantic tables and buttons, native dialogs, Escape,
  focus wrapping/return, visible focus styles and a skip link.

## Run locally

Use Node **22.22.2+ (22.x), 24.15+ (24.x), or 26+** to satisfy the installed build,
unit-test and lint dependencies. This project was verified with Node 26.13.0.

```bash
npm ci
npm run dev
```

Run commands from this `careflow/` directory. Open the URL printed by Vite.
The lockfile pins dependency versions. The app has no backend or environment secrets.

```bash
npm test               # Vitest unit and React interaction tests
npm run typecheck      # Strict TypeScript check
npm run lint           # ESLint, including React hook rules
npm run format:check   # Prettier consistency
npm run build          # TypeScript and production bundle
npm run preview        # Serve the production bundle locally
npm run test:e2e       # Production browser tests; build first
```

Playwright uses the locally installed macOS Chrome by default. On another machine,
set `CHROME_PATH` to an installed Chrome/Chromium executable, for example:

```bash
CHROME_PATH=/usr/bin/chromium npm run test:e2e
```

The browser suite starts a production preview on `127.0.0.1:4178`. Its desktop and
mobile projects exercise the full workflow, keyboard dialogs, refresh restoration,
legacy migration, recovery export, deletion and disconnected local saving. Axe
checks the main views/forms for automated WCAG A/AA issues. Automated scanning
is not a substitute for testing with assistive technology.

## Technology and project structure

Runtime: React 19, TypeScript, Vite, CSS and browser localStorage. No state-management
or UI framework dependencies. Development tools include Vitest, Testing Library,
jsdom, Playwright, axe, ESLint and Prettier.

```text
src/
  components/   Views, cards, forms, dialogs and shared presentation
  data/         Original starter records and normalized demo-data creation
  factories/    Abstract TaskFactory and two concrete task creators
  hooks/        App-state persistence, form submission, navigation, connectivity
  logic/        Validation, creation, immutable updates, queries, formatting
  storage/      Runtime guards, migration and versioned load/save
  types/        Patient, Task, Observation, ActivityEvent and action contracts
  test/         Unit-test environment setup
  App.tsx       View/dialog composition
  styles.css    Shared visual system and responsive layouts
e2e/            Real-browser workflow, reliability and accessibility tests
docs/           Screenshots, learning guide and demonstration script
```

## Architecture and Factory Method

`CareFlowData` contains four normalized collections: patients, tasks, observations
and activity. Tasks and observations refer to a patient by stable `patientId`.
Counts and filtered lists are derived from these collections, not saved separately.

A form submits an action to `useCareFlow`. `applyAction` invokes domain functions
and constructs the next immutable dataset plus its activity event. Storage validates
and saves that dataset before React accepts it. Failure leaves the displayed data
unchanged and the form open with its input intact.

`TaskFactory` defines an abstract `createTask` method. `GeneralTaskFactory` and
`ObservationTaskFactory` implement it; `selectTaskFactory` chooses the creator.
Both delegate shared validation and object construction to `createTask`. The
concrete factories currently differ only by category: this intentionally preserves
the design-pattern learning exercise, although one simple function would suffice
for today's behavior. Updating an existing task does not reconstruct its identity.

## Persistence, migration and recovery

The active key is `careflow-data-v2`, containing `{ version, revision, data }`.
Runtime guards check fields, enum values, dates, unique IDs, completion consistency
and patient associations. TypeScript types alone cannot validate browser storage.

When v2 is absent, CareFlow converts the original nested starter checklist, applies
`careflow-task-status-v1`, and merges `careflow-created-tasks-v1`. Older tasks without
a category become General tasks; priority defaults to Normal and due dates to unset.
The first successful action writes the unified format. Both legacy keys remain
untouched. Migration does not fabricate historical activity. Checklist timestamps
that were never recorded are explicitly described as import-time estimates.

Malformed or unsupported data opens recovery and blocks editing. It is never
silently replaced with demo data. Export the original JSON before repairing it;
then fix the relevant storage entry or restore its original application version and
retry. There is deliberately no automatic destructive reset.

Revisions detect ordinary stale writes from another tab. They are a best-effort
check, not a database transaction or a guarantee against simultaneous multi-tab
races. Browser storage can be blocked, cleared, run out of space, or be lost with
a browser profile. Use one active editing tab for the demonstration.

Removing a patient requires confirmation and removes its associated tasks,
observations and patient activity. A workspace-level removal event remains.
Deleting a task or observation keeps a corresponding activity event.

## Connectivity and limitations

An already-open workspace can save local changes while disconnected; this is
covered by a browser test. There is **no service worker or cached app shell**, so
an offline reload is not guaranteed. The connectivity label reflects the browser's
online/offline signal, not a verified connection to any service.

Data remains in this browser and origin (scheme, host and port). Changing the dev
server port opens a different storage area; use the original origin to find earlier
data. There is no synchronization, sign-in, authorization, encrypted record storage,
clinical interpretation, medication administration or hospital integration. Activity
is an editable local demo history, not a tamper-resistant clinical audit trail.

Typography uses Google Fonts with local system fallbacks; network access is optional
for loading those fonts. The interface and loaded workflows do not depend on them.
Dates are stored as instants and displayed in the user's local timezone. Due-today
uses the local calendar day and counts pending tasks only.

## Planned improvements

- Test with assistive technology and additional browser engines.
- Self-host fonts and add deliberately versioned app-shell caching if offline
  reload becomes a product requirement.
- Introduce a backend and authentication only with a separately designed security,
  privacy and synchronization model.
- Pagination and indexed storage if the demonstration dataset becomes large.

See the learning guide for exact affected files, design trade-offs and exercises.
