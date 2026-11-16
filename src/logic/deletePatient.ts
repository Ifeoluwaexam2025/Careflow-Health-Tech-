import type { CareFlowData } from "../types/CareFlowData";

export function deletePatient(data: CareFlowData, id: string): CareFlowData {
  return {
    ...data,
    patients: data.patients.filter((patient) => patient.id !== id),
    tasks: data.tasks.filter((task) => task.patientId !== id),
    observations: data.observations.filter(
      (observation) => observation.patientId !== id,
    ),
    activity: data.activity.filter((event) => event.patientId !== id),
  };
}
