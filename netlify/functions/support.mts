type Attachment = { name: string; type: string; content: string } | null;

type SupportRequest = {
  name?: string;
  email?: string;
  storeUrl?: string;
  subject?: string;
  category?: string;
  themeVersion?: string;
  pageUrl?: string;
  description?: string;
  consent?: boolean;
  company?: string;
  submittedAt?: string;
  attachment?: Attachment;
};

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer'
};

const allowedCategories = new Set([
  'Installation', 'Theme Editor', 'Header and navigation', 'Product page', 'Collection page',
  'Cart drawer', 'Pet Finder Quiz', 'Build a Box', 'Mobile layout', 'Performance',
  'Accessibility', 'Bug report', 'Other'
]);

const allowedTypes = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/plain',
  'application/zip', 'application/x-zip-compressed', 'application/octet-stream'
]);

const respond = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const clean = (value: unknown, max = 1000) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max) : '';

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character] ?? character));

const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

const validHttpsUrl = (value: string, required = false) => {
  if (!value) return !required;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
};

const createReference = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const random = crypto.randomUUID().replaceAll('-', '').slice(0, 4).toUpperCase();
  return `PALS-${date}-${random}`;
};

async function sendEmail(apiKey: string, payload: Record<string, unknown>) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const responseText = await response.text();
    console.error('Resend delivery failure', response.status, responseText.slice(0, 180));
    throw new Error('Email delivery failed');
  }
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return respond(405, { success: false, error: 'Method not allowed.' });

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const supportEmail = process.env.SUPPORT_TO_EMAIL;
  if (!apiKey || !fromEmail || !supportEmail) {
    console.error('Support email environment is incomplete');
    return respond(503, { success: false, error: 'Support email is temporarily unavailable.' });
  }

  let payload: SupportRequest;
  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 6_000_000) return respond(413, { success: false, error: 'The request is too large.' });
    payload = await request.json() as SupportRequest;
  } catch {
    return respond(400, { success: false, error: 'Invalid request.' });
  }

  if (clean(payload.company, 200)) return respond(200, { success: true, reference: createReference() });

  const name = clean(payload.name, 120);
  const email = clean(payload.email, 254).toLowerCase();
  const storeUrl = clean(payload.storeUrl, 500);
  const subject = clean(payload.subject, 180);
  const category = clean(payload.category, 60);
  const themeVersion = clean(payload.themeVersion, 30);
  const pageUrl = clean(payload.pageUrl, 500);
  const description = clean(payload.description, 8000);

  if (!name || !validEmail(email) || !validHttpsUrl(storeUrl, true) || !subject || !allowedCategories.has(category) || description.length < 30 || payload.consent !== true) {
    return respond(422, { success: false, error: 'Check the required fields and submit again.' });
  }
  if (!validHttpsUrl(pageUrl)) return respond(422, { success: false, error: 'The affected page URL is invalid.' });

  let attachment: { filename: string; content: string }[] | undefined;
  if (payload.attachment) {
    const fileName = clean(payload.attachment.name, 160).replace(/[^a-zA-Z0-9._ -]/g, '_');
    const fileType = clean(payload.attachment.type, 100);
    const content = clean(payload.attachment.content, 5_700_000);
    const estimatedBytes = Math.floor(content.length * 0.75);
    if (!fileName || !allowedTypes.has(fileType) || estimatedBytes > 4 * 1024 * 1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) {
      return respond(422, { success: false, error: 'The attachment type or size is not allowed.' });
    }
    attachment = [{ filename: fileName, content }];
  }

  const reference = createReference();
  const safe = {
    reference: escapeHtml(reference), name: escapeHtml(name), email: escapeHtml(email),
    storeUrl: escapeHtml(storeUrl), subject: escapeHtml(subject), category: escapeHtml(category),
    themeVersion: escapeHtml(themeVersion || 'Not provided'), pageUrl: escapeHtml(pageUrl || 'Not provided'),
    description: escapeHtml(description).replaceAll('\n', '<br>')
  };

  const supportHtml = `
    <h1>PALS support request ${safe.reference}</h1>
    <p><strong>Name:</strong> ${safe.name}<br>
    <strong>Email:</strong> ${safe.email}<br>
    <strong>Store:</strong> ${safe.storeUrl}<br>
    <strong>Category:</strong> ${safe.category}<br>
    <strong>Theme version:</strong> ${safe.themeVersion}<br>
    <strong>Affected page:</strong> ${safe.pageUrl}</p>
    <h2>${safe.subject}</h2>
    <p>${safe.description}</p>`;

  const merchantHtml = `
    <h1>We received your PALS support request</h1>
    <p>Hello ${safe.name},</p>
    <p>Your request was received and assigned reference <strong>${safe.reference}</strong>.</p>
    <p><strong>Subject:</strong> ${safe.subject}<br><strong>Store:</strong> ${safe.storeUrl}</p>
    <p>Keep this reference if you need to send additional information. The PALS support team will review the request and reply by email.</p>
    <p>PALS Theme Support</p>`;

  try {
    await sendEmail(apiKey, {
      from: fromEmail,
      to: [supportEmail],
      reply_to: email,
      subject: `[${reference}] ${subject}`,
      html: supportHtml,
      attachments: attachment
    });
    await sendEmail(apiKey, {
      from: fromEmail,
      to: [email],
      reply_to: supportEmail,
      subject: `We received your PALS support request — ${reference}`,
      html: merchantHtml
    });
    console.info('Support request delivered', reference, category);
    return respond(200, { success: true, reference });
  } catch {
    return respond(502, { success: false, error: 'The request could not be delivered. Try again later.' });
  }
}
