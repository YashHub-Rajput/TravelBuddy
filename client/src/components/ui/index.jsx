// File: client/src/components/ui/Spinner.jsx
export function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-4 h-4 border-2", md: "w-7 h-7 border-3", lg: "w-10 h-10 border-4" };
  return (
    <div className={`${sizes[size]} border-coral/30 border-t-coral rounded-full animate-spin ${className}`} />
  );
}

// File: client/src/components/ui/PageLoader.jsx
export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-coral/30 border-t-coral rounded-full animate-spin" />
        <p className="text-ink/40 text-sm">Loading…</p>
      </div>
    </div>
  );
}

// File: client/src/components/ui/EmptyState.jsx
export function EmptyState({ icon = "📭", title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4 animate-float">{icon}</div>
      <h3 className="font-display font-bold text-xl text-ink mb-2">{title}</h3>
      {subtitle && <p className="text-ink/50 text-sm max-w-xs">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// File: client/src/components/ui/Alert.jsx
export function Alert({ type = "error", message }) {
  if (!message) return null;
  const styles = {
    error:   "bg-coral/8 border-coral/25 text-coral",
    success: "bg-teal/8 border-teal/25 text-teal",
    warning: "bg-gold/15 border-gold/30 text-gold-dark",
  };
  const icons = { error: "⚠️", success: "✓", warning: "⚡" };
  return (
    <div className={`flex items-start gap-2.5 border px-4 py-3 rounded-2xl text-sm font-medium ${styles[type]}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
}

// File: client/src/components/ui/StatusBadge.jsx
export function StatusBadge({ status }) {
  const map = {
    planning:  "bg-gold/15 text-gold-dark",
    active:    "bg-teal/15 text-teal-dark",
    completed: "bg-mist-dark/40 text-ink/50",
    cancelled: "bg-coral/10 text-coral",
    pending:   "bg-gold/15 text-gold-dark",
    accepted:  "bg-teal/15 text-teal",
    rejected:  "bg-coral/10 text-coral",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${map[status] || map.planning}`}>
      {status}
    </span>
  );
}
