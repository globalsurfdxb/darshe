import { siteConfig } from "@/lib/site-config";

type EnquiryEmailData = {
  id: string;
  fullName: string;
  occupation: string;
  email: string;
  phone: string;
  roomPreference: string;
  moveInDate: string;
  lengthOfStay: string;
  message?: string | null;
  source?: string | null;
};

/** Strip control characters and collapse line breaks so user text cannot inject headers. */
function oneLine(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Keep line breaks in the message but drop other control characters. */
function multiLine(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

function buildEmail(e: EnquiryEmailData) {
  const name = oneLine(e.fullName);
  const lines = [
    "A new enquiry has been submitted on the DarShe website.",
    "",
    `Name:            ${name}`,
    `I am a:          ${oneLine(e.occupation)}`,
    `Email:           ${oneLine(e.email)}`,
    `Phone/WhatsApp:  ${oneLine(e.phone)}`,
    `Room preference: ${oneLine(e.roomPreference)}`,
    `Move-in date:    ${oneLine(e.moveInDate)}`,
    `Length of stay:  ${oneLine(e.lengthOfStay)}`,
    `Source:          ${e.source ? oneLine(e.source) : "-"}`,
    "",
    "Message:",
    e.message ? multiLine(e.message) : "(none)",
    "",
    `Reference: ${e.id}`,
  ];
  return { subject: `New DarShe enquiry: ${name}`, text: lines.join("\n") };
}

/**
 * Sends the notification when EMAIL_ENABLED=true. Never throws: a mail failure
 * must not fail the enquiry, which is already saved. Errors are logged.
 */
export async function sendEnquiryNotification(enquiry: EnquiryEmailData): Promise<void> {
  if (process.env.EMAIL_ENABLED !== "true") return;

  try {
    const to = process.env.DARSHE_EMAIL || siteConfig.email;
    const from = process.env.EMAIL_FROM || "DarShe <onboarding@resend.dev>";
    const { subject, text } = buildEmail(enquiry);
    const replyTo = oneLine(enquiry.email);

    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
      return;
    }

    if (process.env.SMTP_HOST) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
        connectionTimeout: 8000,
        socketTimeout: 8000,
      });
      await transporter.sendMail({ from, to, subject, text, replyTo });
      return;
    }

    console.error("[enquiries] EMAIL_ENABLED=true but neither RESEND_API_KEY nor SMTP_HOST is set.");
  } catch (error) {
    console.error("[enquiries] Failed to send notification email:", error);
  }
}
