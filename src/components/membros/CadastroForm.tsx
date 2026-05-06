import { useState, useEffect } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import {
  TRACKING_FIELDS,
  getTrackingData,
  pushLeadSubmitEvent,
  type TrackingData,
} from '../../lib/tracking';

interface CadastroFormProps {
  erro?: string | null;
}

const ERROR_MAP: Record<string, string> = {
  'campos-obrigatorios': 'Preencha todos os campos obrigatórios.',
  'email-existente': 'Já existe uma conta com este e-mail.',
  'falha-cadastro': 'Falha ao criar conta. Tente novamente.',
};

const CadastroForm = ({ erro }: CadastroFormProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tracking, setTracking] = useState<TrackingData>({});

  useEffect(() => {
    setTracking(getTrackingData());
  }, []);

  const errorText = erro ? ERROR_MAP[erro] || 'Erro desconhecido. Tente novamente.' : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    window.__wlPopulateHiddenFields?.(e.currentTarget);
    const currentTracking = getTrackingData();
    setTracking(currentTracking);

    pushLeadSubmitEvent({
      name: (e.currentTarget.elements.namedItem('name') as HTMLInputElement)?.value || null,
      email: (e.currentTarget.elements.namedItem('email') as HTMLInputElement)?.value || null,
      whatsapp: (e.currentTarget.elements.namedItem('whatsapp') as HTMLInputElement)?.value || null,
    });
  };

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-md w-full mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Crie sua conta
        </h2>
        <p className="text-gray-500 text-sm">
          Cadastre-se para acessar as aulas gratuitas.
        </p>
      </div>

      {errorText && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-6">
          {errorText}
        </div>
      )}

      <form
        method="POST"
        action="/api/auth/cadastro"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ===== CAMPOS OCULTOS PADRAO GTM ===== */}
        {TRACKING_FIELDS.map((field) => (
          <input
            key={field}
            type="hidden"
            name={field}
            id={`h_${field}`}
            value={tracking[field] || ''}
            readOnly
          />
        ))}

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Nome
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            WhatsApp
          </label>
          <input
            type="tel"
            name="whatsapp"
            required
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              minLength={6}
              className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 pr-12 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando conta...' : '[ Criar Conta ]'}
          {!loading && <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <a href="/membros/login" className="text-gray-500 hover:text-yellow-500 transition-colors">
          Já tem conta? Entrar
        </a>
      </div>
    </div>
  );
};

export default CadastroForm;
