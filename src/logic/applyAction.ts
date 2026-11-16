import type { CareFlowData } from "../types/CareFlowData";
import type { Action } from "../types/Action";
import { createPatient } from "./createPatient";
import { updatePatient } from "./updatePatient";
import { deletePatient } from "./deletePatient";
import { selectTaskFactory } from "./selectTaskFactory";
import { updateTask } from "./updateTask";
import { deleteTask } from "./deleteTask";
import { toggleTaskStatus } from "./toggleTaskStatus";
import { createObservation } from "./createObservation";
import { createActivityEvent } from "./createActivityEvent";

export function applyAction(data: CareFlowData, action: Action) {
  let next = data;
  let patientId: string | null = null;
  let entityId: string | null = null;
  let message = "";
  switch (action.type) {
    case "patient.create": {
      const patient = createPatient(action.input);
      patientId = entityId = patient.id;
      next = { ...data, patients: [...data.patients, patient] };
      message = `Patient added: ${patient.name}`;
      break;
    }
    case "patient.update": {
      const patient = data.patients.find((item) => item.id === action.id);
      if (!patient) throw new Error("Patient no longer exists.");
      const updated = updatePatient(patient, action.input);
      patientId = entityId = patient.id;
      next = {
        ...data,
        patients: data.patients.map((item) =>
          item.id === patient.id ? updated : item,
        ),
      };
      message = `Patient updated: ${updated.name}`;
      break;
    }
    case "patient.delete": {
      const patient = data.patients.find((item) => item.id === action.id);
      if (!patient) throw new Error("Patient no longer exists.");
      next = deletePatient(data, action.id);
      message = `Patient removed: ${patient.name}. Associated tasks, observations and patient activity removed.`;
      break;
    }
    case "task.create": {
      if (!data.patients.some((item) => item.id === action.input.patientId))
        throw new Error("Select an existing patient.");
      const task = selectTaskFactory(action.input.category).createTask(
        action.input,
      );
      patientId = task.patientId;
      entityId = task.id;
      next = { ...data, tasks: [...data.tasks, task] };
      message = `Task created: ${task.title}`;
      break;
    }
    case "task.update":
    case "task.toggle":
    case "task.delete": {
      const task = data.tasks.find((item) => item.id === action.id);
      if (!task) throw new Error("Task no longer exists.");
      patientId = task.patientId;
      entityId = task.id;
      if (action.type === "task.delete") {
        next = { ...data, tasks: deleteTask(data.tasks, task.id) };
        message = `Task deleted: ${task.title}`;
      } else {
        const updated =
          action.type === "task.update"
            ? updateTask(task, action.input)
            : toggleTaskStatus(task);
        next = {
          ...data,
          tasks: data.tasks.map((item) =>
            item.id === task.id ? updated : item,
          ),
        };
        message =
          action.type === "task.update"
            ? `Task updated: ${updated.title}`
            : `Task ${updated.status === "completed" ? "completed" : "reopened"}: ${task.title}`;
      }
      break;
    }
    case "observation.create": {
      if (!data.patients.some((item) => item.id === action.patientId))
        throw new Error("Select an existing patient.");
      const observation = createObservation(
        action.patientId,
        action.kind,
        action.value,
      );
      patientId = observation.patientId;
      entityId = observation.id;
      next = { ...data, observations: [...data.observations, observation] };
      message = `Observation recorded: ${observation.kind === "temperature" ? "temperature" : "heart rate"} ${observation.value} ${observation.kind === "temperature" ? "°C" : "bpm"}`;
      break;
    }
    case "observation.delete": {
      const observation = data.observations.find(
        (item) => item.id === action.id,
      );
      if (!observation) throw new Error("Observation no longer exists.");
      patientId = observation.patientId;
      next = {
        ...data,
        observations: data.observations.filter((item) => item.id !== action.id),
      };
      message = `Observation removed: ${observation.kind === "temperature" ? "temperature" : "heart rate"}`;
      break;
    }
  }
  return {
    data: {
      ...next,
      activity: [...next.activity, createActivityEvent(patientId, message)],
    },
    message,
    entityId,
  };
}
