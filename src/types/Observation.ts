export type Observation = {
  id: string;
  patientId: string;
  kind: "temperature" | "heartRate";
  value: number;
  recordedAt: string;
};
