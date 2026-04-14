const RESEND_API_URL = 'https://api.resend.com/emails';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; error?: string }> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY não configurada');
    return { ok: false, error: 'API key missing' };
  }

  const from = params.from || 'Ricardo Tocha <no-reply@ricardotocha.com.br>';

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend API error:', res.status, errText);
      return { ok: false, error: errText };
    }

    return { ok: true };
  } catch (err) {
    console.error('Erro ao enviar email via Resend:', err);
    return { ok: false, error: String(err) };
  }
}
