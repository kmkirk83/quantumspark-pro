import { test, expect } from "@playwright/test";

test.describe("QuantumSpark Pro – page smoke tests", () => {
  test("trading dashboard loads with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/QuantumSpark Pro/);
    await expect(page.locator("h1")).toContainText("QuantumSpark Pro");
  });

  test("dashboard navigation links are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Mission Control" })
    ).toBeVisible();
  });

  test("mission control page loads with correct title", async ({ page }) => {
    await page.goto("/mission-control.html");
    await expect(page).toHaveTitle(/Mission Control/);
  });

  test("no console errors on dashboard load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/");
    // Filter out errors from CDN unavailability (e.g. offline / sandboxed CI)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("net::ERR_") &&
        !e.includes("Failed to fetch") &&
        !e.includes("is not defined") // CDN scripts not loaded in offline env
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
