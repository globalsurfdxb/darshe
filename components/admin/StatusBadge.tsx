import type { EnquiryStatus } from "@prisma/client";

const styles: Record<EnquiryStatus, string> = {
  NEW: "bg-terracotta text-card",
  CONTACTED: "bg-olive text-card",
  CLOSED: "bg-line text-espresso",
};

const labels: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export const statusLabels = labels;
