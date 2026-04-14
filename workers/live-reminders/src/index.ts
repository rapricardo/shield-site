import { createClient } from '@supabase/supabase-js';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  RESEND_API_KEY: string;
  SITE_ORIGIN: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function reminderEmailHtml(params: {
  memberName: string;
  eventTitle: string;
  startsAt: string;
  meetUrl: string | null;
  eventUrl: string;
}): string {
  const timeFormatted = new Date(params.startsAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const ctaButton = params.meetUrl
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
        <tr><td style="background-color:#eab308;padding:14px 32px;">
          <a href="${params.meetUrl}" style="color:#000000;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-size:13px;text-decoration:none;">
            Entrar na Live &rarr;
          </a>
        </td></tr>
      </table>`
    : `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
        <tr><td style="background-color:#eab308;padding:14px 32px;">
          <a href="${params.eventUrl}" style="color:#000000;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-size:13px;text-decoration:none;">
            Ver Detalhes &rarr;
          </a>
        </td></tr>
      </table>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Live em 1 hora</title></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#111111;border:1px solid #1f2937;">
        <tr><td style="background-color:#eab308;height:4px;"></td></tr>
        <tr><td style="padding:40px 32px;">
          <p style="margin:0 0 8px 0;font-size:11px;color:#eab308;text-transform:uppercase;letter-spacing:2px;font-family:monospace;">Começa em 1 hora</p>
          <h1 style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;text-transform:uppercase;">
            ${escapeHtml(params.eventTitle)}
          </h1>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#d1d5db;">
            Olá, ${escapeHtml(params.memberName)}. A live <strong>${escapeHtml(params.eventTitle)}</strong> começa às <strong>${escapeHtml(timeFormatted)}</strong>.
          </p>
          ${ctaButton}
          <p style="margin:32px 0 0 0;font-size:12px;color:#6b7280;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">
            Ricardo Tocha — Arquitetura de Operações Híbridas
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Ricardo Tocha <no-reply@ricardotocha.com.br>',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error(`Resend error ${res.status}:`, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    return false;
  }
}

async function processReminders(env: Env): Promise<{ processed: number; emailsSent: number }> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Janela: eventos que começam entre 55 e 70 minutos no futuro (buffer pra tolerar atrasos do cron)
  const now = new Date();
  const windowStart = new Date(now.getTime() + 55 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 70 * 60 * 1000).toISOString();

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, slug, title, starts_at, meet_url, visibility')
    .is('reminder_sent_at', null)
    .gte('starts_at', windowStart)
    .lte('starts_at', windowEnd);

  if (eventsError) {
    console.error('Erro ao buscar eventos:', eventsError);
    return { processed: 0, emailsSent: 0 };
  }

  if (!events || events.length === 0) {
    return { processed: 0, emailsSent: 0 };
  }

  let totalEmails = 0;

  for (const event of events) {
    // Busca destinatários conforme visibility
    let profilesQuery = supabase.from('profiles').select('email, name');

    if (event.visibility === 'mentoring_only') {
      // Só quem tem acesso a algum produto mentoring
      const { data: mentoringUsers } = await supabase
        .from('user_access')
        .select('user_id, products!inner(type)')
        .eq('products.type', 'mentoring');

      const userIds = (mentoringUsers || []).map((r: any) => r.user_id);
      if (userIds.length === 0) {
        console.log(`Evento ${event.slug} é mentoring_only mas nenhum aluno tem acesso`);
        // Marca como enviado mesmo assim pra não tentar de novo
        await supabase.from('events').update({ reminder_sent_at: new Date().toISOString() }).eq('id', event.id);
        continue;
      }
      profilesQuery = profilesQuery.in('id', userIds);
    } else if (event.visibility === 'public') {
      // Lives públicas: não enviamos lembrete em massa (só quem clicar no site)
      console.log(`Evento ${event.slug} é público — skip de email em massa`);
      await supabase.from('events').update({ reminder_sent_at: new Date().toISOString() }).eq('id', event.id);
      continue;
    }
    // visibility='members' → todos os profiles (padrão)

    const { data: recipients, error: recipientsError } = await profilesQuery;
    if (recipientsError || !recipients) {
      console.error(`Erro ao buscar destinatários do evento ${event.slug}:`, recipientsError);
      continue;
    }

    const eventUrl = `${env.SITE_ORIGIN}/membros/lives/${event.slug}/`;

    // Envia em paralelo
    const results = await Promise.allSettled(
      recipients.map((r) => {
        const html = reminderEmailHtml({
          memberName: r.name || 'membro',
          eventTitle: event.title,
          startsAt: event.starts_at,
          meetUrl: event.meet_url,
          eventUrl,
        });
        return sendEmail(env.RESEND_API_KEY, r.email, `Live em 1 hora: ${event.title}`, html);
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    totalEmails += successCount;

    // Marca como enviado (mesmo que alguns emails tenham falhado — Resend pode avisar dos bounces)
    await supabase
      .from('events')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', event.id);

    console.log(`Evento ${event.slug}: ${successCount}/${recipients.length} emails enviados`);
  }

  return { processed: events.length, emailsSent: totalEmails };
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const result = await processReminders(env);
    console.log(`Cron run: ${result.processed} eventos processados, ${result.emailsSent} emails enviados`);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    // Endpoint HTTP opcional pra teste manual
    const url = new URL(request.url);
    if (url.pathname === '/run' && request.method === 'POST') {
      const auth = request.headers.get('Authorization');
      if (auth !== `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`) {
        return new Response('Unauthorized', { status: 401 });
      }
      const result = await processReminders(env);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Live Reminders Worker — use scheduled trigger', { status: 200 });
  },
};
