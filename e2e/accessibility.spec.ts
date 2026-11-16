import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("main views and forms have no automated WCAG A/AA violations", async ({
  page,
}) => {
  for (const route of [
    "overview",
    "patients",
    "patients/p-101",
    "tasks",
    "observations",
    "activity",
  ]) {
    await page.goto(`/#/${route}`);
    await expect(page.locator("main h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
      route,
    ).toEqual([]);
  }
  await page.goto("/#/patients/p-101");
  for (const action of ["Edit patient", "Add task", "Record observation"]) {
    await page.getByRole("button", { name: action, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
      action,
    ).toEqual([]);
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: /Review morning checklist/ }).click();
  let result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: "Delete task" }).click();
  result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
