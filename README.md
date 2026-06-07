# Grabo.bg E2E Automation Testing Portfolio

This is an End-to-End (E2E) automated testing portfolio designed and developed using **Playwright** and **TypeScript** for the Bulgarian e-commerce and voucher platform **Grabo.bg**. The project demonstrates modern software testing architecture, clean code principles, and advanced synchronization strategies when dealing with dynamic web interfaces.

---

## 🚀 Key Features & Engineering Decisions

- **Page Object Model (POM) Architecture:** Strict separation of concerns. Page definitions (locators and action workflows) are entirely decoupled from the test scenarios to maximize maintainability and scalability.

- **Cross-Browser Header Compatibility:** Grabo.bg serves two different header layouts depending on the browser's User-Agent. The new header (Chromium) uses inline dropdown forms, while the legacy header (Firefox/WebKit in CI) navigates to standalone pages. All page objects detect the active context at runtime via `Promise.race()` and handle both layouts transparently.

- **Smart Contextual Form Handling:** Dynamic runtime logic inside `RegisterPage` and `LoginPage` automatically detects whether to interact with the compact header dropdown micro-form or adapt to the standalone full-page view after a backend redirection.

- **Resilience Against Strict Mode Violations:** To bypass DOM node duplication conflicts (e.g., layered dropdown containers like `#droplogin_signup` and `#droplogin_signin` coexisting in the DOM), the project uses Playwright's `.filter({ hasNot: ... })` engine combined with `getByRole` semantics for precise element isolation.

- **Secure Environment Configuration:** Sensitive credentials and test emails are isolated from the codebase and injected at runtime via `dotenv`.

- **CI/CD Integration:** GitHub Actions workflow runs the full test suite across Chromium, Firefox, and WebKit on every push, with automatic retry on failure and HTML report artifacts.

---

## 🛠️ Technology Stack

- **Test Framework:** [Playwright](https://playwright.dev/)
- **Language:** TypeScript
- **CI/CD:** GitHub Actions
- **Configuration Management:** dotenv

---

## 📂 Repository Structure

```
├── pages/
│   ├── HomePage.ts       # Navigation, popup handling, search
│   ├── LoginPage.ts      # Authentication locators and flows
│   ├── RegisterPage.ts   # Registration logic (dropdown vs. standalone page)
│   └── CartPage.ts       # Cart and checkout flows
├── tests/
│   ├── homepage.spec.ts  # Smoke tests — title, logo, search
│   ├── login.spec.ts     # Login validation (negative test)
│   ├── register.spec.ts  # Registration boundary testing (empty fields)
│   └── cart.spec.ts      # Add to cart E2E flow
├── .env.example          # Environment variable template
├── playwright.config.ts  # Timeouts, retries, browser projects
└── README.md
```

---

## ⚙️ Setup

```bash
npm install
npx playwright install
```

Copy `.env.example` to `.env` and fill in your test credentials.

## ▶️ Running Tests

```bash
# All browsers
npx playwright test

# Single browser
npx playwright test --project=chromium

# View HTML report
npx playwright show-report
```