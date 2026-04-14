interface WelcomeEmailParams {
  name: string;
  loginUrl: string;
}

export function welcomeEmailHtml(params: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bem-vindo à Área de Membros</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#111111;border:1px solid #1f2937;">
          <tr>
            <td style="background-color:#eab308;height:4px;"></td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 24px 0;font-size:24px;font-weight:700;color:#ffffff;text-transform:uppercase;letter-spacing:-0.5px;">
                Bem-vindo, ${escapeHtml(params.name)}
              </h1>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#d1d5db;">
                Sua conta foi criada com sucesso. Agora você tem acesso ao conteúdo gratuito da área de membros.
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#d1d5db;">
                Comece pelos fundamentos, explore as aulas gratuitas e, quando estiver pronto, desbloqueie o conteúdo completo.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                <tr>
                  <td style="background-color:#eab308;padding:14px 32px;">
                    <a href="${params.loginUrl}" style="color:#000000;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-size:13px;text-decoration:none;">
                      Acessar Área de Membros &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0 0;font-size:12px;line-height:1.5;color:#6b7280;font-family:monospace;text-transform:uppercase;letter-spacing:1px;">
                Ricardo Tocha — Arquitetura de Operações Híbridas
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

interface PurchaseConfirmedParams {
  name: string;
  productName: string;
  amount: string; // pre-formatado em BRL
  loginUrl: string;
}

export function purchaseConfirmedHtml(params: PurchaseConfirmedParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Compra Confirmada</title></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#111111;border:1px solid #1f2937;">
        <tr><td style="background-color:#22c55e;height:4px;"></td></tr>
        <tr><td style="padding:40px 32px;">
          <p style="margin:0 0 8px 0;font-size:11px;color:#22c55e;text-transform:uppercase;letter-spacing:2px;font-family:monospace;">Pagamento Confirmado</p>
          <h1 style="margin:0 0 24px 0;font-size:24px;font-weight:700;color:#ffffff;text-transform:uppercase;">
            Seu acesso foi liberado
          </h1>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#d1d5db;">
            Olá, ${escapeHtml(params.name)}. Recebemos a confirmação do seu pagamento.
          </p>
          <div style="background-color:#0a0a0a;border:1px solid #1f2937;padding:16px;margin:20px 0;">
            <p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:monospace;letter-spacing:1px;">Produto</p>
            <p style="margin:0 0 12px 0;font-size:15px;color:#ffffff;font-weight:600;">${escapeHtml(params.productName)}</p>
            <p style="margin:0 0 4px 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-family:monospace;letter-spacing:1px;">Valor</p>
            <p style="margin:0;font-size:15px;color:#eab308;font-weight:600;">${escapeHtml(params.amount)}</p>
          </div>
          <p style="margin:24px 0 24px 0;font-size:15px;line-height:1.6;color:#d1d5db;">
            Seu acesso já está disponível na área de membros.
          </p>
          <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
            <tr><td style="background-color:#eab308;padding:14px 32px;">
              <a href="${params.loginUrl}" style="color:#000000;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-size:13px;text-decoration:none;">
                Acessar Conteúdo &rarr;
              </a>
            </td></tr>
          </table>
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

interface NewRecordingParams {
  eventTitle: string;
  recordingUrl: string;
  memberName: string;
}

export function newRecordingHtml(params: NewRecordingParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Nova Gravação Disponível</title></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#111111;border:1px solid #1f2937;">
        <tr><td style="background-color:#eab308;height:4px;"></td></tr>
        <tr><td style="padding:40px 32px;">
          <p style="margin:0 0 8px 0;font-size:11px;color:#eab308;text-transform:uppercase;letter-spacing:2px;font-family:monospace;">Nova Gravação</p>
          <h1 style="margin:0 0 24px 0;font-size:22px;font-weight:700;color:#ffffff;text-transform:uppercase;">
            ${escapeHtml(params.eventTitle)}
          </h1>
          <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#d1d5db;">
            Olá, ${escapeHtml(params.memberName)}. A gravação da live foi publicada e está disponível na área de membros.
          </p>
          <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
            <tr><td style="background-color:#eab308;padding:14px 32px;">
              <a href="${params.recordingUrl}" style="color:#000000;font-weight:700;text-transform:uppercase;letter-spacing:2px;font-size:13px;text-decoration:none;">
                Assistir Gravação &rarr;
              </a>
            </td></tr>
          </table>
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
