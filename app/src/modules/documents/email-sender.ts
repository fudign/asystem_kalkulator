// Email Sender
// Sends KP and Presentation to clients

import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

interface EmailAttachment {
  filename: string;
  path: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

interface SendKPEmailOptions {
  recipientEmail: string;
  companyName: string;
  deploymentUrl: string;
  kpPdfPath: string;
  presentationPdfPath: string;
}

// Create transporter
function createTransporter() {
  // Use configured SMTP or default to development mode
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development: use Ethereal for testing
  // In development, emails are not actually sent but can be viewed at ethereal.email
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER || 'test@ethereal.email',
      pass: process.env.ETHEREAL_PASS || 'test',
    },
  });
}

// Send generic email
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ASYSTEM.KG" <noreply@asystem.kg>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Sent to ${options.to}, messageId: ${info.messageId}`);

    // In development with Ethereal, log preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${options.to}:`, error);
    return false;
  }
}

// Generate KP email HTML
function generateKPEmailHTML(options: SendKPEmailOptions): string {
  return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">ASYSTEM.KG</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Ваш сайт готов!</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #1e293b; margin: 0 0 20px 0;">Здравствуйте!</h2>

      <p style="color: #475569; line-height: 1.6;">
        Рады сообщить, что демо-версия сайта для <strong>${options.companyName}</strong> готова к просмотру!
      </p>

      <!-- Demo Link Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${options.deploymentUrl}"
           style="display: inline-block; background: #2563eb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Посмотреть демо-сайт →
        </a>
      </div>

      <p style="color: #475569; line-height: 1.6;">
        К этому письму прикреплены:
      </p>

      <ul style="color: #475569; line-height: 1.8;">
        <li><strong>Коммерческое предложение (КП)</strong> — детальный анализ вашего бизнеса и наше предложение</li>
        <li><strong>Презентация</strong> — визуальное представление возможностей сайта</li>
      </ul>

      <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="color: #1e40af; margin: 0; font-weight: 500;">
          💡 Сайт создан на основе AI-анализа вашего бизнеса и готов к запуску!
        </p>
      </div>

      <p style="color: #475569; line-height: 1.6;">
        Если у вас есть вопросы или вы хотите обсудить доработки, пожалуйста, свяжитесь с нами.
      </p>

      <!-- Contact -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #64748b; margin: 0;">С уважением,<br><strong>Команда ASYSTEM.KG</strong></p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
      <p style="margin: 0;">© ${new Date().getFullYear()} ASYSTEM.KG. Все права защищены.</p>
      <p style="margin: 10px 0 0 0;">
        <a href="https://asystem.kg" style="color: #2563eb; text-decoration: none;">asystem.kg</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
}

// Send KP and Presentation to client
export async function sendKPEmail(options: SendKPEmailOptions): Promise<boolean> {
  console.log(`[EMAIL] Sending KP to ${options.recipientEmail}`);

  // Verify files exist
  const attachments: EmailAttachment[] = [];

  try {
    await fs.access(options.kpPdfPath);
    attachments.push({
      filename: `КП_${options.companyName.replace(/\s/g, '_')}.pdf`,
      path: options.kpPdfPath,
    });
  } catch {
    console.warn(`[EMAIL] KP PDF not found: ${options.kpPdfPath}`);
  }

  try {
    await fs.access(options.presentationPdfPath);
    attachments.push({
      filename: `Презентация_${options.companyName.replace(/\s/g, '_')}.pdf`,
      path: options.presentationPdfPath,
    });
  } catch {
    console.warn(`[EMAIL] Presentation PDF not found: ${options.presentationPdfPath}`);
  }

  if (attachments.length === 0) {
    console.error('[EMAIL] No attachments available');
    return false;
  }

  const html = generateKPEmailHTML(options);

  return sendEmail({
    to: options.recipientEmail,
    subject: `Коммерческое предложение для ${options.companyName} | ASYSTEM.KG`,
    html,
    attachments,
  });
}

// Send notification to admin
export async function sendAdminNotification(
  projectId: string,
  companyName: string,
  deploymentUrl: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.log('[EMAIL] No admin email configured, skipping notification');
    return false;
  }

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>Новый проект завершен!</h2>
  <p><strong>ID проекта:</strong> ${projectId}</p>
  <p><strong>Компания:</strong> ${companyName}</p>
  <p><strong>Демо сайт:</strong> <a href="${deploymentUrl}">${deploymentUrl}</a></p>
  <p>Проверьте админ-панель для просмотра деталей.</p>
</body>
</html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[ASYSTEM] Новый проект: ${companyName}`,
    html,
  });
}
