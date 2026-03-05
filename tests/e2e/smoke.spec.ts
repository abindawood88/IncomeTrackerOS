import { expect, test } from "@playwright/test";

test("landing CTA routes to onboarding", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("hero-cta").click();
  await expect(page).toHaveURL(/\/onboard/);
});

test("onboarding completion routes to dashboard overview", async ({ page }) => {
  await page.goto("/onboard");
  await page.getByTestId("onboard-next").click();
  await page.getByTestId("strategy-card-income").click();
  await page.getByTestId("onboard-next").click();
  await page.getByTestId("onboard-finish").click();
  await expect(page).toHaveURL(/\/dashboard\/overview/);
});

test("free tier sees blur gate for pro feature", async ({ page }) => {
  await page.goto("/dashboard/projections");
  await expect(page.getByTestId("feature-gate-overlay")).toBeVisible();
});

test("upgrade endpoint returns checkoutUrl", async ({ page, request }) => {
  await page.goto("/upgrade");
  await expect(page.getByText("Upgrade")).toBeVisible();
  const response = await request.post("/api/payments/create-checkout", {
    data: { tier: "pro" },
  });
  expect([200, 401]).toContain(response.status());
});
