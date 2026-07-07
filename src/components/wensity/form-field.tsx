"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const wensityCardSurfaceClass = cn(
  "relative isolate overflow-hidden rounded-2xl",
  "border border-black/[0.08] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#ffffff_0%,#f4f4f5_72%)] [box-shadow:0_1px_2px_rgba(0,0,0,.06),0_8px_24px_-12px_rgba(0,0,0,.08)]",
  "dark:border-white/[0.06] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,#15151b_0%,#0a0a0b_72%)] dark:[box-shadow:0_1px_2px_rgba(0,0,0,.4),0_8px_24px_-12px_rgba(0,0,0,.6)]",
);

export type FormFieldLayout = "stack" | "inline" | "split" | "card";
export type FormFieldDensity = "sm" | "md" | "lg";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  layout?: FormFieldLayout;
  density?: FormFieldDensity;
  children: React.ReactNode;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

export interface FormFieldContextValue {
  controlId: string;
  descriptionId?: string;
  errorId?: string;
  describedBy?: string;
  invalid: boolean;
  required?: boolean;
}

export interface FormFieldControlProps
  extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export interface FormFieldLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export interface FormFieldDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface FormFieldErrorProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export interface FormSectionProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  divided?: boolean;
}

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "right" | "between";
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

const layoutClasses: Record<FormFieldLayout, string> = {
  stack: "flex flex-col",
  inline:
    "grid items-start gap-x-5 sm:grid-cols-[minmax(8rem,0.42fr)_minmax(0,1fr)]",
  split:
    "grid items-start gap-x-6 sm:grid-cols-[minmax(10rem,0.5fr)_minmax(0,1fr)]",
  card: wensityCardSurfaceClass,
};

const densityGap: Record<FormFieldDensity, string> = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2.5",
};

const cardPadding: Record<FormFieldDensity, string> = {
  sm: "p-3.5",
  md: "p-4",
  lg: "p-5",
};

function useFormFieldContext(component: string) {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error(`${component} must be used inside FormField.`);
  }
  return context;
}

function FieldLabelMarker({
  required,
  optional,
}: {
  required?: boolean;
  optional?: boolean;
}) {
  if (required) {
    return (
      <span aria-hidden="true" className="ml-1 text-red-600 dark:text-red-400">
        *
      </span>
    );
  }

  if (optional) {
    return (
      <span className="ml-2 text-[11px] font-medium text-[var(--muted-foreground)]">
        Optional
      </span>
    );
  }

  return null;
}

export function FormField({
  id,
  label,
  description,
  error,
  required,
  optional,
  layout = "stack",
  density = "md",
  children,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName,
  ...props
}: FormFieldProps) {
  const reactId = React.useId();
  const controlId = id ?? `wensity-field-${reactId}`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [errorId, descriptionId].filter(Boolean).join(" ") || undefined;

  const context = React.useMemo<FormFieldContextValue>(
    () => ({
      controlId,
      descriptionId,
      errorId,
      describedBy,
      invalid: Boolean(error),
      required,
    }),
    [controlId, describedBy, descriptionId, errorId, error, required],
  );

  const meta = label || description ? (
    <div className={cn("min-w-0", layout !== "stack" && "pt-1")}>
      {label ? (
        <FormFieldLabel
          required={required}
          optional={optional}
          className={labelClassName}
        >
          {label}
        </FormFieldLabel>
      ) : null}
      {description ? (
        <FormFieldDescription className={descriptionClassName}>
          {description}
        </FormFieldDescription>
      ) : null}
    </div>
  ) : null;

  const control = (
    <div className="min-w-0">
      {children}
      {error ? (
        <FormFieldError className={errorClassName}>{error}</FormFieldError>
      ) : null}
    </div>
  );

  return (
    <FormFieldContext.Provider value={context}>
      <div
        data-slot="form-field"
        data-layout={layout}
        data-invalid={error ? "" : undefined}
        className={cn(
          layoutClasses[layout],
          densityGap[density],
          layout === "card" && cardPadding[density],
          className,
        )}
        {...props}
      >
        {layout === "stack" || layout === "card" ? (
          <>
            {meta}
            {control}
          </>
        ) : (
          <>
            {meta}
            {control}
          </>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}

export function FormFieldControl({
  asChild = false,
  className,
  ...props
}: FormFieldControlProps) {
  const context = useFormFieldContext("FormFieldControl");
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      id={context.controlId}
      aria-describedby={context.describedBy}
      aria-invalid={context.invalid || undefined}
      aria-required={context.required || undefined}
      className={className}
      {...props}
    />
  );
}

export function FormFieldLabel({
  required,
  optional,
  className,
  children,
  ...props
}: FormFieldLabelProps) {
  const context = useFormFieldContext("FormFieldLabel");

  return (
    <label
      htmlFor={context.controlId}
      className={cn(
        "block text-[13px] font-medium leading-none tracking-[-0.01em] text-[var(--foreground)]",
        className,
      )}
      {...props}
    >
      {children}
      <FieldLabelMarker
        required={required ?? context.required}
        optional={optional}
      />
    </label>
  );
}

export function FormFieldDescription({
  className,
  ...props
}: FormFieldDescriptionProps) {
  const context = useFormFieldContext("FormFieldDescription");

  return (
    <p
      id={context.descriptionId}
      className={cn(
        "mt-1.5 text-[12px] leading-[1.45] text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function FormFieldError({ className, ...props }: FormFieldErrorProps) {
  const context = useFormFieldContext("FormFieldError");

  return (
    <p
      id={context.errorId}
      className={cn(
        "mt-1.5 text-[12px] leading-[1.45] font-medium text-red-600 dark:text-red-400",
        className,
      )}
      {...props}
    />
  );
}

export function FormSection({
  title,
  description,
  actions,
  divided = false,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <section
      className={cn(
        wensityCardSurfaceClass,
        className,
      )}
      {...props}
    >
      {title || description || actions ? (
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-sm font-semibold tracking-[-0.015em] text-[var(--foreground)]">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-[12px] leading-[1.45] text-[var(--muted-foreground)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}
      <div
        className={cn(
          "p-5",
          divided &&
            "[&>[data-slot=form-field]]:border-b [&>[data-slot=form-field]]:border-[var(--border)] [&>[data-slot=form-field]]:py-4 [&>[data-slot=form-field]:first-child]:pt-0 [&>[data-slot=form-field]:last-child]:border-b-0 [&>[data-slot=form-field]:last-child]:pb-0",
          !divided && "space-y-4",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function FormActions({
  align = "right",
  className,
  ...props
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2",
        align === "left" && "justify-start",
        align === "right" && "justify-end",
        align === "between" && "justify-between",
        className,
      )}
      {...props}
    />
  );
}
