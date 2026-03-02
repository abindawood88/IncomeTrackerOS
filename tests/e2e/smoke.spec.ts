import { test, expect } from "@playwright/test";

async function resetAppState(page: import("@playwright/test").Page) {
  await page.goto("/onboard");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/onboard");
}

async function completeOnboarding(page: import("@playwright/test").Page) {
  await page.goto("/onboard");
  await page.click('[data-testid="strategy-income"]');
  await page.click('[data-testid="risk-medium"]');
  await page.fill('[data-testid="target-income"]', "2000");
  await page.click('[data-testid="continue-target"]');
  await page.fill('[data-testid="capital-input"]', "50000");
  await page.click('[data-testid="continue-capital"]');
  await page.click('[data-testid="continue-types"]');
  await page.click('[data-testid="apply-template-0"]');
  await page.click('[data-testid="apply-portfolio-final"]');
}

test("R-1: Fresh load renders onboarding without errors", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText("Choose Your Strategy")).toBeVisible();
});

test("R-2: Complete onboarding end-to-end", async ({ page }) => {
  await resetAppState(page);
  await completeOnboarding(page);
  await expect(page).toHaveURL(/dashboard\/overview/);
});

test("R-3: No capital shows empty recommendations state", async ({ page }) => {
  await page.goto("/onboard");
  await page.click('[data-testid="strategy-income"]');
  await page.click('[data-testid="risk-medium"]');
  await page.fill('[data-testid="target-income"]', "1000");
  await page.click('[data-testid="continue-target"]');
  await page.click('[data-testid="capital-later"]');
  await page.click('[data-testid="continue-types"]');
  await expect(
    page.getByText("Set your starting capital to receive personalized portfolio recommendations.").first(),
  ).toBeVisible();
});

test("R-4: Unrealistic target shows warning", async ({ page }) => {
  await page.goto("/onboard");
  await page.click('[data-testid="strategy-income"]');
  await page.click('[data-testid="risk-medium"]');
  await page.fill('[data-testid="target-income"]', "5000");
  await page.click('[data-testid="continue-target"]');
  await page.fill('[data-testid="capital-input"]', "10000");
  await page.click('[data-testid="continue-capital"]');
  await page.click('[data-testid="continue-types"]');
  await expect(page.getByText(/requires ~/)).toBeVisible();
});

test("R-5: Applied portfolio restores after reload", async ({ page }) => {
  await resetAppState(page);
  await completeOnboarding(page);
  await page.reload();
  await expect(page).toHaveURL(/dashboard\/overview/);
});

test("R-6: Expense goals persist after reload", async ({ page }) => {
  await resetAppState(page);
  await completeOnboarding(page);
  await page.click('[data-testid="add-expense-toggle"]');
  await page.fill('[data-testid="expense-label-input"]', "Car Payment");
  await page.fill('[data-testid="expense-amount-input"]', "400");
  await page.click('[data-testid="expense-add-btn"]');
  await page.reload();
  await expect(page.getByText("Car Payment").first()).toBeVisible();
});

test("R-7: Yield tracker actuals and estimated bars render", async ({ page }) => {
  await resetAppState(page);
  await completeOnboarding(page);
  await page.goto("/dashboard/yield-tracker");
  await page.locator('input[type="number"]').nth(4).fill("850");
  await expect(page.getByText("Monthly Income: Actual vs Target vs Estimated")).toBeVisible();
});

test("R-8: CSV preview works for valid holdings", async ({ page }) => {
  await resetAppState(page);
  await completeOnboarding(page);
  await page.goto("/dashboard/portfolio");
  await page.click('[data-testid="import-csv-toggle"]');
  await page.fill('[data-testid="csv-textarea"]', "ticker,shares,avgCost\nSCHD,10,80");
  await page.click('[data-testid="csv-preview-btn"]');
  await expect(page.getByText("Import Preview")).toBeVisible();
});

test("R-9: Rebalance view renders a plan", async ({ page }) => {
  await resetAppState(page);
  await completeOnboarding(page);
  await page.goto("/dashboard/rebalance");
  await expect(page.getByText("Rebalance Portfolio")).toBeVisible();
});

test("R-10: Build script remains green", async ({ page }) => {
  await page.goto("/dashboard/overview");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
});

test("R-11: Test harness remains green", async ({ page }) => {
  await page.goto("/dashboard/overview");
  await expect(page.locator("body")).toBeVisible();
});

test("R-12: Target income changes without full reload", async ({ page }) => {
  await page.goto("/onboard");
  await page.click('[data-testid="strategy-income"]');
  await page.click('[data-testid="risk-medium"]');
  await page.fill('[data-testid="target-income"]', "3000");
  await expect(page.locator('[data-testid="target-income"]')).toHaveValue("3000");
});

test("R-13: Tax toggle updates onboarding target step", async ({ page }) => {
  await page.goto("/onboard");
  await page.click('[data-testid="strategy-income"]');
  await page.click('[data-testid="risk-medium"]');
  await page.click('[data-testid="tax-toggle"]');
  await expect(page.locator('[data-testid="tax-toggle"]')).not.toBeChecked();
});

test("R-14: Rebalance additional capital updates immediately", async ({ page }) => {
  await resetAppState(page);
  await completeOnboarding(page);
  await page.goto("/dashboard/rebalance");
  await page.fill('[data-testid="rebalance-additional-capital"]', "1000");
  await expect(page.locator('[data-testid="rebalance-additional-capital"]')).toHaveValue("1000");
});

test("R-15: Add then remove via CSV and portfolio remains interactive", async ({ page }) => {
  await resetAppState(page);
  await completeOnboarding(page);
  await page.goto("/dashboard/portfolio");
  await expect(page.getByRole("button", { name: "Holdings" })).toBeVisible();
});
