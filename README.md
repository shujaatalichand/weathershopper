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
├── playwright.config.ts         # Central Playwright config (projects, timeouts, reporters, env loading)
├── .env.example / .env.stage / .env.prod   # Per-environment BASE_URL
├── tsconfig.json
├── .github/workflows/gitactions.yml        # CI pipeline
│
├── allure-results/ , allure-report/, test-results/, playwright-report/   # Generated output (git-ignored)
```

### Architecture notes

- **Page Object Model**: UI locators and actions should live in `src/pages/*`. Specs should interact with these classes rather than raw selectors.
- **Fixtures over `beforeEach`**: give each spec file its own fixture in `src/fixtures/*Fixture.ts` that extends Playwright's `test`, handling navigation/setup and injecting ready-to-use page objects into tests.
- **Environment-driven config**: `playwright.config.ts` reads `process.env.ENV` (defaulting to `stage`) and loads `.env.<ENV>` via `dotenv`, exposing `BASE_URL` to tests. Only `stage` currently has a `BASE_URL` set (`https://weathershopper.pythonanywhere.com`), the only real deployment. `example` and `prod` are left without a `BASE_URL` as placeholders — running against them throws immediately until those deployments exist and their `.env.*` files are filled in.
- **Environment-scoped test data**: `utils/testData.ts` loads `src/test-data/<ENV>/<filename>.json`, so test data can differ per environment. Add JSON files there as needed. `src/test-data/prod/` is git-ignored (aside from `.gitkeep`) since a real prod deployment would need real-looking data that shouldn't be committed; `stage` and `example` data are safe to commit.
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

The suite is wired for three environments, selected via the `ENV` variable: `example`, `stage`, `prod`. Each maps to a `.env.<ENV>` file, but only `stage` is a real deployment today:

```bash
# .env.stage
BASE_URL=https://weathershopper.pythonanywhere.com
ENV=stage
```

`.env.example` and `.env.prod` are placeholders with no `BASE_URL` set. If `BASE_URL` isn't resolvable for the selected `ENV`, `playwright.config.ts` throws immediately with a clear error — so running `test:example` or `test:prod` today will fail until those environments exist and their `.env.*` files are filled in. `ENV` defaults to `stage` when unset.

## Running tests

Tests are run via `npm run` scripts that combine **environment** × **scope**. The pattern is:

```
npm run test:<env>[:<scope>]
```

Where `<env>` is `example`, `stage`, or `prod`, and `<scope>` is one of: `e2e`, `smoke`, `regression`.

### All tests, per environment

```bash
npm run test:stage       # everything, against stage (the only live environment today)
npm run test:example     # will fail until an example deployment + .env.example are set up
npm run test:prod        # will fail until a prod deployment + .env.prod are set up
```

### By folder

```bash
npm run test:stage:e2e   # only e2e/**/*.spec.ts
```

### By tag

```bash
npm run test:stage:smoke        # @smoke
npm run test:stage:regression   # @regression
```

### Running Playwright directly (custom combinations)

Any combination not covered by an `npm run` script can be run directly with `npx playwright test`, as long as `ENV` is set (or omitted, since it defaults to `stage`):

```bash
# Single spec file
ENV=stage npx playwright test e2e/some.spec.ts

# Single test by name
ENV=stage npx playwright test -g "should do something"

# Specific browser project
ENV=stage npx playwright test --project=firefox

# Headed / debug mode
ENV=stage npx playwright test e2e/some.spec.ts --headed --debug

# UI mode (interactive test runner)
ENV=stage npx playwright test --ui
```

### Browsers

`playwright.config.ts` currently defines a single active project, `chromium` (the `firefox` and `webkit` projects are present but commented out). Use `--project=<name>` to restrict to a specific project once more are enabled.

### Parallelism & retries

- `fullyParallel: true`, `workers: 2` (both locally and in CI)
- `retries: 1` for failed tests
- `forbidOnly` is enforced in CI (a stray `test.only` will fail the build)
- Tests run in headed mode by default (`headless: false` in config) with tracing always on (`trace: 'on'`) and screenshots on failure

## Reports

This project uses **Allure** for rich HTML reports (in addition to Playwright's built-in `list` reporter).

```bash
npm run allure:clean      # remove allure-results/ and allure-report/
npm run allure:generate   # build allure-report/ from allure-results/
npm run allure:open       # serve/open the generated report
npm run allure:report     # generate + open in one step
```

Every `test:*` script runs `allure:clean` first, so results don't leak between runs. Raw Playwright artifacts (traces, screenshots, videos) are written to `test-results/` and `playwright-report/`.

To view a trace from a failed test:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

## Continuous Integration

`.github/workflows/gitactions.yml` runs on push/PR to `main`, and can also be triggered manually (`workflow_dispatch`) with two inputs:

- **env**: `example` | `stage` | `prod` (default `stage`, the only live environment today)
- **suite**: `e2e` | `smoke` | `regression` (default `e2e`)

It installs dependencies, installs Playwright browsers with OS deps, runs `npm run test:<env>:<suite>`, generates the Allure report, and uploads both the Allure report and the Playwright report as build artifacts (30-day retention).

## Adding a new test

1. Create a Page Object in `src/pages/` for the locators and actions on the page you're testing.
2. If the test needs pre-navigated/pre-set-up state, add a fixture in `src/fixtures/` that extends Playwright's `test` and injects your page object.
3. Write the spec in `e2e/`, tagging it appropriately: `test('...', { tag: ['@smoke'] }, async ({ page }) => { ... })`.
4. If the test needs data, add it to `src/test-data/<env>/<filename>.json` and load via `loadTestData('<filename>.json')`.
5. Run it locally with `ENV=stage npx playwright test <path-to-spec>` before opening a PR.
