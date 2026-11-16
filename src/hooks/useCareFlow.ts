import { useRef, useState } from "react";
import type { Action } from "../types/Action";
import { applyAction } from "../logic/applyAction";
import { loadCareFlowData } from "../storage/loadCareFlowData";
import { saveCareFlowData } from "../storage/saveCareFlowData";

export function useCareFlow() {
  const [loaded, setLoaded] = useState(loadCareFlowData);
  const current = useRef(loaded);
  const [feedback, setFeedback] = useState({
    message: loaded.message,
    error: false,
  });
  return {
    data: loaded.data,
    feedback,
    loadError: loaded.data === null ? loaded.message : null,
    dispatch: (action: Action): string | null => {
      try {
        if (!current.current.data)
          throw new Error(
            "Resolve the storage recovery issue before making changes.",
          );
        const result = applyAction(current.current.data, action);
        const revision = saveCareFlowData(
          result.data,
          current.current.revision,
        );
        const next = { data: result.data, revision, message: result.message };
        current.current = next;
        setLoaded(next);
        setFeedback({
          message: `${result.message}. Saved on this device.`,
          error: false,
        });
        return result.entityId;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Could not apply this change.";
        setFeedback({ message, error: true });
        throw new Error(message, { cause: error });
      }
    },
  };
}
