# CareFlow: implementation walkthrough

## Phase 1 — One data model and reliable persistence

### What changed

Original checkbox items and created tasks now use the same `Task` type. Patients,
tasks, observations and activity live in `CareFlowData`, related through stable IDs.
The original storage keys are retained and imported when there is no v2 envelope.

### How it works

`loadCareFlowData` parses storage as `unknown`. Type guards check each entity and
then `isCareFlowData` checks unique IDs and patient relationships. This separates
"this looks like a task" from "this task belongs to a patient we actually have."
`migrateStoredData` explicitly supplies fields that old tasks lacked. Invalid or
ambiguous data opens recovery, without overwriting its original storage.

`useCareFlow` passes typed actions into `applyAction`. Domain functions return a
new dataset and activity event. Only a successful `saveCareFlowData` write makes
that dataset the next React state. A failed save keeps the old state intact.

### Important concepts and decisions

- **Normalization:** a patient has an ID; tasks refer to that ID instead of living
  in a second nested task model. There is one completion/editing path.
- **Type narrowing:** `value is Patient` lets TypeScript trust a value only after
  the function has checked its fields. Static types cannot inspect saved JSON.
- **Immutability:** `map`, `filter` and object spreads build new collections. Tests
  can confirm that old state is unchanged.
- **Derived state:** counts and search results are computed, avoiding duplicated
  counters that can drift away from the actual task records.
- **Ref versus state:** state triggers React rendering; the hook ref retains the
  most recently committed snapshot immediately between rapid callbacks.
- **Conservative recovery:** blocking a malformed dataset is less convenient than
  resetting it, but protects the user's original fictional work.

### Practice exercise

Add a storage test with an observation whose patient does not exist. Explain why
validating only the observation's fields would be insufficient.

Suggested commit: `refactor: unify CareFlow entities and preserve legacy storage`

## Phase 2 — Patient and task workflows

### What changed

Patients can be searched, created, edited and removed. Patient profiles contain
scoped tasks, observations and activity. Tasks support detailed cards/dialogs,
priority/due dates, editing, completion, reopening, removal, search, sorting and
combined status/category/priority/due filters. Dashboard shortcuts initialize the
matching filters through hash-route query parameters.

### How it works

`PatientForm` and `TaskForm` own controlled input values. They submit domain inputs
rather than writing storage. `DialogRouter` turns submitted values into actions
and closes only after dispatch succeeds. `useFormSubmit` catches errors, preserves
form values, and rejects duplicate submissions until success or an explicit retry.

`TaskDetailsModal` displays the full saved record. `updateTask` changes editable
fields and preserves identity/timestamps. `toggleTaskStatus` completes or reopens
that same record. `deletePatient` removes dependent records together, avoiding
orphans; confirmation describes that policy before any data changes.

### Factory Method in practical terms

`TaskFactory` says every creator must implement `createTask(input): Task`.
`GeneralTaskFactory` and `ObservationTaskFactory` supply different categories while
sharing `createTask` record construction and `validateTask` input checks.
`selectTaskFactory` picks a creator, and the `applyTaskCreate` handler invokes its
creation method. `getActionChange` dispatches actions; `applyAction` adds the event.

The selector is a simple factory function; the subclass creation contract is the
Factory Method design. Today the category is the only difference, so the classes
are a deliberate learning exercise, not an architectural necessity. Editing category
uses `updateTask`; creating a new ID would incorrectly replace the task's identity.

### Important concepts and decisions

- **Discriminated union:** `action.type` narrows which input fields are available.
  A patient edit requires an ID and patient input; an observation has a different payload.
- **Polymorphism:** either concrete factory can be used through `TaskFactory`.
- **Controlled inputs:** React holds form values so failed saves do not erase input.
- **Semantic interaction:** cards are buttons, not clickable noninteractive elements.
- **Native dialog:** top-layer modal semantics plus explicit Tab wrapping, Escape,
  and focus return. Real-browser tests check these behaviors.

### Practice exercise

Add a test that edits a completed task's priority and checks that `completedAt`
remains unchanged. Explain why editing and creation are different operations.

