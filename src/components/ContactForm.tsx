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

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    agencyLink: '',
    clientCount: '',
    niche: ''
  });

  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    const stored = window.__wlTracking || {};
    setTracking(stored);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    const payload = { ...formData, ...tracking };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "form_submit_lead",
      lead_name: formData.name || null,
      lead_email: null,
      lead_whatsapp: null,
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
      ref: tracking.ref || null
    });

    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: "shield_churn" })
      });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="application-form" className="py-24 bg-[#0a0a0a] relative bg-grid-pattern">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 max-w-2xl relative z-10">
        <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Top colored bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-industrial text-white mb-2 uppercase">
              Vamos Escalar a Sua Carteira?
            </h2>
            <p className="text-gray-500 text-sm">
              Preencha os dados abaixo para agendar a reunião de parceria.
            </p>
          </div>

          {status === 'success' ? (
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold font-industrial text-white uppercase mb-4">Aplicação recebida.</h3>
              <p className="text-gray-400">Entraremos em contato em breve.</p>
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
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Nome do Dono/Sócio</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Link da Agência / Instagram</label>
              <input
                type="text"
                name="agencyLink"
                required
                value={formData.agencyLink}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="www.suaagencia.com.br"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Quantos clientes ativos você tem?</label>
              <select
                name="clientCount"
                required
                value={formData.clientCount}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors appearance-none"
              >
                <option value="" disabled>Selecione uma opção</option>
                <option value="<10">Menos de 10</option>
                <option value="10-30">Entre 10 e 30</option>
                <option value="30+">Mais de 30</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Qual o nicho principal?</label>
              <input
                type="text"
                name="niche"
                required
                value={formData.niche}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="Ex: Imobiliário, Estética, B2B..."
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Enviando...' : '[ Agendar Reunião de Parceria ]'}
              {status !== 'sending' && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-4">
              <Lock className="w-3 h-3" />
              <span>Seus dados estão protegidos. Sem spam.</span>
            </div>
          </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
