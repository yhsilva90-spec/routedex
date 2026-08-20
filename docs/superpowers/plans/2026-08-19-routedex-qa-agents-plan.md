# RouteDex QA Agents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar um ciclo de QA local e no GitHub Actions para validar dados, interações e visualizações do RouteDex, gerando evidências e permitindo correções determinísticas separadas de sugestões visuais.

**Architecture:** A auditoria de dados será uma biblioteca TypeScript pura consumida por testes e pelo agente local. Os fluxos de navegador serão executados pelo Playwright em modo headless, com screenshots e métricas de viewport. A revisão visual interativa no navegador interno do Codex continuará sendo uma etapa orquestrada pela sessão do Codex, não uma dependência escondida dentro do script Node.

**Tech Stack:** TypeScript, Vitest, React/Vite, Playwright, Node.js, GitHub Actions, JSON/Markdown para artefatos.

**Spec:** `docs/superpowers/specs/2026-08-19-routedex-qa-agents-design.md`

## Global Constraints

- O comando de análise não pode modificar código da aplicação nem publicar commits.
- Correções automáticas ficam isoladas em `agent:qa:fix` e só podem tratar aliases, duplicações e inclusões canônicas determinísticas.
- Mudanças visuais serão reportadas com screenshot e não serão aplicadas automaticamente.
- Os testes devem cobrir desktop `1440×900`, tablet `1024×768` e mobile `390×844`.
- O estado de captura deve continuar global por espécie e sincronizado entre localidades.
- O workflow do GitHub Actions deve armazenar relatórios e screenshots como artefatos sem fazer commit automático.
- As alterações locais já existentes em `README.md`, `scripts/import_workbook.py`, `src/data/gameData.ts` e scripts de reconciliação devem ser preservadas.

---

### Task 1: Regras de auditoria de dados

**Files:**
- Create: `src/domain/qa/dataAudit.ts`
- Create: `src/domain/qa/dataAudit.test.ts`
- Modify: `src/domain/types.ts` only if a shared report type is needed

**Interfaces:**
- Produces `auditGameData(locations, pokemon): DataAuditReport`.
- `DataAuditReport` contains `summary`, `issues`, and `sourceCoverage`.
- Each issue contains `severity`, `kind`, `location`, optional `pokemonId`, and human-readable `message`.

- [ ] **Step 1: Write failing tests for duplicate and invalid-route detection**

```ts
it('reports duplicate species in one location', () => {
  const report = auditGameData([locationWithEncounter(41), locationWithEncounter(41)], pokemon);
  expect(report.issues.some((issue) => issue.kind === 'duplicate-encounter')).toBe(true);
});

it('reports legacy route aliases', () => {
  const report = auditGameData([locationNamed('Route 22')], pokemon);
  expect(report.issues.some((issue) => issue.kind === 'invalid-location')).toBe(true);
});
```

- [ ] **Step 2: Run `pnpm vitest run src/domain/qa/dataAudit.test.ts` and confirm failure**
- [ ] **Step 3: Implement pure checks for duplicate species, invalid route aliases, missing source, invalid method/time/version values, and unknown-time records**
- [ ] **Step 4: Add tests for canonical source coverage and special-case classification**
- [ ] **Step 5: Run the focused test and then `pnpm test -- --run`; expect all tests to pass**

### Task 2: Data QA report generator

**Files:**
- Create: `scripts/qa-data.mjs`
- Create: `scripts/qa-report.mjs`
- Create: `scripts/qa-data.test.mjs` or extend the TypeScript test with serialization coverage
- Create: `artifacts/qa/.gitkeep`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- `pnpm agent:qa:data` runs a read-only audit and writes `artifacts/qa/data-report.json` plus `artifacts/qa/data-report.md`.
- The JSON report uses the `DataAuditReport` shape from Task 1.
- The Markdown report includes command, timestamp, totals, issue counts, and top issues.

- [ ] **Step 1: Add a failing serialization test for a report with one issue and one clean category**
- [ ] **Step 2: Run the focused test and confirm failure**
- [ ] **Step 3: Implement the report serializer and loader for `src/data/gameData.ts` without importing React**
- [ ] **Step 4: Add `agent:qa:data` to `package.json` and keep it non-mutating**
- [ ] **Step 5: Run `pnpm agent:qa:data` and verify both artifacts exist with valid JSON and readable Markdown**

