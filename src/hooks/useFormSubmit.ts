import { useRef, useState } from "react";
import type { FormEvent } from "react";

export function useFormSubmit(operation: () => void) {
  const locked = useRef(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return {
    error,
    submitting,
    submit: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (locked.current) return;
      locked.current = true;
      setSubmitting(true);
      setError("");
      try {
        operation();
      } catch (failure) {
        locked.current = false;
        setSubmitting(false);
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not save this change.",
        );
      }
    },
  };
}