Suggested commit: `feat: complete patient and factory-based task workflows`

## Phase 3 — Observations, activity and dashboard

### What changed

Fictional temperature and heart-rate values can be entered and removed. History
can be scoped to a patient. Actual actions append activity entries, and the overview
derives real workload counts, priority groups and task completion progress.

### How it works

`ObservationForm` collects a type/value and patient. `createObservation` requires a
finite number and broad data-entry bounds; heart rate also requires a whole number.
`applyAction` appends the record and its event in the same dataset. The overview
uses `getDashboardSummary`, and `TaskList` uses `filterTasks` without changing data.

An Observation task is a reminder to perform work. An observation record contains
a value at a time. Neither automatically changes the other, and no value is
interpreted clinically. Activity starts empty for fresh seed data and only records
real actions or an actual import, never invented historical actions.

### Important concepts and decisions

- **Referential integrity:** each observation/task must refer to an existing patient.
- **Atomic local write:** records and their event are serialized together in one
  storage entry; this is not a multi-user database transaction.
- **Single source of truth:** dashboard numbers and task badges use the same records.
- **Connectivity versus persistence:** local saves work in the loaded application
  without a network; there is no promise of an offline reload without app caching.

### Practice exercise

Write a test proving that a completed task due today does not count as pending
work due today. Pass an explicit `now` into the query to make the test deterministic.

Suggested commit: `feat: add simulated observations and actual workspace activity`

## Phase 4 — Verification and portfolio readiness

The README contains the test-layer matrix and trade-offs. Unit tests isolate domain
rules and storage boundaries. React tests combine form input, domain behavior and
rendering. Playwright exercises the production build in Chrome at 1440px and 390px,
including native focus, refresh, stale tabs, recovery and disconnected local saving.
Axe checks representative pages and dialogs for automated accessibility violations.
This does not certify clinical safety, complete accessibility or security.

Use the README's check sequence, then follow [DEMO.md](DEMO.md). Screenshots in
`screenshots/` are generated from real test interactions in isolated browser contexts.

Suggested commit: `test: verify integrated workflows and document portfolio demo`

## Exact file inventory

The table below lists the final source/configuration changes. Full current contents
are available in the linked files; request a file to walk through it line by line.

