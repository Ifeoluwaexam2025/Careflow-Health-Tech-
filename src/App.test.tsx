import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { STORAGE_KEY } from "./storage/storageKeys";

beforeEach(() => {
  localStorage.clear();
  window.location.hash = "/overview";
});

describe("CareFlow interactions", () => {
  it("creates a patient, creates and edits a task, completes it, records an observation and restores on remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getAllByRole("button", { name: "Add patient" })[0]);
    let dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Fictional patient name"),
      "Casey Rivers (fictional)",
    );
    await user.type(within(dialog).getByLabelText("Room"), "104");
    await user.click(
      within(dialog).getByRole("button", { name: "Save patient" }),
    );
    await screen.findByRole("heading", { name: "Casey Rivers (fictional)" });

    await user.click(screen.getByRole("button", { name: "Add task" }));
    dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Task title"),
      "Review fictional checklist",
    );
    await user.type(
      within(dialog).getByLabelText(/Description/),
      "Full description for the demonstration",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Create task" }),
    );
    await user.click(
      screen.getByRole("button", { name: /Review fictional checklist/ }),
    );
    dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Full description for the demonstration"),
    ).toBeVisible();
    await user.click(within(dialog).getByRole("button", { name: "Edit task" }));
    dialog = screen.getByRole("dialog");
    await user.selectOptions(
      within(dialog).getByLabelText("Category"),
      "observation",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Save changes" }),
    );
    await user.click(
      screen.getByRole("button", { name: /Review fictional checklist/ }),
    );
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Mark as completed",
      }),
    );
    expect(
      screen.getByRole("button", {
        name: /Review fictional checklist.*Completed/,
      }),
    ).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Record observation" }),
    );
    dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText("Temperature (°C)"), "36.8");
    await user.click(
      within(dialog).getByRole("button", { name: "Save observation" }),
    );
    await user.click(screen.getByRole("button", { name: "Observations" }));
    expect(screen.getByText("36.8")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Activity" }));
    expect(
      screen.getByText(/Task completed: Review fictional checklist/),
    ).toBeVisible();
    expect(
      screen.getByText("Observation recorded: temperature 36.8 °C", {
        exact: true,
      }),
    ).toBeVisible();
    unmount();
    render(<App />);
    await screen.findByRole("heading", { name: "Casey Rivers (fictional)" });
    expect(
      screen.getByRole("button", {
        name: /Review fictional checklist.*Completed/,
      }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Observations" }));
    expect(screen.getByText("36.8")).toBeVisible();
  });

  it("keeps a failed patient save open and does not add a patient", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole("button", { name: "Add patient" })[0]);
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Fictional patient name"),
      "Unsaved fictional person",
    );
    await user.type(within(dialog).getByLabelText("Room"), "110");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota");
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Save patient" }),
    );
    expect(dialog).toBeVisible();
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "No changes were applied",
    );
    expect(
      within(dialog).getByRole("button", { name: "Save patient" }),
    ).toBeEnabled();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("prevents duplicate form submissions and exposes search empty states", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getAllByRole("button", { name: "Add patient" })[0]);
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Fictional patient name"),
      "One fictional patient",
    );
    await user.type(within(dialog).getByLabelText("Room"), "109");
    const form = within(dialog).getByLabelText("Room").closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    await screen.findByRole("heading", { name: "One fictional patient" });
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(
      saved.data.patients.filter(
        (patient: { name: string }) => patient.name === "One fictional patient",
      ),
    ).toHaveLength(1);
    await user.click(screen.getByRole("link", { name: "All patients" }));
    await user.type(
      await screen.findByRole("searchbox", {
        name: "Search patients or rooms",
      }),
      "no-such-patient",
    );
    expect(screen.getByText("No patients found")).toBeVisible();
  });

  it("requires confirmation for removal and preserves a cancelled record", async () => {
    window.location.hash = "/patients/p-101";
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Remove patient" }));
    expect(screen.getByRole("dialog")).toHaveTextContent(
      "all associated tasks, observations and patient activity",
    );
    await user.click(screen.getByRole("button", { name: "Keep record" }));
    expect(
      screen.getByRole("heading", { name: "Alex Morgan (fictional)" }),
    ).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Remove patient" }));
    await user.click(screen.getByRole("button", { name: "Confirm removal" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Alex Morgan (fictional)" }),
      ).not.toBeInTheDocument(),
    );
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(
      saved.data.tasks.every(
        (task: { patientId: string }) => task.patientId !== "p-101",
      ),
    ).toBe(true);
  });

  it("shows recovery rather than overwriting malformed data", () => {
    localStorage.setItem(STORAGE_KEY, "{damaged");
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Your existing data is protected" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Add patient" }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{damaged");
  });
});
