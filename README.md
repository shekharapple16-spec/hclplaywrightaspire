# hclplaywrightaspire

Professional Playwright test-suite repository used for automation exercises and examples.

## Summary

This repository contains end-to-end web UI tests implemented with Playwright Test. The tests are organized by exercise/day and cover common UI scenarios such as file uploads, multi-selects, range sliders, alerts, datepickers, and scrolling. It serves as a learning and demo project for writing reliable browser tests.

## Features

- Organized test suites by day/exercise under `tests/`
- Examples for file upload, multi-select, range slider, alerts, date pickers, and scrolling
- Playwright HTML test report available in `playwright-report/`
- Cross-browser testing via Playwright (Chromium, Firefox, WebKit)

## Installation

Prerequisites:

- Node.js (recommended v16+)
- Git (to clone the repo)

Steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/shekharapple16-spec/hclplaywrightaspire.git
   cd hclplaywrightaspire
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. (Optional) Install Playwright browsers:

   ```bash
   npx playwright install
   ```

## How to run

- Run all tests:

  ```bash
  npx playwright test
  ```

- Run a single test file:

  ```bash
  npx playwright test tests/day5/test_file_upload.spec.js
  ```

- View the HTML report after a run:

  ```bash
  npx playwright show-report
  ```

- Run tests headed (visible browser) for debugging:

  ```bash
  npx playwright test --headed
  ```

If your `package.json` defines npm scripts, you can also use `npm test` or other scripts as configured.

## Folder structure

- `tests/` - Test specs organized by day (e.g., `day3/`, `day4/`, `day5/`, `day6/`).
- `playwright.config.js` - Playwright test runner configuration.
- `playwright-report/` - Generated HTML report (created after test runs).
- `test-results/` - Raw test result artifacts.
- `package.json` - Project dependencies and scripts.

Example:

```
package.json
playwright.config.js
playwright-report/
test-results/
tests/
  day3/
  day4/
  day5/
  day6/
```

## Tech Stack

- Node.js
- Playwright Test (official Playwright test runner)
- JavaScript (ES6+)

## Contributing

Contributions are welcome. Please open issues or pull requests for fixes and enhancements. Keep tests small and focused and add descriptive names.

## License

This repository does not include a license file. Add one if you plan to publish or share this project publicly.

