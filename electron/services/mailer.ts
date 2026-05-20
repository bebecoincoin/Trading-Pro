import nodemailer from 'nodemailer';
import { env } from './env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = env('SMTP_HOST');
  const port = parseInt(env('SMTP_PORT', '587'), 10);
  const user = env('SMTP_USER');
  const pass = env('SMTP_PASS');

  if (!host || !user || !pass) return null;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: env('SMTP_SECURE', 'false') === 'true' || port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendVerificationEmail(to: string, token: string) {
  const t = getTransporter();
  const link = `trading-pro://verify?token=${encodeURIComponent(token)}`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#0a0d14;color:#e6e9ef;padding:32px;border-radius:12px;max-width:560px;margin:auto">
      <h1 style="color:#22d3ee;margin:0 0 12px">Bienvenue sur Trading Pro</h1>
      <p>Merci pour ton inscription. Confirme ton adresse email avec le code suivant&nbsp;:</p>
      <div style="font-size:28px;letter-spacing:6px;font-weight:800;color:#16c784;background:#141926;padding:18px;border-radius:10px;text-align:center;margin:18px 0">
        ${token}
      </div>
      <p style="color:#8a91a3;font-size:13px">Si tu n'es pas a l'origine de cette inscription, ignore simplement ce message.</p>
    </div>`;

  // En l'absence de SMTP configure, on log dans la console (dev / demo)
  if (!t) {
    console.log('========================================');
    console.log('[Mailer] SMTP non configure - email simule');
    console.log('To  :', to);
    console.log('Code:', token);
    console.log('========================================');
    return { simulated: true, token };
  }

  await t.sendMail({
    from: env('SMTP_FROM', 'Trading Pro <noreply@trading-pro.app>'),
    to,
    subject: 'Verifie ton adresse - Trading Pro',
    html,
    text: `Bienvenue sur Trading Pro. Code de verification: ${token}`,
  });
  return { simulated: false };
}
