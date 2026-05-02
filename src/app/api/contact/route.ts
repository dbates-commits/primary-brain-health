import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM_ADDRESS } from "@/lib/email";

interface ContactBody {
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value?: string) {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px;font-weight:600;background:#f5f3ee;width:160px">${escapeHtml(
    label
  )}</td><td style="padding:6px 12px">${escapeHtml(value)}</td></tr>`;
}

function buildEmail(body: ContactBody) {
  const subject = `New contact form submission — ${body.fullName || "Unknown"}`;
  const text =
    `New message from the contact form\n\n` +
    `Name: ${body.fullName || "—"}\n` +
    `Email: ${body.email || "—"}\n` +
    `Phone: ${body.phone || "—"}\n\n` +
    `Message:\n${body.message || "—"}\n`;
  const html = `
    <div style="font-family:system-ui,sans-serif;color:#1b1c19">
      <h2 style="margin:0 0 16px">New contact form submission</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px;margin-bottom:16px">
        ${row("Name", body.fullName)}
        ${row("Email", body.email)}
        ${row("Phone", body.phone)}
      </table>
      <h3 style="margin:24px 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:0.08em;color:#44474d">Message</h3>
      <div style="white-space:pre-wrap;line-height:1.5">${escapeHtml(
        body.message || ""
      )}</div>
    </div>
  `;
  return { subject, text, html };
}

export async function POST(request: NextRequest) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_ADDRESS;
  if (!to) {
    console.warn(
      "[contact] CONTACT_TO_ADDRESS not set — contact submission received but no email sent.",
      body
    );
    return NextResponse.json({ success: true, sent: false });
  }

  const resend = getResend();
  if (!resend) {
    console.warn(
      "[contact] RESEND_API_KEY not set — contact submission received but no email sent.",
      body
    );
    return NextResponse.json({ success: true, sent: false });
  }

  const { subject, text, html } = buildEmail(body);

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      replyTo: body.email,
      subject,
      text,
      html,
    });
    if (error) {
      console.error("[contact] Resend error", error);
      return NextResponse.json(
        { error: "Email send failed" },
        { status: 502 }
      );
    }
    return NextResponse.json({ success: true, sent: true });
  } catch (err) {
    console.error("[contact] Send threw", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 502 });
  }
}
