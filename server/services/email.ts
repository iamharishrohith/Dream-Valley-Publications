const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() || '';
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || 'Dream Valley Publications <no-reply@dreamvalleypublications.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamvalleypublications.com';

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    if (!RESEND_API_KEY) {
        console.warn(`[Resend Email Mock] To: ${to} | Subject: ${subject}`);
        console.log(`[Resend Email Mock Body]: ${html.slice(0, 300)}...`);
        return { mock: true, id: `mock-${crypto.randomUUID()}` };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to,
                subject,
                html,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Resend API response error:', data);
            throw new Error(data.message || 'Failed to dispatch email.');
        }

        return data;
    } catch (error: any) {
        console.error('Email dispatch exception:', error);
        throw error;
    }
};

// Premium email layout wrapper
const wrapHtml = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dream Valley Publications</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      overflow: hidden;
    }
    .header {
      background-color: #0b0b0c;
      padding: 32px;
      text-align: center;
    }
    .header img {
      height: 48px;
      border-radius: 6px;
    }
    .content {
      padding: 40px;
      line-height: 1.6;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 20px;
      color: #0b0b0c;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
    }
    .meta-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .meta-table td.label {
      font-weight: 600;
      color: #64748b;
      width: 35%;
    }
    .btn {
      display: inline-block;
      background-color: #1890ff;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 14px;
      margin-top: 20px;
      text-align: center;
    }
    .btn-secondary {
      background-color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <!-- Text-based fallback representing premium logo branding -->
        <span style="color: #ffffff; font-size: 1.25rem; font-weight: 800; letter-spacing: 1px;">DREAM VALLEY PUBLICATIONS</span>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Dream Valley Publications.<br>
        Premium publishing for academics, institutions, and serious authors.<br>
        support@dreamvalleypublications.com | India
      </div>
    </div>
  </div>
</body>
</html>
`;

export const sendSubmissionConfirmation = async (to: string, authorName: string, title: string, submissionId: string) => {
    const html = wrapHtml(`
        <h1>We have received your submission</h1>
        <p>Dear ${authorName},</p>
        <p>Thank you for submitting your manuscript/publication proposal to Dream Valley Publications. We are pleased to confirm that your project is now in our editorial pipeline.</p>
        
        <table class="meta-table">
          <tr>
            <td class="label">Project Title</td>
            <td>${title}</td>
          </tr>
          <tr>
            <td class="label">Status</td>
            <td><span style="color: #faad14; font-weight: 600;">PENDING INTAKE</span></td>
          </tr>
          <tr>
            <td class="label">Reference ID</td>
            <td style="font-family: monospace;">${submissionId}</td>
          </tr>
        </table>

        <p>Our editorial team will evaluate your submission for technical alignment and manuscript readiness. This process typically takes between 1 to 2 business days.</p>
        <p>You can track the live status of your submission at any time through your author dashboard.</p>
        
        <div style="text-align: center;">
          <a href="${SITE_URL}/dashboard" class="btn">Go to Dashboard</a>
        </div>
    `);

    return sendEmail({
        to,
        subject: `Submission Received: ${title}`,
        html,
    });
};

export const sendPublicationNotice = async (to: string, authorName: string, title: string, identifier: string, bookId: string, type: string) => {
    const isJournal = type === 'journal';
    const label = isJournal ? 'DOI / ISSN' : 'ISBN';
    const link = `${SITE_URL}/book/${bookId}`;

    const html = wrapHtml(`
        <h1>Congratulations! Your publication is now live</h1>
        <p>Dear ${authorName},</p>
        <p>We are thrilled to inform you that your work has completed our editorial review and is officially published and live on our platform!</p>

        <table class="meta-table">
          <tr>
            <td class="label">Title</td>
            <td><strong>${title}</strong></td>
          </tr>
          <tr>
            <td class="label">${label}</td>
            <td style="font-family: monospace; font-weight: bold; color: #52c41a;">${identifier}</td>
          </tr>
          <tr>
            <td class="label">Publication Date</td>
            <td>${new Date().toLocaleDateString()}</td>
          </tr>
        </table>

        <p>Your work has been formatted, indexed with schema metadata, and is now ready for global citations and trade distribution.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${link}" class="btn">View Live Publication</a>
        </div>
    `);

    return sendEmail({
        to,
        subject: `Publication Live: ${title}`,
        html,
    });
};

export const sendContactLeadNotice = async (visitorEmail: string, visitorName: string, subject: string, message: string) => {
    // 1. Send confirmation to the visitor
    const visitorHtml = wrapHtml(`
        <h1>We have received your message</h1>
        <p>Dear ${visitorName},</p>
        <p>Thank you for reaching out to Dream Valley Publications. This is to confirm we have received your consultation inquiry regarding: <strong>"${subject}"</strong>.</p>
        <p>Our publishing consultants are reviewing your details and will get back to you within 1 to 2 business days.</p>
        <p>In the meantime, feel free to explore our publication process and resources:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/process" class="btn" style="margin-right: 12px;">How It Works</a>
          <a href="${SITE_URL}/resources" class="btn btn-secondary">Publishing Resources</a>
        </div>
    `);

    await sendEmail({
        to: visitorEmail,
        subject: `Dream Valley Consultation Inquiry: ${subject}`,
        html: visitorHtml,
    });

    // 2. Notify the admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
        const adminHtml = wrapHtml(`
            <h1>New Consultation Lead Received</h1>
            <p>A new lead has been submitted through the public contact form:</p>
            <table class="meta-table">
              <tr>
                <td class="label">Name</td>
                <td>${visitorName}</td>
              </tr>
              <tr>
                <td class="label">Email</td>
                <td>${visitorEmail}</td>
              </tr>
              <tr>
                <td class="label">Subject</td>
                <td>${subject}</td>
              </tr>
            </table>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid #1890ff; font-style: italic;">
              ${message.replace(/\n/g, '<br>')}
            </div>
        `);

        await sendEmail({
            to: adminEmail,
            subject: `[ADMIN ALERT] New Consultation Lead: ${subject}`,
            html: adminHtml,
        });
    }
};
