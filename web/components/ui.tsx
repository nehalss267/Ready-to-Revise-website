"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Brain,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
} from "lucide-react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------- Logo ---------------------------------- */

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 font-semibold tracking-tight text-slate-900",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
        <Brain className="size-5" strokeWidth={2.2} />
      </span>
      <span className="text-lg">
        Ready<span className="text-brand-600">To</span>Revise
      </span>
    </Link>
  );
}

/* --------------------------------- Spinner -------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle className={cn("size-4 animate-spin", className)} strokeWidth={2.4} />
  );
}

/* --------------------------------- Button --------------------------------- */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-soft hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-400",
  secondary:
    "bg-slate-900 text-white shadow-soft hover:bg-slate-800 focus-visible:outline-slate-900",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2 rounded-xl px-6 text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

const buttonClasses = (
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
) =>
  cn(
    "inline-flex select-none items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-70",
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );

export type ButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}

/* ---------------------------- Field primitives ---------------------------- */

type FieldContextValue = { id: string; describedBy?: string; invalid?: boolean };
const FieldContext = createContext<FieldContextValue | null>(null);

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: !!error }}>
      <label className="block" htmlFor={id}>
        {label && (
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </span>
        )}
        {children}
        {error ? (
          <span id={describedBy} className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <CircleAlert className="size-3.5" /> {error}
          </span>
        ) : hint ? (
          <span id={describedBy} className="mt-1.5 block text-xs text-slate-500">
            {hint}
          </span>
        ) : null}
      </label>
    </FieldContext.Provider>
  );
}

const baseInput =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-2 focus:-outline-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const field = useContext(FieldContext);
  return (
    <input
      id={field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || props["aria-invalid"]}
      className={cn(
        baseInput,
        field?.invalid
          ? "border-red-300 focus:outline-red-500"
          : "border-slate-200 focus:outline-brand-500 hover:border-slate-300",
        className,
      )}
      {...props}
    />
  );
}

export function PasswordInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

/* ---------------------------------- Alert --------------------------------- */

type AlertVariant = "error" | "success" | "info";

const alertVariants: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-brand-200 bg-brand-50 text-brand-800",
};

const alertIcons: Record<AlertVariant, ReactNode> = {
  error: <CircleAlert className="size-4 shrink-0" />,
  success: <CircleCheck className="size-4 shrink-0" />,
  info: <Info className="size-4 shrink-0" />,
};

export function Alert({
  variant = "info",
  children,
  className,
}: {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm",
        alertVariants[variant],
        className,
      )}
    >
      {alertIcons[variant]}
      <span className="leading-snug">{children}</span>
    </div>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------- AuthShell ------------------------------- */

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-brand-100/70 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-200/50 via-transparent to-transparent blur-3xl"
      />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Logo />
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        <Card className="p-6 sm:p-8">{children}</Card>

        {footer && (
          <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>
        )}
      </div>
    </div>
  );
}