### Task 3: Browser test foundation

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/fixtures.ts`
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- `pnpm agent:qa:interaction` starts Vite on a deterministic local port and runs Playwright headless.
- Tests use accessible roles and stable `data-testid` attributes, not fragile CSS generated from layout.
- The Playwright report and screenshots go under `artifacts/qa/interaction/`.

- [ ] **Step 1: Add the Playwright dependency and a failing smoke test that expects the RouteDex heading**
- [ ] **Step 2: Run the focused Playwright test and confirm the missing setup failure**
- [ ] **Step 3: Configure `webServer`, Chromium, retries in CI, trace-on-first-retry, and artifact output**
- [ ] **Step 4: Add a stable test id to the app shell and make the smoke test pass**
- [ ] **Step 5: Run the smoke test in headed and headless modes once; keep headless as the automated command**

### Task 4: Capture and navigation interaction coverage

**Files:**
- Modify: `src/App.tsx` to add stable accessible labels/test ids only where needed
- Create: `tests/e2e/capture-sync.spec.ts`
- Create: `tests/e2e/navigation.spec.ts`
- Create: `tests/e2e/persistence.spec.ts`

**Interfaces:**
- The tests use a fresh browser context per spec and clear local storage before setup.
- Capture assertions inspect the visible captured state and the shared count, not implementation details.

- [ ] **Step 1: Write failing tests for route open/close, whole-row capture, and shared capture synchronization**
- [ ] **Step 2: Run only those tests and confirm failures identify missing selectors or behavior**
- [ ] **Step 3: Add the minimal stable labels/test ids and fix only behavior defects exposed by the tests**
- [ ] **Step 4: Add tests for filters, sidebar, Dex, National Dex, League, export/import, and reload persistence**
- [ ] **Step 5: Run the complete interaction suite and save traces/screenshots for failures**

### Task 5: Visual QA agent

**Files:**
- Create: `scripts/qa-visual.mjs`
- Create: `tests/e2e/visual.spec.ts`
- Create: `src/domain/qa/visualReport.ts`
- Create: `src/domain/qa/visualReport.test.ts`
- Modify: `package.json`

**Interfaces:**
- `pnpm agent:qa:visual` runs the visual suite at the three required viewport sizes.
- The visual report includes screenshot paths, viewport, route state, horizontal overflow measurement, and critical bounding boxes.
- The first visual run produces diagnostic screenshots; approved reference snapshots are added only after the Codex interactive review.

- [ ] **Step 1: Write failing pure tests for classifying overflow and clipped elements from measured rectangles**
- [ ] **Step 2: Run the focused visual-report tests and confirm failure**
- [ ] **Step 3: Implement the metrics classifier with explicit thresholds and no pixel-perfect assumptions**
- [ ] **Step 4: Add browser scenarios for a left, center, and right expanded route at all viewports**
- [ ] **Step 5: Run the visual agent and inspect generated screenshots in the Codex browser before approving baselines**

### Task 6: Consolidated agent commands and safe fix boundary

**Files:**
- Modify: `scripts/routedex-agent.mjs`
- Modify: `src/domain/agent.test.ts`
- Create: `scripts/qa-fix.mjs`
- Modify: `package.json`

**Interfaces:**
- Add `qa:data`, `qa:interaction`, `qa:visual`, `qa`, and `qa:fix` commands.
- `qa` runs the three read-only agents and writes `artifacts/qa/summary.md`.
- `qa:fix` exits without changes when an issue is not one of the approved deterministic kinds.

- [ ] **Step 1: Extend the agent command test with the new command names and mutation flags**
- [ ] **Step 2: Run the focused agent test and confirm failure**
- [ ] **Step 3: Implement command dispatch and a summary aggregator that preserves child exit codes**
- [ ] **Step 4: Implement deterministic fix allow-list checks without adding layout or CSS mutation**
- [ ] **Step 5: Run `pnpm agent:qa` and verify the summary includes each child report**

### Task 7: GitHub Actions and documentation

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `.github/workflows/qa.yml`
- Modify: `README.md`
- Create: `docs/routedex-qa-agents.md`

**Interfaces:**
- `qa.yml` runs on pushes and pull requests, uploads `artifacts/qa` on failure or manual dispatch, and never commits.
- The documentation explains local commands, report locations, browser prerequisites, and the Codex interactive review boundary.

- [ ] **Step 1: Add a workflow validation test or YAML shape check for the QA workflow’s commands and artifact upload**
- [ ] **Step 2: Run the validation and confirm it fails before the workflow exists**
- [ ] **Step 3: Add the QA workflow with Node/pnpm setup, Playwright browser installation, data QA, interaction QA, visual QA, and artifact upload**
- [ ] **Step 4: Document the agent commands and clarify that visual suggestions are reviewed before code changes**
- [ ] **Step 5: Run the full local check, inspect the generated report, and validate the workflow syntax**

### Task 8: Interactive Codex browser review

**Files:**
- No application files; use the running local server and generated artifacts.

- [ ] **Step 1: Start the local app with `pnpm agent:dev`**
- [ ] **Step 2: Open the local app in the Codex in-app browser**
- [ ] **Step 3: Exercise left, center, and right route expansion; filters; sidebar; Dex; League; capture and reload**
- [ ] **Step 4: Capture screenshots for every material visual issue and map each issue to the QA report**
- [ ] **Step 5: Apply only approved visual corrections in a separate change cycle, then rerun Tasks 4–7**

## Verification Gate

Before claiming the system is operational, run:

```text
pnpm test -- --run
pnpm agent:check
pnpm agent:qa:data
pnpm agent:qa:interaction
pnpm agent:qa:visual
pnpm agent:qa
```

The final report must state exact pass/fail counts, list remaining issues, and link to generated screenshots. A warning about the existing large JavaScript chunk may remain, but it must not be reported as a test failure.
