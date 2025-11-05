"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";
import { Button } from "./Button";

export interface StepProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  stepNumber: number;
}

/**
 * Individual step in the stepper form
 */
export function Step({ 
  title, 
  description, 
  isActive = false, 
  isCompleted = false, 
  stepNumber,
  className,
  children 
}: StepProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
          isActive && "bg-saffron text-white",
          isCompleted && "bg-green-600 text-white",
          !isActive && !isCompleted && "bg-gray-200 text-gray-600"
        )}>
          {isCompleted ? (
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            stepNumber
          )}
        </div>
        <div>
          <h3 className={cn(
            "text-sm font-medium",
            isActive && "text-saffron",
            !isActive && !isCompleted && "text-gray-600"
          )}>
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      
      {/* Step content - only show if active */}
      {isActive && (
        <div className="pl-9">
          {children}
        </div>
      )}
    </div>
  );
}

export interface StepFormProps extends HTMLAttributes<HTMLDivElement> {
  steps: StepProps[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSubmit?: () => void;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

/**
 * Stepper form component
 */
export function StepForm({ 
  steps, 
  currentStep, 
  onStepChange,
  onNext,
  onPrev,
  onSubmit,
  isLastStep = false,
  isSubmitting = false,
  className 
}: StepFormProps) {
  const total = steps.length;
  const progress = Math.min(100, Math.max(0, Math.round(((currentStep + 1) / Math.max(1, total)) * 100)));
  return (
    <div className={cn("bg-white rounded-2xl p-5 shadow-sm", className)}>
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">Step {currentStep + 1} of {total}</span>
          <span className="text-xs text-slate-500">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-sandstone/20 overflow-hidden">
          <div
            className="h-full bg-saffron transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {/* Progress steps */}
      <div className="space-y-4 mb-6">
        {steps.map((step, index) => (
          <Step
            key={index}
            {...step}
            isActive={index === currentStep}
            isCompleted={index < currentStep}
          >
            {step.children}
          </Step>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrev}
          disabled={currentStep === 0}
          className={currentStep === 0 ? "opacity-0 cursor-default" : ""}
        >
          Back
        </Button>
        {isLastStep ? (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="ml-auto"
            onClick={onSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit Profile"}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            className="ml-auto"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
