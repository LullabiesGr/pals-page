import { createClient } from "npm:@supabase/supabase-js@2.116.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DESC_LENGTH = 8000;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_URL_LENGTH = 500;
const MAX_SUBJECT_LENGTH = 180;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;
const MIN_DESC_LENGTH = 30;
const MIN_FORM_TIME_MS = 1500;

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c] ?? c)
  );
}

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX_EMAIL_LENGTH;
}

function validStoreUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function createReference(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase();
  return `PALS-${date}-${random}`;
}

function randomFilename(ext: string): string {
  return `${crypto.randomUUID().replaceAll("-", "")}.${ext}`;
}

function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts[parts.length - 1] || "";
}

interface RateEntry {
  count: number;
  firstAt: number;
}

const rateLimitMap = new Map<string, RateEntry>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstAt: now });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

async function sendEmail(
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Resend delivery failure", response.status, text.slice(0, 500));
      return { ok: false, error: `Resend API returned ${response.status}: ${text.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Resend fetch error", err);
    return { ok: false, error: "Network error contacting email provider" };
  }
}

async function parseMultipart(req: Request): Promise<{
  fields: Record<string, string>;
  file: { name: string; type: string; bytes: Uint8Array } | null;
}> {
  const formData = await req.formData();
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
    }
  }
  let file: { name: string; type: string; bytes: Uint8Array } | null = null;
  const fileEntry = formData.get("attachment");
  if (fileEntry && fileEntry instanceof File) {
    const arrayBuffer = await fileEntry.arrayBuffer();
    file = {
      name: fileEntry.name,
      type: fileEntry.type || "application/octet-stream",
      bytes: new Uint8Array(arrayBuffer),
    };
  }
  return { fields, file };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { success: false, message: "Method not allowed." });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return json(400, { success: false, message: "Invalid request format." });
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 7_000_000) {
    return json(413, { success: false, message: "The request is too large." });
  }

  let parsed: { fields: Record<string, string>; file: { name: string; type: string; bytes: Uint8Array } | null };
  try {
    parsed = await parseMultipart(req);
  } catch {
    return json(400, { success: false, message: "Could not read the submitted form." });
  }

  const { fields, file } = parsed;

  // Honeypot check
  if (clean(fields.company, 200)) {
    return json(200, { success: true, reference: createReference(), message: "Request received." });
  }

  // Timing check — measure from form render time sent by client
  const renderTime = Number(fields._t || 0);
  const elapsed = Date.now() - renderTime;
  if (renderTime > 0 && elapsed < MIN_FORM_TIME_MS) {
    return json(422, { success: false, message: "Submission was too fast. Please try again." });
  }

  // Rate limiting
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return json(429, { success: false, message: "Too many requests. Please wait a minute and try again." });
  }

  // Validate fields
  const name = clean(fields.name, MAX_NAME_LENGTH);
  const email = clean(fields.email, MAX_EMAIL_LENGTH).toLowerCase();
  const storeUrl = clean(fields.storeUrl, MAX_URL_LENGTH);
  const subject = clean(fields.subject, MAX_SUBJECT_LENGTH);
  const description = clean(fields.description, MAX_DESC_LENGTH);
  const themeName = clean(fields.themeName, 60) || "PALS";
  const consent = fields.consent === "true" || fields.consent === "on" || fields.consent === "1";

  if (!name) return json(422, { success: false, message: "Your name is required." });
  if (!validEmail(email)) return json(422, { success: false, message: "A valid email address is required." });
  if (!validStoreUrl(storeUrl)) return json(422, { success: false, message: "A valid Shopify store URL is required." });
  if (description.length < MIN_DESC_LENGTH) return json(422, { success: false, message: `Please describe the issue in at least ${MIN_DESC_LENGTH} characters.` });
  if (!consent) return json(422, { success: false, message: "Please acknowledge the privacy notice to continue." });

  // Validate attachment
  let attachmentPath: string | null = null;
  let attachmentExt = "";
  if (file) {
    attachmentExt = getExtension(file.name);
    const declaredMime = file.type;
    if (!ALLOWED_EXT.has(attachmentExt)) {
      return json(422, { success: false, message: "Unsupported file format. Allowed: JPG, JPEG, PNG, WEBP, PDF." });
    }
    if (!ALLOWED_MIME.has(declaredMime)) {
      return json(422, { success: false, message: "Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP, PDF." });
    }
    if (file.bytes.length > MAX_FILE_SIZE) {
      return json(422, { success: false, message: "The attachment must be 5 MB or smaller." });
    }
  }

  // Secrets
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || Deno.env.get("SUPPORT_FROM_EMAIL");
  const supportEmail = Deno.env.get("SUPPORT_TO_EMAIL");
  const replyToEmail = Deno.env.get("SUPPORT_REPLY_TO_EMAIL") || supportEmail;

  if (!apiKey || !fromEmail || !supportEmail) {
    console.error("Missing email environment configuration");
    return json(503, { success: false, message: "Support email is temporarily unavailable." });
  }

  // Supabase admin client (service role, bypasses RLS)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const reference = createReference();

  // Upload attachment to private bucket
  if (file) {
    const storageFilename = randomFilename(attachmentExt);
    const { error: uploadError } = await supabase.storage
      .from("support-attachments")
      .upload(storageFilename, file.bytes, { contentType: file.type });

    if (uploadError) {
      console.error("Storage upload failed for", reference, uploadError.message);
      return json(500, { success: false, message: "Could not save the attachment. Please try again." });
    }
    attachmentPath = storageFilename;
  }

  // Insert ticket
  const { data: ticketData, error: insertError } = await supabase.from("support_tickets").insert({
    reference,
    name,
    email,
    store_url: storeUrl,
    theme_name: themeName,
    subject: subject || null,
    description,
    attachment_path: attachmentPath,
    status: "new",
    notification_status: "pending",
    autoresponder_status: "pending",
  }).select("id").single();

  if (insertError || !ticketData) {
    console.error("Ticket insert failed for", reference, insertError?.message);
    return json(500, { success: false, message: "Could not save the support request. Please try again." });
  }

  // Generate signed URL for admin email (10 minute expiry)
  let attachmentUrl: string | null = null;
  if (attachmentPath) {
    const { data: signedUrlData } = await supabase.storage
      .from("support-attachments")
      .createSignedUrl(attachmentPath, 600);
    attachmentUrl = signedUrlData?.signedUrl || null;
  }

  const safe = {
    reference: escapeHtml(reference),
    name: escapeHtml(name),
    email: escapeHtml(email),
    storeUrl: escapeHtml(storeUrl),
    subject: escapeHtml(subject || "(no subject)"),
    themeName: escapeHtml(themeName),
    description: escapeHtml(description).replaceAll("\n", "<br>"),
  };

  const adminHtml = `
    <h1>PALS support request ${safe.reference}</h1>
    <p><strong>Name:</strong> ${safe.name}<br>
    <strong>Email:</strong> ${safe.email}<br>
    <strong>Store:</strong> ${safe.storeUrl}<br>
    <strong>Theme:</strong> ${safe.themeName}</p>
    <h2>${safe.subject}</h2>
    <p>${safe.description}</p>
    ${attachmentUrl ? `<p><a href="${attachmentUrl}">View attachment</a> (link expires in 10 minutes)</p>` : ""}
  `;

  const adminText = `PALS support request ${reference}\n\nName: ${name}\nEmail: ${email}\nStore: ${storeUrl}\nTheme: ${themeName}\nSubject: ${subject || "(no subject)"}\n\n${description}\n${attachmentUrl ? `\nAttachment: ${attachmentUrl}` : ""}`;

  const merchantHtml = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#0f5bdb;border-radius:22px 22px 0 0;padding:28px;color:#fff;">
        <h1 style="margin:0;font-size:1.8rem;font-style:italic;">PALS! Support</h1>
      </div>
      <div style="background:#fff7e8;border-radius:0 0 22px 22px;padding:28px;border:2px solid #111;">
        <h2 style="color:#111;margin-top:0;">We received your request</h2>
        <p style="color:#665f55;font-size:1.05rem;line-height:1.65;">Hello ${safe.name},</p>
        <p style="color:#665f55;font-size:1.05rem;line-height:1.65;">Your PALS theme support request was received and assigned reference <strong style="color:#0f5bdb;">${safe.reference}</strong>.</p>
        <p style="color:#665f55;font-size:1.05rem;line-height:1.65;"><strong>Subject:</strong> ${safe.subject}<br><strong>Store:</strong> ${safe.storeUrl}</p>
        <p style="color:#665f55;font-size:1.05rem;line-height:1.65;">The PALS support team will review your request and respond within <strong>two business days</strong>.</p>
        <p style="color:#665f55;font-size:1.05rem;line-height:1.65;">Please keep your reference <strong>${safe.reference}</strong> handy when communicating with us about this request.</p>
        <hr style="border:0;border-top:2px dashed #0f5bdd;margin:24px 0;">
        <p style="color:#665f55;font-size:.9rem;">PALS Theme Support</p>
      </div>
    </div>
  `;

  const merchantText = `We received your PALS support request\n\nHello ${name},\n\nYour request was received and assigned reference ${reference}.\n\nSubject: ${subject || "(no subject)"}\nStore: ${storeUrl}\n\nThe PALS support team will review your request and respond within two business days.\n\nPlease keep your reference ${reference} handy when communicating with us about this request.\n\nPALS Theme Support`;

  // Send admin notification
  let notificationStatus = "pending";
  let notificationError: string | null = null;
  const adminResult = await sendEmail(apiKey, {
    from: fromEmail,
    to: [supportEmail],
    reply_to: email,
    subject: `[PALS Support] ${reference} — ${subject || "Support request"}`,
    html: adminHtml,
    text: adminText,
  });
  if (adminResult.ok) {
    notificationStatus = "sent";
  } else {
    notificationStatus = "failed";
    notificationError = adminResult.error || "Unknown error";
  }

  // Send merchant autoresponder
  let autoresponderStatus = "pending";
  let autoresponderError: string | null = null;
  const merchantResult = await sendEmail(apiKey, {
    from: fromEmail,
    to: [email],
    reply_to: replyToEmail,
    subject: `We received your PALS support request — ${reference}`,
    html: merchantHtml,
    text: merchantText,
  });
  if (merchantResult.ok) {
    autoresponderStatus = "sent";
  } else {
    autoresponderStatus = "failed";
    autoresponderError = merchantResult.error || "Unknown error";
  }

  // Update ticket with email statuses
  const { error: updateError } = await supabase.from("support_tickets").update({
    notification_status: notificationStatus,
    autoresponder_status: autoresponderStatus,
    notification_error: notificationError,
    autoresponder_error: autoresponderError,
  }).eq("id", ticketData.id);

  if (updateError) {
    console.error("Failed to update email statuses for", reference, updateError.message);
  }

  // Determine response
  if (notificationStatus === "sent" && autoresponderStatus === "sent") {
    return json(200, {
      success: true,
      reference,
      message: `Request ${reference} was received. A confirmation email has been sent to ${email}.`,
    });
  }

  if (notificationStatus === "failed" && autoresponderStatus === "failed") {
    return json(200, {
      success: true,
      reference,
      message: `Request ${reference} was recorded, but email delivery is temporarily delayed. Your request is saved and will be processed.`,
    });
  }

  return json(200, {
    success: true,
    reference,
    message: `Request ${reference} was received. A confirmation email has been sent to ${email}.`,
  });
});
