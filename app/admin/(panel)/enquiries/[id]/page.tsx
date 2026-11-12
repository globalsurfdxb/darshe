import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge, statusLabels } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { STATUSES } from "@/lib/enquiry-queries";
import { formatDate, formatDubai, whatsappUrl } from "@/lib/format";
import { StatusSelect } from "./StatusSelect";

export const dynamic = "force-dynamic";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-4 last:border-0 sm:grid-cols-[200px_1fr] sm:gap-6">
      <dt className="text-sm font-medium text-body-muted">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const enquiry = await db.enquiry.findUnique({ where: { id } });
  if (!enquiry) notFound();

  const wa = whatsappUrl(enquiry.phone);
  const link = "font-medium text-terracotta-dark underline underline-offset-4 hover:no-underline";

  return (
    <>
      <Link href="/admin/enquiries" className="text-sm font-medium text-body-muted hover:text-terracotta-dark">
        ← All enquiries
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl sm:text-4xl">{enquiry.fullName}</h1>
        <StatusBadge status={enquiry.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <dl className="rounded-2xl border border-line bg-card px-6 py-2">
          <Row label="Received (Dubai)">{formatDubai(enquiry.createdAt)}</Row>
          <Row label="Occupation">{enquiry.occupation}</Row>
          <Row label="Email">
            <a href={`mailto:${enquiry.email}`} className={link}>
              {enquiry.email}
            </a>
          </Row>
          <Row label="Phone / WhatsApp">
            <span className="mr-3">{enquiry.phone}</span>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={link}>
                Open in WhatsApp
              </a>
            )}
          </Row>
          <Row label="Room preference">{enquiry.roomPreference}</Row>
          <Row label="Preferred move-in">{formatDate(enquiry.moveInDate)}</Row>
          <Row label="Length of stay">{enquiry.lengthOfStay}</Row>
          <Row label="Message">
            {enquiry.message ? (
              <span className="whitespace-pre-wrap break-words">{enquiry.message}</span>
            ) : (
              <span className="text-body-muted">No message</span>
            )}
          </Row>
          <Row label="Consent to be contacted">{enquiry.consent ? "Yes" : "No"}</Row>
          <Row label="Source">{enquiry.source ?? <span className="text-body-muted">Direct / not set</span>}</Row>
          <Row label="Reference">
            <code className="text-sm">{enquiry.id}</code>
          </Row>
        </dl>

        <aside className="rounded-2xl border border-line bg-card p-6">
          <StatusSelect
            id={enquiry.id}
            current={enquiry.status}
            options={STATUSES.map((s) => ({ value: s, label: statusLabels[s] }))}
          />
          <div className="mt-6 flex flex-col gap-3">
            <a href={`mailto:${enquiry.email}`} className="btn-primary !py-2.5 text-sm">
              Reply by email
            </a>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-outline !py-2.5 text-sm">
                Message on WhatsApp
              </a>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