| Action | File                                                                                    | Purpose                                                            |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| CREATE | [src/.DS_Store](../src/.DS_Store)                                                       | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [src/App.test.tsx](../src/App.test.tsx)                                                 | User interaction regression coverage                               |
| MODIFY | [src/App.tsx](../src/App.tsx)                                                           | Application composition                                            |
| CREATE | [src/components/ActivityTimeline.tsx](../src/components/ActivityTimeline.tsx)           | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/ConfirmDialog.tsx](../src/components/ConfirmDialog.tsx)                 | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/Dashboard.tsx](../src/components/Dashboard.tsx)                         | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/DialogRouter.tsx](../src/components/DialogRouter.tsx)                   | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/EmptyState.tsx](../src/components/EmptyState.tsx)                       | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/Icon.tsx](../src/components/Icon.tsx)                                   | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/Modal.tsx](../src/components/Modal.tsx)                                 | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/ObservationForm.tsx](../src/components/ObservationForm.tsx)             | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/ObservationHistory.tsx](../src/components/ObservationHistory.tsx)       | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/PatientDetails.tsx](../src/components/PatientDetails.tsx)               | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/PatientForm.tsx](../src/components/PatientForm.tsx)                     | Render a single view, form, dialog or shared UI element            |
| MODIFY | [src/components/PatientList.tsx](../src/components/PatientList.tsx)                     | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/RecoveryScreen.tsx](../src/components/RecoveryScreen.tsx)               | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/SearchField.tsx](../src/components/SearchField.tsx)                     | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/Sidebar.tsx](../src/components/Sidebar.tsx)                             | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/SummaryCards.tsx](../src/components/SummaryCards.tsx)                   | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/TaskCard.tsx](../src/components/TaskCard.tsx)                           | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/TaskDetailsModal.tsx](../src/components/TaskDetailsModal.tsx)           | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/components/TaskForm.tsx](../src/components/TaskForm.tsx)                           | Render a single view, form, dialog or shared UI element            |
| MODIFY | [src/components/TaskList.tsx](../src/components/TaskList.tsx)                           | Render a single view, form, dialog or shared UI element            |
| CREATE | [src/data/createSeedData.ts](../src/data/createSeedData.ts)                             | Retain legacy records or create normalized fictional demo data     |
| MODIFY | [src/data/patients.ts](../src/data/patients.ts)                                         | Retain legacy records or create normalized fictional demo data     |
| MODIFY | [src/factories/GeneralTaskFactory.test.ts](../src/factories/GeneralTaskFactory.test.ts) | Define/implement/test the task creation contract                   |
| MODIFY | [src/factories/GeneralTaskFactory.ts](../src/factories/GeneralTaskFactory.ts)           | Define/implement/test the task creation contract                   |
| MODIFY | [src/factories/ObservationTaskFactory.ts](../src/factories/ObservationTaskFactory.ts)   | Define/implement/test the task creation contract                   |
| MODIFY | [src/factories/TaskFactory.ts](../src/factories/TaskFactory.ts)                         | Define/implement/test the task creation contract                   |
| CREATE | [src/hooks/useCareFlow.ts](../src/hooks/useCareFlow.ts)                                 | Coordinate React state, submission, navigation or connectivity     |
| CREATE | [src/hooks/useFormSubmit.ts](../src/hooks/useFormSubmit.ts)                             | Coordinate React state, submission, navigation or connectivity     |
| CREATE | [src/hooks/useNavigation.ts](../src/hooks/useNavigation.ts)                             | Coordinate React state, submission, navigation or connectivity     |
| CREATE | [src/hooks/useOnlineStatus.ts](../src/hooks/useOnlineStatus.ts)                         | Coordinate React state, submission, navigation or connectivity     |
| CREATE | [src/logic/applyAction.ts](../src/logic/applyAction.ts)                                 | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/createActivityEvent.ts](../src/logic/createActivityEvent.ts)                 | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/createObservation.ts](../src/logic/createObservation.ts)                     | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/createPatient.ts](../src/logic/createPatient.ts)                             | Implement a domain operation, query, validation or formatting rule |
| MODIFY | [src/logic/createTask.ts](../src/logic/createTask.ts)                                   | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/deletePatient.ts](../src/logic/deletePatient.ts)                             | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/deleteTask.ts](../src/logic/deleteTask.ts)                                   | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/domain.test.ts](../src/logic/domain.test.ts)                                 | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/downloadBackup.ts](../src/logic/downloadBackup.ts)                           | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/filterTasks.ts](../src/logic/filterTasks.ts)                                 | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/formatDate.ts](../src/logic/formatDate.ts)                                   | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/getDashboardSummary.ts](../src/logic/getDashboardSummary.ts)                 | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/parseRoute.ts](../src/logic/parseRoute.ts)                                   | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/selectTaskFactory.ts](../src/logic/selectTaskFactory.ts)                     | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/toLocalDateInput.ts](../src/logic/toLocalDateInput.ts)                       | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/toggleTaskStatus.ts](../src/logic/toggleTaskStatus.ts)                       | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/updatePatient.ts](../src/logic/updatePatient.ts)                             | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/updateTask.ts](../src/logic/updateTask.ts)                                   | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/validatePatient.ts](../src/logic/validatePatient.ts)                         | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/logic/validateTask.ts](../src/logic/validateTask.ts)                               | Implement a domain operation, query, validation or formatting rule |
| CREATE | [src/storage/isActivityEvent.ts](../src/storage/isActivityEvent.ts)                     | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/isCareFlowData.ts](../src/storage/isCareFlowData.ts)                       | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/isObservation.ts](../src/storage/isObservation.ts)                         | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/isPatient.ts](../src/storage/isPatient.ts)                                 | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/isRecord.ts](../src/storage/isRecord.ts)                                   | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/isTask.ts](../src/storage/isTask.ts)                                       | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/isTimestamp.ts](../src/storage/isTimestamp.ts)                             | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/loadCareFlowData.ts](../src/storage/loadCareFlowData.ts)                   | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/migrateStoredData.ts](../src/storage/migrateStoredData.ts)                 | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/persistence.test.ts](../src/storage/persistence.test.ts)                   | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/saveCareFlowData.ts](../src/storage/saveCareFlowData.ts)                   | Validate, migrate, load or save versioned browser data             |
| CREATE | [src/storage/storageKeys.ts](../src/storage/storageKeys.ts)                             | Validate, migrate, load or save versioned browser data             |
| MODIFY | [src/styles.css](../src/styles.css)                                                     | Shared design system                                               |
| CREATE | [src/test/setup.ts](../src/test/setup.ts)                                               | Configure the unit/interaction test environment                    |
| CREATE | [src/types/Action.ts](../src/types/Action.ts)                                           | Define an explicit shared TypeScript contract                      |
| CREATE | [src/types/ActivityEvent.ts](../src/types/ActivityEvent.ts)                             | Define an explicit shared TypeScript contract                      |
| MODIFY | [src/types/CareFlowData.ts](../src/types/CareFlowData.ts)                               | Define an explicit shared TypeScript contract                      |
| MODIFY | [src/types/CreateTaskInput.ts](../src/types/CreateTaskInput.ts)                         | Define an explicit shared TypeScript contract                      |
| CREATE | [src/types/ModalState.ts](../src/types/ModalState.ts)                                   | Define an explicit shared TypeScript contract                      |
| CREATE | [src/types/Navigation.ts](../src/types/Navigation.ts)                                   | Define an explicit shared TypeScript contract                      |
| CREATE | [src/types/Observation.ts](../src/types/Observation.ts)                                 | Define an explicit shared TypeScript contract                      |
| MODIFY | [src/types/Patient.ts](../src/types/Patient.ts)                                         | Define an explicit shared TypeScript contract                      |
| CREATE | [src/types/PatientInput.ts](../src/types/PatientInput.ts)                               | Define an explicit shared TypeScript contract                      |
| MODIFY | [src/types/Task.ts](../src/types/Task.ts)                                               | Define an explicit shared TypeScript contract                      |
| CREATE | [src/types/TaskInput.ts](../src/types/TaskInput.ts)                                     | Define an explicit shared TypeScript contract                      |
| MODIFY | [tsconfig.json](../tsconfig.json)                                                       | Check app, tests and tool configuration under strict TypeScript    |
| MODIFY | [package.json](../package.json)                                                         | Documentation, tooling, configuration or verified screenshot       |
| MODIFY | [package-lock.json](../package-lock.json)                                               | Documentation, tooling, configuration or verified screenshot       |
| MODIFY | [index.html](../index.html)                                                             | Documentation, tooling, configuration or verified screenshot       |
| MODIFY | [.gitignore](../.gitignore)                                                             | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [.prettierignore](../.prettierignore)                                                   | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [eslint.config.js](../eslint.config.js)                                                 | Documentation, tooling, configuration or verified screenshot       |
| RETAIN | [vite.config.ts](../vite.config.ts)                                                     | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [vitest.config.ts](../vitest.config.ts)                                                 | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [playwright.config.ts](../playwright.config.ts)                                         | Documentation, tooling, configuration or verified screenshot       |
| MODIFY | [README.md](../README.md)                                                               | Documentation, tooling, configuration or verified screenshot       |
| MODIFY | [ARCHITECTURE.md](../ARCHITECTURE.md)                                                   | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [e2e/accessibility.spec.ts](../e2e/accessibility.spec.ts)                               | Verify actual browser behavior against the production bundle       |
| CREATE | [e2e/reliability.spec.ts](../e2e/reliability.spec.ts)                                   | Verify actual browser behavior against the production bundle       |
| CREATE | [e2e/workflow.spec.ts](../e2e/workflow.spec.ts)                                         | Verify actual browser behavior against the production bundle       |
| CREATE | [docs/LEARNING.md](../docs/LEARNING.md)                                                 | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [docs/DEMO.md](../docs/DEMO.md)                                                         | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [docs/screenshots/desktop-overview.png](../docs/screenshots/desktop-overview.png)       | Documentation, tooling, configuration or verified screenshot       |
| CREATE | [docs/screenshots/mobile-overview.png](../docs/screenshots/mobile-overview.png)         | Documentation, tooling, configuration or verified screenshot       |

