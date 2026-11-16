import type { CareFlowData } from "./CareFlowData";

export type ActionChange = {
  data: CareFlowData;
  patientId: string | null;
  entityId: string | null;
  message: string;
};
