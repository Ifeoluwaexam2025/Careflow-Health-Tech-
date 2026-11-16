import { test, expect } from "@playwright/test";

test("an already-open workspace can save changes while disconnected", async ({
  page,
  context,
}) => {
  await page.goto("/#/patients/p-101");
  await expect(
    page.getByRole("heading", { name: "Alex Morgan (fictional)" }),
  ).toBeVisible();
  await context.setOffline(true);
  await expect(
    page.getByText("Offline · on this device", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Record observation", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Observation type").selectOption("heartRate");
  await dialog.getByLabel("Heart rate (bpm)", { exact: true }).fill("72");
  await dialog.getByRole("button", { name: "Save observation" }).click();
  await page.getByRole("button", { name: "Observations", exact: true }).click();
  await expect(page.getByText("72", { exact: true })).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await page.getByRole("button", { name: "Observations", exact: true }).click();
  await expect(page.getByText("72", { exact: true })).toBeVisible();
});

test("legacy storage migrates safely through a browser save and refresh", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "careflow-task-status-v1",
      JSON.stringify({ "t-1": true }),
    );
    localStorage.setItem(
      "careflow-created-tasks-v1",
      JSON.stringify([
        {
          id: "legacy-task",
          patientId: "p-101",
          title: "Preserved legacy task",
          description: "Original description",
          status: "pending",
          createdAt: "2025-01-01T00:00:00Z",
          completedAt: null,
        },
      ]),
    );
  });
  await page.goto("/#/patients/p-101");
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Preserved legacy task/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /Record routine observations.*Completed/,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Preserved legacy task/ }).click();
  await page.getByRole("button", { name: "Mark as completed" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Preserved legacy task.*Completed/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("careflow-created-tasks-v1"),
    ),
  ).toContain("legacy-task");
});

test("malformed storage opens recovery and can be exported without replacement", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("careflow-data-v2", "{damaged"),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your existing data is protected" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export original data" }).click();
  await expect((await download).suggestedFilename()).toBe(
    "careflow-local-backup.json",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("careflow-data-v2")),
  ).toBe("{damaged");
});

test("dashboard shortcuts open the corresponding task filters", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".summary-card")
    .filter({ hasText: "Completed tasks" })
    .click();
  await expect(
    page.getByRole("button", { name: "Completed 0", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("No matching tasks")).toBeVisible();
  await page.goBack();
  await page
    .locator(".summary-card")
    .filter({ hasText: "Pending tasks" })
    .click();
  await expect(
    page.getByRole("button", { name: "Pending 5", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".task-card")).toHaveCount(5);
  await page.goBack();
  await page.locator(".summary-card").filter({ hasText: "Due today" }).click();
  await expect(
    page.getByRole("combobox", { name: "Filter by due date" }),
  ).toHaveValue("today");
  await expect(page.getByText("No matching tasks")).toBeVisible();
});

test("patient edits and observation removal survive refresh", async ({
  page,
}) => {
  await page.goto("/#/patients/p-101");
  await page.getByRole("button", { name: "Edit patient" }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Room", { exact: true }).fill("105");
  await dialog
    .getByLabel("Non-clinical notes", { exact: false })
    .fill("Updated fictional context");
  await dialog.getByRole("button", { name: "Save patient" }).click();
  await page.reload();
  await expect(page.locator(".patient-overview")).toContainText("Room 105");
  await expect(page.locator(".patient-overview")).toContainText(
    "Updated fictional context",
  );
  await page
    .getByRole("button", { name: "Record observation", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Temperature (°C)", { exact: true }).fill("37");
  await dialog.getByRole("button", { name: "Save observation" }).click();
  await page.getByRole("button", { name: "Observations", exact: true }).click();
  await page
    .getByRole("button", { name: "Remove temperature observation 37" })
    .click();
  await page.getByRole("button", { name: "Confirm removal" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Observations", exact: true }).click();
  await expect(page.getByText("No observations yet")).toBeVisible();
});

test("a stale second tab cannot silently overwrite a newer save", async ({
  page,
  context,
}) => {
  await page.goto("/#/patients/p-101");
  const stale = await context.newPage();
  await stale.goto("/#/patients/p-101");
  await expect(
    stale.getByRole("heading", { name: "Alex Morgan (fictional)" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Review morning checklist/ }).click();
  await page.getByRole("button", { name: "Mark as completed" }).click();
  await stale
    .getByRole("button", { name: /Record routine observations/ })
    .click();
  await stale.getByRole("button", { name: "Mark as completed" }).click();
  await expect(stale.getByRole("dialog").getByRole("alert")).toContainText(
    "another tab",
  );
  await stale.reload();
  await expect(
    stale.getByRole("button", { name: /Review morning checklist.*Completed/ }),
  ).toBeVisible();
  await expect(
    stale.getByRole("button", { name: /Record routine observations.*Pending/ }),
  ).toBeVisible();
});
