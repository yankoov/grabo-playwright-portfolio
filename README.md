# Grabo.bg E2E Automation Testing Portfolio

This is an End-to-End (E2E) automated testing portfolio designed and developed using **Playwright** and **TypeScript** for the Bulgarian e-commerce and voucher platform **Grabo.bg**. The project demonstrates modern software testing architecture, clean code principles, and advanced synchronization strategies when dealing with dynamic web interfaces.

---

## 🚀 Key Features & Engineering Decisions

* **Page Object Model (POM) Architecture:** Strict separation of concerns. Page definitions (locators and action workflows) are entirely decoupled from the test scenarios to maximize maintainability and scalability.
* **Smart Contextual Form Handling:** Developed dynamic runtime logic inside the `RegisterPage` layer. The framework automatically detects the active UI state—sensing whether to interact with the compact header dropdown micro-form (`form[name="hdrrf"]`) or to adapt seamlessly to the standalone full-page signup view after a backend redirection layout split.
* **Resilience Against Strict Mode Violations:** To completely bypass DOM node duplication conflicts (e.g., matching hidden mobile layouts or layered dropdown containers like `#droplogin_signup`), the repository utilizes precise filtering via Playwright's `.filter({ hasNot: ... })` engine combined with clean user-facing `getByRole` semantics.
* **Secure Environment Configuration:** Sensitive authentication keys, registration footprints, and test emails are isolated from the codebase. They are injected at runtime using encrypted local footprints via `dotenv`.

---

## 🛠️ Technology Stack

* **Test Framework:** [Playwright](https://playwright.dev/)
* **Language:** TypeScript (Node.js runtime environment)
* **Configuration Management:** Dotenv

---

## 📂 Repository Structure

```text
├── pages/
│   ├── HomePage.ts       # Navigation base, cookie acceptance, and location modals
│   ├── LoginPage.ts      # Authentication locators and action flows
│   └── RegisterPage.ts   # Dynamic register logic (Header Micro-form vs. Standalone view)
├── tests/
│   ├── login.spec.ts     # Login workflow validation tests
│   └── register.spec.ts  # Registration workflows and empty input boundary testing
├── .env.example          # Safe configuration template for environment variables
├── playwright.config.ts  # Global execution configurations (parallelism, retries, reporting)
└── README.md             # Project documentation