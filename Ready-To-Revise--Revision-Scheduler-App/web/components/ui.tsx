import React from "react";

// Minimal cn that joins classname strings, filtering falsy values.
export function cn(...classes: (string | undefined | null)[]): string {
  return classes.filter((c) => c && typeof c === "string").join(" ");
}

/* ---------------- Button ---------------- */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  loading = false,
  loadingText = "Loading",
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const baseClasses = cn(
    "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-dark active:bg-brand-deep"
      : variant === "secondary"
      ? "bg-surface text-foreground hover:bg-muted active:bg-muted/80"
      : variant === "outline"
      ? "border border-brand text-brand hover:bg-brand/5 active:bg-brand/10"
      : variant === "danger"
      ? "bg-danger text-white hover:bg-danger/90 active:bg-danger/95"
      : "",
    size === "sm"
      ? "h-9 px-3 text-sm rounded-md"
      : size === "lg"
      ? "h-11 px-8 text-lg rounded-md"
      : "h-10 px-6 text-base rounded-md",
    "shadow-sm"
  );

  if (loading) {
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(baseClasses, "flex items-center justify-center gap-2")}
        {...rest}
      >
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-0"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.14V21.25a.75.75 0 001.5 0l3-2.14c1.865-1.114 3-3.896 3-7.938 0-2.133-.875-3.855-3-5.291z"
          />
        </svg>
        <span>{loadingText}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseClasses, "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2")}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Card ---------------- */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  shadow?: "soft" | "deep";
}

export function Card({
  children,
  shadow = "soft",
  className,
  ...rest
}: CardProps) {
  const shadowClass = cn(
    shadow === "soft" ? "shadow-soft" : "shadow-deep",
    "rounded-2xl"
  );

  return (
    <div
      className={cn("background-white dark:bg-surface shadow-card", shadowClass, className)}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ---------------- Input Field ---------------- */

export interface InputFieldProps extends React.LabelHTMLAttributes<HTMLInputElement> {
  type?: string;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function InputField({
  label,
  ...rest
}: Omit<InputFieldProps, "label"> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-sm font-medium mb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {label}
      </label>
      <input
        {...rest}
        className={cn(
          "w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm placeholder-muted/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
        {...rest}
      />
      {rest.error && (
        <p className="text-sm text-danger">{rest.error}</p>
      )}
    </div>
  );
}

/* ---------------- Badge ---------------- */

export function Badge({
  children,
  variant = "secondary",
  className,
}: { children: React.ReactNode; variant?: "secondary" | "danger" | "success"; className?: string }) {
  const variants = {
    secondary: "bg-muted text-foreground",
    danger: "bg-danger/10 text-danger border border-danger",
    success: "bg-success/10 text-success border border-success",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

/* ---------------- Status Chip ---------------- */

export function StatusChip({
  status,
  className,
}: { status: "UPLOADED" | "ANALYZING" | "READY" | "FAILED"; className?: string }) {
  const statuses = {
    UPLOADED: { bg: "bg-brand/5", text: "Brand", border: "border-brand" },
    ANALYZING: { bg: "bg-muted/5", text: "Muted", border: "border-muted" },
    READY: { bg: "bg-success/5", text: "Success", border: "border-success" },
    FAILED: { bg: "bg-danger/5", text: "Danger", border: "border-danger" },
  };

  const s = statuses[status] || statuses.UPLOADED;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        `bg-${s.bg} text-${s.text} border-${s.border}`
      )}
    >
      {status}
    </span>
  );
}

/* ---------------- Spinner ---------------- */

export function Spinner({
  className,
  size = "sm",
}: { className?: string; size?: "sm" | "md" }) {
  const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6" };
  return (
    <svg
      className={cn("animate-spin", sizeMap[size], className)}
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-0"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.14V21.25a.75.75 0 001.5 0l3-2.14c1.865-1.114 3-3.896 3-7.938 0-2.133-.875-3.855-3-5.291z"
      />
    </svg>
  );
}

/* ---------------- EmptyState ---------------- */

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("text-center py-16 text-muted", className)}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/* ---------------- StatTile ---------------- */

export function StatTile({
  label,
  value,
  subtitle,
  icon,
  action,
  actionLabel,
  className,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  action?: () => void;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("p-6 rounded-2xl border border-border transition-colors hover:border-brand/20", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon}
            <span className="text-sm font-medium">{label}</span>
          </div>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="text-right">
          <p className="text-xl font-medium">{value}</p>
        </div>
      </div>
      {action && (
        <Button
          onClick={action}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          {actionLabel || "View"}
        </Button>
      )}
    </div>
  );
}

/* ---------------- useConfirm ---------------- */

export function useConfirm(
  text: string,
  onConfirm: () => void,
  onCancel?: () => void,
) {
  const confirmed = React.useRef(false);

  React.useEffect(() => {
    if (confirmed.current) {
      const result = window.confirm(text);
      if (result) {
        onConfirm();
      } else if (onCancel) {
        onCancel();
      }
      confirmed.current = false;
    }
  }, [onConfirm, onCancel]);

  return {
    confirm: () => {
      confirmed.current = true;
    },
  };
}

/* ---------------- Toast ---------------- */

let toastIdCounter = 0;

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      const data = e.data;
      if (typeof data === "object" && data.type === "toast") {
        setToasts((prev) => {
          const index = prev.findIndex((t) => t.id === data.id);
          if (index >= 0) {
            return prev.filter((_, i) => i !== index);
          }
          return [...prev, data];
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const toast = React.useCallback(
    (options: Omit<Toast, "id"> & { duration?: number }) => {
      const id = `${++toastIdCounter}_${Date.now()}`;
      const toast: Toast = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant,
        duration: options.duration ?? 5000,
      };
      setToasts((prev) => [...prev, toast]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration!);

      return () => clearTimeout(timer);
    },
    [setToasts],
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, [setToasts]);

  return { toasts, toast, dismiss };
}

/* ---------------- ToastProvider ---------------- */

export function ToastProvider({
  children,
}: { children: React.ReactNode }) {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 space-y-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "background-surface border border-rounded-xl p-4 shadow-soft max-w-md flex items-start gap-3 opacity-0 animate-in fade-up-0",
            "data-[state=closed]:animate-out fade-out-0"
          )}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground">{toast.title}</h3>
            {toast.description && (
              <p className="mt-1 text-sm text-muted/80 line-clamp-2">
                {toast.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}