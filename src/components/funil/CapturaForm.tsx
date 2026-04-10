import { useState, useEffect } from 'react';
import { Send, Lock } from 'lucide-react';

declare global {
  interface Window {
    __wlTracking?: Record<string, string>;
    dataLayer?: Record<string, unknown>[];
  }
}

const HIDDEN_FIELDS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "gclid", "gbraid", "wbraid", "gad_campaignid", "gad_source",
  "fbclid", "fbc", "fbp",
  "ttclid", "msclkid", "li_fat_id", "twclid", "sck",
  "landing_page", "referrer", "user_agent", "first_visit",
  "session_id", "session_attributes_encoded", "originPage", "ref"
] as const;

const WEBHOOK_URL = "https://apolo-lead-proxy.rapricardo.workers.dev";

const CapturaForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const stored = window.__wlTracking || {};
    setTracking(stored);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const payload = { ...formData, ...tracking, source: 'funil_video_ia' };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "form_submit_lead",
      lead_name: formData.name || null,
      lead_email: formData.email || null,
      lead_whatsapp: formData.whatsapp || null,
      utm_source: tracking.utm_source || null,
      utm_medium: tracking.utm_medium || null,
      utm_campaign: tracking.utm_campaign || null,
      utm_content: tracking.utm_content || null,
      utm_term: tracking.utm_term || null,
      gclid: tracking.gclid || null,
      gbraid: tracking.gbraid || null,
      wbraid: tracking.wbraid || null,
      gad_campaignid: tracking.gad_campaignid || null,
      gad_source: tracking.gad_source || null,
      fbclid: tracking.fbclid || null,
      fbc: tracking.fbc || null,
      fbp: tracking.fbp || null,
      ttclid: tracking.ttclid || null,
      msclkid: tracking.msclkid || null,
      li_fat_id: tracking.li_fat_id || null,
      twclid: tracking.twclid || null,
      sck: tracking.sck || null,
      landing_page: tracking.landing_page || null,
      referrer: tracking.referrer || null,
      user_agent: tracking.user_agent || null,
      first_visit: tracking.first_visit || null,
      session_id: tracking.session_id || null,
      session_attributes_encoded: tracking.session_attributes_encoded || null,
      origin_page: tracking.originPage || null,
      ref: tracking.ref || null,
    });

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus('success');
      window.location.href = '/video-ia/oportunidade/';
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-industrial text-white mb-2 uppercase">
            Acesse o Conteúdo Gratuito
          </h2>
          <p className="text-gray-500 text-sm">
            3 vídeos mostrando como produzir vídeos profissionais com IA
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold font-industrial text-white uppercase mb-4">Cadastro realizado!</h3>
            <p className="text-gray-400">Redirecionando para o conteúdo...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'error' && (
              <p className="text-red-500 text-sm text-center">Erro ao enviar. Tente novamente.</p>
            )}

            {/* ===== CAMPOS OCULTOS PADRAO GTM ===== */}
            {HIDDEN_FIELDS.map((field) => (
              <input
                key={field}
                type="hidden"
                name={field}
                id={`h_${field}`}
                value={tracking[field] || ''}
              />
            ))}

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Nome</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">E-mail</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">WhatsApp</label>
              <input
                type="tel"
                name="whatsapp"
                required
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="(11) 99999-9999"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Enviando...' : '[ Quero Assistir Agora ]'}
              {status !== 'sending' && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-4">
              <Lock className="w-3 h-3" />
              <span>Seus dados estao protegidos. Sem spam.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CapturaForm;
