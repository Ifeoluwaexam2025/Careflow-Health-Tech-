import { test, expect } from "@playwright/test";

test("complete fictional care workflow persists across refresh", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Workspace overview" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add patient" }).first().click();
  let dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // Native modal focus remains inside the dialog even after wrapping backwards.
  await page.keyboard.press("Shift+Tab");
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
  await dialog
    .getByLabel("Fictional patient name")
    .fill("Casey Rivers (fictional)");
  await dialog.getByLabel("Room", { exact: true }).fill("104");
  await dialog.getByRole("button", { name: "Save patient" }).click();
  await expect(
    page.getByRole("heading", { name: "Casey Rivers (fictional)" }),
  ).toBeVisible();

  for (const category of ["general", "observation"]) {
    await page.getByRole("button", { name: "Add task", exact: true }).click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("Task title")
      .fill(
        category === "general"
          ? "Review fictional checklist"
          : "Record fictional temperature",
      );
    await dialog
      .getByLabel("Description", { exact: false })
      .fill("Complete description that remains available in task details.");
    await dialog
      .getByRole("combobox", { name: "Category", exact: true })
      .selectOption(category);
    await dialog
      .getByRole("combobox", { name: "Priority", exact: true })
      .selectOption("high");
    await dialog
      .getByLabel("Due date", { exact: false })
      .fill("2026-11-17T12:30");
    await dialog
      .getByRole("button", { name: "Create task", exact: true })
      .click();
    await expect(dialog).not.toBeVisible();
  }
  await page
    .getByRole("button", { name: /Review fictional checklist/ })
    .click();
  dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(
    "Complete description that remains available in task details.",
  );
  await dialog.getByRole("button", { name: "Edit task" }).click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Task title")
    .fill("Review edited fictional checklist");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await page
    .getByRole("button", { name: /Review edited fictional checklist/ })
    .click();
  await page.getByRole("button", { name: "Mark as completed" }).click();
  await expect(
    page.getByRole("button", {
      name: /Review edited fictional checklist.*Completed/,
    }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Record observation", exact: true })
    .click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Temperature (°C)", { exact: true }).fill("36.8");
  await dialog.getByRole("button", { name: "Save observation" }).click();
  await page.getByRole("button", { name: "Observations", exact: true }).click();
  await expect(page.getByText("36.8", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await expect(page.locator(".timeline")).toContainText(
    "Task completed: Review edited fictional checklist",
  );
  await expect(page.locator(".timeline")).toContainText(
    "Observation recorded: temperature 36.8",
  );

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Casey Rivers (fictional)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: /Review edited fictional checklist.*Completed/,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Observations", exact: true }).click();
  await expect(page.getByText("36.8", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  await page.getByRole("searchbox", { name: "Search tasks" }).fill("edited");
  await page.getByRole("button", { name: /Completed 1/ }).click();
  await expect(page.locator(".task-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: /Review edited fictional checklist/ })
    .click();
  await page.getByRole("button", { name: "Mark as pending" }).click();
  await expect(page.getByText("No matching tasks")).toBeVisible();

  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Overview" })
    .click();
  await expect(
    page
      .locator(".summary-card")
      .filter({ hasText: "Total patients" })
      .locator("strong"),
  ).toHaveText("4");
  await expect(
    page
      .locator(".summary-card")
      .filter({ hasText: "Pending tasks" })
      .locator("strong"),
  ).toHaveText("7");
  await expect(
    page
      .locator(".summary-card")
      .filter({ hasText: "Completed tasks" })
      .locator("strong"),
  ).toHaveText("0");

  for (const name of [
    "Patients",
    "Tasks",
    "Observations",
    "Activity",
    "Overview",
  ]) {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name, exact: true })
      .click();
    await expect(page.locator("main h1")).toHaveText(
      {
        Patients: "Patients",
        Tasks: "Task workspace",
        Observations: "Simulated observations",
        Activity: "Workspace activity",
        Overview: "Workspace overview",
      }[name]!,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator("main h1")).toHaveText("Workspace overview");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `docs/screenshots/${testInfo.project.name}-overview.png`,
    fullPage: true,
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Tasks", exact: true })
    .click();
  await page
    .getByRole("button", { name: /Review edited fictional checklist/ })
    .click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: /Review edited fictional checklist/ }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});

test("confirmed task and patient removal persists, cancelled removal preserves data", async ({
  page,
}) => {
  await page.goto("/#/patients/p-101");
  await page.getByRole("button", { name: /Review morning checklist/ }).click();
  await page.getByRole("button", { name: "Delete task" }).click();
  await page.getByRole("button", { name: "Keep record" }).click();
  await expect(
    page.getByRole("button", { name: /Review morning checklist/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Review morning checklist/ }).click();
  await page.getByRole("button", { name: "Delete task" }).click();
  await page.getByRole("button", { name: "Confirm removal" }).click();
  await expect(
    page.getByRole("button", { name: /Review morning checklist/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Remove patient" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "all associated tasks, observations and patient activity",
  );
  await page.getByRole("button", { name: "Confirm removal" }).click();
  await page.reload();
  await expect(page.locator(".patient-table tbody tr")).toHaveCount(2);
  await expect(
    page.getByText("Alex Morgan (fictional)", { exact: true }),
  ).toHaveCount(0);
});
