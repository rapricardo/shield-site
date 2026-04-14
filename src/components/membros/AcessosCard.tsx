import { CheckCircle, Lock } from 'lucide-react';

interface AcessoItem {
  product_slug: string;
  product_name: string;
  granted_at: string;
}

interface Props {
  acessos: AcessoItem[];
}

function formatarData(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(iso));
  } catch {
    return iso;
  }
}

const AcessosCard = ({ acessos }: Props) => {
  if (!acessos || acessos.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-gray-800 p-6 flex items-center gap-3">
        <Lock className="w-5 h-5 text-gray-600 flex-shrink-0" />
        <p className="text-gray-500 text-sm">
          Você ainda não possui acessos. Explore nossos produtos para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {acessos.map((acesso) => (
        <div
          key={acesso.product_slug}
          className="bg-[#0a0a0a] border border-gray-800 p-4 flex items-center gap-4 hover:border-yellow-500/50 transition-colors"
        >
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-industrial uppercase text-sm truncate">
              {acesso.product_name}
            </p>
            <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mt-1">
              Liberado em: {formatarData(acesso.granted_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AcessosCard;
