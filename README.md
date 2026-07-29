# Weather Shopper — E2E Test Suite

A Playwright + TypeScript end-to-end test suite for [Weather Shopper](https://weathershopper.pythonanywhere.com/), set up with multi-environment configuration, tag-based test filtering, and Allure reporting. Page objects, fixtures, and specs cover the shopping flow: temperature-based routing, adding the cheapest matching products, and cart verification.

## Tech stack

- [Playwright Test](https://playwright.dev/) (`@playwright/test`) for browser automation
- TypeScript
- [Allure](https://allurereport.org/) for test reporting (`allure-playwright`, `allure-commandline`)
- `dotenv` for per-environment configuration
- GitHub Actions for CI

## Repository structure

```
.
├── e2e/                         # UI end-to-end specs go here
│
├── src/
│   ├── pages/                   # Page Object Model classes go here
│   ├── fixtures/                # Custom Playwright fixtures go here
│   └── test-data/               # Per-environment test data
│       ├── example/
│       ├── stage/
│       └── prod/
│
├── utils/
│   └── testData.ts              # Loads a JSON file from src/test-data/<ENV>/ based on the ENV var
│
├── scripts/
│   └── run-tests.js             # Parses --env/--tag/--project for `npm test`, cleans Allure, runs Playwright
│
├── playwright.config.ts         # Central Playwright config (projects, timeouts, reporters, env loading)
├── .env.example / .env.stage / .env.prod   # Per-environment BASE_URL
├── tsconfig.json
├── .github/workflows/gitactions.yml        # CI pipeline
│
├── allure-results/ , allure-report/, test-results/, playwright-report/   # Generated output (git-ignored)
```

### Architecture notes

- **Page Object Model**: UI locators and actions should live in `src/pages/*`. Specs should interact with these classes rather than raw selectors.
- **Fixtures over `beforeEach`**: `src/fixtures/pagesFixture.ts` extends Playwright's `test` and exposes one fixture per page object (`homePage`, `productsPage`, `cartPage`, `confirmationPage`), all bound to the same `page`, each handling its own navigation/setup. Specs import `test` from this file and destructure whichever page objects they need — no manual instantiation or chaining between page objects.
- **Environment-driven config**: `playwright.config.ts` reads `process.env.ENV` (defaulting to `prod`) and loads `.env.<ENV>` via `dotenv`, exposing `BASE_URL` to tests. Only `prod` currently has a `BASE_URL` set (`https://weathershopper.pythonanywhere.com`), the only real deployment. `example` and `stage` are left without a `BASE_URL` as placeholders — running against them throws immediately until those deployments exist and their `.env.*` files are filled in.
- **Environment-scoped test data**: `utils/testData.ts` loads `src/test-data/<ENV>/<filename>.json`, so test data can differ per environment. Add JSON files there as needed. `src/test-data/stage/` is git-ignored (aside from `.gitkeep`) since a real stage deployment would need real-looking data that shouldn't be committed; `prod` and `example` data are safe to commit. Note: `prod`'s data (`card.json`) is only a well-known public Stripe test card, not real/sensitive data — it's committed purely for this practice suite's convenience. On a project with real prod credentials, `src/test-data/prod/` should be the one added to `.gitignore` (mirroring how `stage/` is handled here) to keep it confidential.
- **Tags**: tag tests with Playwright's `test(name, { tag: [...] }, fn)` syntax (e.g. `@smoke`, `@regression`) to enable `--grep` filtering. Add new tag-specific `npm run` scripts as the suite grows.

## Prerequisites

- Node.js (LTS recommended)
- npm

## Installation

```bash
git clone <repo-url>
cd weathershopper
npm install
```

`npm install` triggers a `postinstall` script that runs `npx playwright install` automatically, downloading the Chromium/Firefox/WebKit browser binaries Playwright needs. If that step is ever skipped, run it manually:

```bash
npx playwright install
```

## Environment configuration

The suite is wired for three environments, selected via the `ENV` variable: `example`, `stage`, `prod`. Each maps to a `.env.<ENV>` file, but only `prod` is a real deployment today:

```bash
# .env.prod
BASE_URL=https://weathershopper.pythonanywhere.com
ENV=prod
```

`.env.example` and `.env.stage` are placeholders with no `BASE_URL` set. If `BASE_URL` isn't resolvable for the selected `ENV`, `playwright.config.ts` throws immediately with a clear error — so running `npm test -- --env=example` or `--env=stage` today will fail until those environments exist and their `.env.*` files are filled in. `ENV` defaults to `prod` when unset.

## Running tests

There's a single test entry point, `npm test`, parametrized via flags rather than a separate `npm run` script per environment/tag/browser combination. It runs `scripts/run-tests.js`, which cleans the previous Allure results (`allure:clean`) and then invokes `npx playwright test` with the resolved options:

```bash
npm test -- [--env=<env>] [--tag=<tag>] [--project=<project>] [any other playwright test flags/args]
```

- `--env`: `example`, `stage`, or `prod`. Sets `ENV` for `playwright.config.ts`/`dotenv`. Defaults to `prod` (the only live environment today).
- `--tag`: filters to a Playwright tag, e.g. `smoke` or `regression` (translates to `--grep @<tag>`). Omit to run everything.
- `--project`: restricts to one browser project (`chromium`, `firefox`, `webkit`). Omit to run all three.
- Anything else you pass after `--` that isn't one of the flags above (a spec path, `-g "name"`, `--headed`, `--debug`, `--ui`, ...) is forwarded straight to `npx playwright test`.

```bash
# Everything, against prod, all browsers
npm test

# Only @smoke tests, against stage
npm test -- --env=stage --tag=smoke

# @regression on firefox only
npm test -- --tag=regression --project=firefox

# Single spec file, headed/debug
npm test -- e2e/some.spec.ts --headed --debug

# Single test by name
npm test -- -g "should do something"

# UI mode (interactive test runner)
npm test -- --ui
```

### Browsers

`playwright.config.ts` defines three active projects: `chromium`, `firefox`, and `webkit`. Tests run across all of them by default; use `--project=<name>` to restrict to a single one.

### Parallelism & retries

- `fullyParallel: true`, `workers: 2` (both locally and in CI)
- `retries: 1` for failed tests
- `forbidOnly` is enforced in CI (a stray `test.only` will fail the build)
- Tests run headed locally and headless in CI (`headless: !!process.env.CI` in config, since GitHub Actions runners have no display) with tracing always on (`trace: 'on'`) and screenshots on failure

## Reports

This project uses **Allure** for rich HTML reports (in addition to Playwright's built-in `list` reporter).

```bash
npm run allure:clean      # remove allure-results/ and allure-report/
npm run allure:generate   # build allure-report/ from allure-results/
npm run allure:open       # serve/open the generated report
npm run allure:report     # generate + open in one step
```

`npm test` always runs `allure:clean` first, so results don't leak between runs. Raw Playwright artifacts (traces, screenshots, videos) are written to `test-results/` and `playwright-report/`.

To view a trace from a failed test:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## Continuous Integration

`.github/workflows/gitactions.yml` runs on push/PR to `main`, and can also be triggered manually (`workflow_dispatch`) with two inputs:

- **env**: `example` | `stage` | `prod` (default `prod`, the only live environment today)
- **suite**: `e2e` | `smoke` | `regression` (default `e2e`)

It installs dependencies, installs Playwright browsers with OS deps, runs `npm test -- --env=<env> [--tag=<suite>] --project=chromium` (no `--tag` when `suite` is `e2e`, i.e. everything), generates the Allure report, and uploads both the Allure report and the Playwright report as build artifacts (30-day retention).

## Adding a new test

1. Create a Page Object in `src/pages/` for the locators and actions on the page you're testing.
2. If the page needs pre-navigated/pre-set-up state, add a fixture entry for it in `src/fixtures/pagesFixture.ts`, following the existing `homePage`/`productsPage`/etc. pattern, so specs can request it by name.
3. Write the spec in `e2e/`, tagging it appropriately: `test('...', { tag: ['@smoke'] }, async ({ page }) => { ... })`.
4. If the test needs data, add it to `src/test-data/<env>/<filename>.json` and load via `loadTestData('<filename>.json')`.
5. Run it locally with `npm test -- <path-to-spec>` before opening a PR.
