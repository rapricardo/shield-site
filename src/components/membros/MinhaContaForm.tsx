import { useState } from 'react';
import { Save, KeyRound } from 'lucide-react';

interface MinhaContaFormProps {
  name: string;
  email: string;
  whatsapp: string | null;
  createdAt: string;
  erro?: string | null;
  msg?: string | null;
}

const ERROR_MAP: Record<string, string> = {
  'nome-invalido': 'Nome inválido (mínimo 2 caracteres).',
  'falha-atualizacao': 'Erro ao salvar. Tente novamente.',
};

const MSG_MAP: Record<string, string> = {
  salvo: 'Perfil atualizado com sucesso.',
};

function formatarData(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const MinhaContaForm = ({ name, email, whatsapp, createdAt, erro, msg }: MinhaContaFormProps) => {
  const [loading, setLoading] = useState(false);

  const errorText = erro ? ERROR_MAP[erro] || 'Erro desconhecido. Tente novamente.' : null;
  const msgText = msg ? MSG_MAP[msg] || null : null;

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="mb-8">
        <h2 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Dados da conta
        </h2>
        <p className="text-gray-500 text-sm font-mono uppercase tracking-wider">
          Membro desde: {formatarData(createdAt)}
        </p>
      </div>

      {errorText && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-6">
          {errorText}
        </div>
      )}

      {msgText && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 mb-6">
          {msgText}
        </div>
      )}

      <form
        method="POST"
        action="/api/profile/atualizar"
        onSubmit={() => setLoading(true)}
        className="space-y-6"
      >
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Nome
          </label>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            defaultValue={name}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            WhatsApp
          </label>
          <input
            type="tel"
            name="whatsapp"
            defaultValue={whatsapp || ''}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            disabled
            readOnly
            className="w-full bg-[#0a0a0a] border border-gray-800 text-gray-500 p-4 cursor-not-allowed"
          />
          <p className="text-xs font-mono text-gray-600 mt-1">
            O e-mail não pode ser alterado.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : '[ Salvar alterações ]'}
          {!loading && <Save className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-800">
        <a
          href="/membros/recuperar-senha/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-yellow-500 transition-colors font-mono uppercase tracking-wider"
        >
          <KeyRound className="w-4 h-4" />
          Trocar senha
        </a>
      </div>
    </div>
  );
};

export default MinhaContaForm;
