import nodemailer from "nodemailer";

import type { ContactSubmission } from "@/lib/types";

type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
};

function getEmailConfig(): EmailConfig {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = String(process.env.SMTP_SECURE ?? "true") !== "false";
  const user = process.env.SMTP_USER ?? "";
  const pass = process.env.SMTP_PASS ?? "";
  const to = process.env.CONTACT_TO_EMAIL ?? "aixautomation01@gmail.com";

  if (!user || !pass) {
    throw new Error("Missing SMTP_USER or SMTP_PASS environment variables.");
  }

  return { host, port, secure, user, pass, to };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nl2br(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function buildContactEmailHtml(submission: ContactSubmission) {
  const submittedAt = new Date(submission.submittedAt).toUTCString();
  const safeName = escapeHtml(submission.name);
  const safeEmail = escapeHtml(submission.email);
  const safeMessage = nl2br(submission.message);

  return `
    <div style="margin:0;padding:24px;background:#f4f1ea;font-family:Arial,sans-serif;color:#17201d;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d9ddd5;">
        <tr>
          <td style="padding:28px 32px;background:#17201d;color:#f6f8f4;">
            <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#8ab7ad;font-weight:700;">AIX Automation Portfolio</div>
            <h1 style="margin:12px 0 0;font-size:28px;line-height:1.1;">New contact submission</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 18px;border-bottom:1px solid #e6e8e1;">
                  <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b756f;">Contact details</div>
                  <p style="margin:14px 0 6px;font-size:16px;line-height:1.5;"><strong>Name:</strong> ${safeName}</p>
                  <p style="margin:0 0 6px;font-size:16px;line-height:1.5;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#0f766e;text-decoration:none;">${safeEmail}</a></p>
                  <p style="margin:0;font-size:16px;line-height:1.5;"><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:22px 0 0;">
                  <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#6b756f;">Message</div>
                  <div style="margin-top:14px;padding:18px 20px;border-radius:16px;background:#f7f8f5;border:1px solid #e6e8e1;font-size:16px;line-height:1.7;color:#17201d;">
                    ${safeMessage}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildContactEmailText(submission: ContactSubmission) {
  return [
    "New contact submission",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Submitted: ${new Date(submission.submittedAt).toUTCString()}`,
    "",
    "Message:",
    submission.message
  ].join("\n");
}

export async function sendContactEmail(submission: ContactSubmission) {
  const config = getEmailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  await transporter.sendMail({
    from: `"AIX Automation Portfolio" <${config.user}>`,
    to: config.to,
    replyTo: `${submission.name} <${submission.email}>`,
    subject: `New portfolio contact from ${submission.name}`,
    text: buildContactEmailText(submission),
    html: buildContactEmailHtml(submission)
  });
}
