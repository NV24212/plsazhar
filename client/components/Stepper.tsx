import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";

export type StepProps = {
  children: React.ReactNode;
};

export const Step: React.FC<StepProps> = ({ children }) => {
  return <div className="stepper-step">{children}</div>;
};

export type StepperProps = {
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  onNext?: () => boolean; // return false to block advancing
  isSubmitting?: boolean;
  isFormValid?: boolean;
  dir?: "rtl" | "ltr";
  children: React.ReactNode;
};

function toArray(children: React.ReactNode): React.ReactElement[] {
  const arr: React.ReactElement[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) arr.push(child as React.ReactElement);
  });
  return arr;
}

const Stepper: React.FC<StepperProps> = ({
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = "Back",
  nextButtonText = "Next",
  onNext,
  isSubmitting = false,
  isFormValid = true,
  dir = "ltr",
  children,
}) => {
  const steps = useMemo(() => toArray(children), [children]);
  const total = steps.length;

  const [step, setStep] = useState<number>(() => {
    const s = Math.min(Math.max(initialStep, 1), Math.max(total, 1));
    return s;
  });

  useEffect(() => {
    const s = Math.min(Math.max(initialStep, 1), Math.max(total, 1));
    setStep(s);
  }, [initialStep, total]);

  const goTo = useCallback(
    (next: number) => {
      const bounded = Math.min(Math.max(next, 1), total);
      setStep(bounded);
      onStepChange?.(bounded);
    },
    [onStepChange, total],
  );

  const canGoBack = step > 1 && !isSubmitting;
  const isLast = step >= total;

  const handleNext = useCallback(() => {
    if (isSubmitting) return;
    if (!isLast) {
      if (onNext && onNext() === false) return;
      goTo(step + 1);
      return;
    }
    if (isLast) {
      if (!isFormValid) return;
      onFinalStepCompleted?.();
    }
  }, [isSubmitting, isLast, onNext, goTo, step, onFinalStepCompleted, isFormValid]);

  const handleBack = useCallback(() => {
    if (!canGoBack) return;
    goTo(step - 1);
  }, [canGoBack, goTo, step]);

  return (
    <div className="stepper" dir={dir}>
      <div className="stepper-indicator">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <div key={n} className={`stepper-dot ${active ? "active" : ""} ${done ? "done" : ""}`} aria-current={active ? "step" : undefined} />
          );
        })}
      </div>

      <div className="stepper-content">
        {steps.map((child, idx) => (
          <div key={idx} className={idx + 1 === step ? "block" : "hidden"}>
            {child}
          </div>
        ))}
      </div>

      <div className="stepper-actions">
        <Button type="button" variant="outline" onClick={handleBack} disabled={!canGoBack} className="h-10">
          {backButtonText}
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting || (isLast ? !isFormValid : false)}
          className="h-10"
        >
          {isLast ? nextButtonText || "Submit" : nextButtonText}
        </Button>
      </div>
    </div>
  );
};

export default Stepper;
