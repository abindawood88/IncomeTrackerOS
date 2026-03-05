import { expect, test } from "@playwright/test";

test("Landing CTA routes to onboarding", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("hero-cta").click();
  await expect(page).toHaveURL(/\/onboard/);
});

test("Onboarding completion routes to dashboard overview", async ({ page }) => {
  await page.goto("/onboard");
  await page.getByTestId("strategy-card-income").click();
  await page.getByTestId("onboard-next").click();
  await page.getByTestId("onboard-next").click();
  await page.getByTestId("onboard-finish").click();
  await expect(page).toHaveURL(/\/dashboard\/overview/);
});

test("Free tier sees gate overlay for PRO feature", async ({ page }) => {
  await page.goto("/dashboard/projections");
  await expect(page.getByTestId("feature-gate-drip_simulator")).toContainText("Upgrade");
});

test("Upgrade endpoint returns checkoutUrl from mock provider", async ({ request }) => {
  const res = await request.post("/api/payments/create-checkout", {
    data: { tier: "pro", userId: "e2e-user" },
  });
  expect(res.ok()).toBeTruthy();
  const json = (await res.json()) as { checkoutUrl?: string };
  expect(json.checkoutUrl).toBeTruthy();
});