### Retired starter modules

These unused modules were replaced after their workflows moved to the unified model.
The legacy browser storage entries were not removed.

- `src/components/AddTaskModal.tsx`
- `src/logic/handleSubmit.ts`
- `src/logic/handleToggle.ts`
- `src/logic/handleToggle.test.ts`
- `src/logic/selectFactory.ts`
- `src/logic/toggleTask.ts`
- `src/storage/readCreatedTask.ts`
- `src/storage/readTaskStatus.ts`
- `src/storage/saveCreatedTask.ts`
- `src/storage/saveTaskStatus.ts`
- `src/storage/styles`

The original toggle regression is now covered through domain, storage, React and
browser tests for the active state/persistence path. `TaskForm` replaces the old
AddTaskModal and supports both creation and editing. All active styles are in
`src/styles.css`, which `src/main.tsx` imports.

## Action-handler refinement

The original `applyAction` had one named function but combined nine operation paths.
It now has one responsibility: append the real activity event to an operation result.
`getActionChange` selects the handler; each handler performs only its named operation.
Existing lower-level creation/update/validation functions remain shared.

`ActionChange` makes each handler's result explicit. `Extract<Action, { type: ... }>`
selects one variant of the action union, so a task-update handler cannot accidentally
receive a patient-create payload. This is compile-time narrowing, not runtime JSON
validation. `getActionChange` narrows the union through its switch before delegation.

