// File: client/src/utils/helpers.js
import { format, formatDistanceToNow } from "date-fns";

/** Format date as "Jan 15, 2025" */
export const fmtDate = (d) => format(new Date(d), "MMM d, yyyy");

/** Format date as "Jan 15" */
export const fmtDateShort = (d) => format(new Date(d), "MMM d");

/** Format as relative time: "2 hours ago" */
export const fmtRelative = (d) => formatDistanceToNow(new Date(d), { addSuffix: true });

/** Format as time: "3:45 PM" */
export const fmtTime = (d) => format(new Date(d), "h:mm a");

/** Get initials from a name: "John Doe" → "JD" */
export const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

/** Format currency: 2500 → "$2,500" */
export const fmtCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

/** Truncate long text */
export const truncate = (str, max = 80) =>
  str && str.length > max ? str.slice(0, max) + "…" : str;

/** Score color: green=high, yellow=mid, red=low */
export const scoreColor = (score) => {
  if (score >= 70) return { text: "text-teal", bg: "bg-teal", ring: "#1A936F" };
  if (score >= 40) return { text: "text-gold-dark", bg: "bg-gold", ring: "#E0A800" };
  return { text: "text-coral", bg: "bg-coral", ring: "#FF6B6B" };
};

/** Calculate trip duration in days */
export const tripDuration = (start, end) =>
  Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

/** Status color mapping for trip status badges */
export const statusColors = {
  planning:  "bg-gold/15 text-gold-dark",
  active:    "bg-teal/15 text-teal",
  completed: "bg-mist text-ink/50",
  cancelled: "bg-coral/10 text-coral",
};