| Action | File                                                                                          | Purpose                                                                     |
| ------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| MODIFY | [src/logic/applyAction.ts](../src/logic/applyAction.ts)                                       | Append one activity event and return the final result                       |
| CREATE | [src/logic/getActionChange.ts](../src/logic/getActionChange.ts)                               | Dispatch to the matching operation handler                                  |
| CREATE | [src/types/ActionChange.ts](../src/types/ActionChange.ts)                                     | Define the shared handler result                                            |
| CREATE | [src/logic/actions.test.ts](../src/logic/actions.test.ts)                                     | Verify complete action lifecycles, event counts and missing-target failures |
| MODIFY | [package.json](../package.json)                                                               | Print explicit successful-check messages; fail lint on warnings             |
| CREATE | [src/logic/actions/applyObservationCreate.ts](../src/logic/actions/applyObservationCreate.ts) | Apply the single operation named by this handler                            |
| CREATE | [src/logic/actions/applyObservationDelete.ts](../src/logic/actions/applyObservationDelete.ts) | Apply the single operation named by this handler                            |
| CREATE | [src/logic/actions/applyPatientCreate.ts](../src/logic/actions/applyPatientCreate.ts)         | Apply the single operation named by this handler                            |
| CREATE | [src/logic/actions/applyPatientDelete.ts](../src/logic/actions/applyPatientDelete.ts)         | Apply the single operation named by this handler                            |
| CREATE | [src/logic/actions/applyPatientUpdate.ts](../src/logic/actions/applyPatientUpdate.ts)         | Apply the single operation named by this handler                            |
| CREATE | [src/logic/actions/applyTaskCreate.ts](../src/logic/actions/applyTaskCreate.ts)               | Apply the single operation named by this handler                            |
| CREATE | [src/logic/actions/applyTaskDelete.ts](../src/logic/actions/applyTaskDelete.ts)               | Apply the single operation named by this handler                            |
| CREATE | [src/logic/actions/applyTaskToggle.ts](../src/logic/actions/applyTaskToggle.ts)               | Apply the single operation named by this handler                            |
| CREATE | [src/logic/actions/applyTaskUpdate.ts](../src/logic/actions/applyTaskUpdate.ts)               | Apply the single operation named by this handler                            |

Practice: follow a `task.update` action through the dispatcher and handler. Explain
why the handler does not write storage or append its own activity event.

Suggested commit: `refactor: extract action handlers and clarify quality-check output`
