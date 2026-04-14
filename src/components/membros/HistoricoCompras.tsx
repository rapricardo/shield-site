import { Receipt } from 'lucide-react';

interface Pagamento {
  id: string;
  asaas_payment_id: string | null;
  product_slug: string;
  product_name: string;
  amount: number; // em centavos
  status: string;
  created_at: string;
}

interface Props {
  pagamentos: Pagamento[];
}

function formatarData(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatarValor(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Pago',
  pending: 'Pendente',
  failed: 'Falhou',
  refunded: 'Estornado',
  cancelled: 'Cancelado',
};

function statusBadge(status: string) {
  const label = STATUS_LABEL[status] || status;
  if (status === 'completed') {
    return (
      <span className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono uppercase tracking-wider px-2 py-1">
        {label}
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-block bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono uppercase tracking-wider px-2 py-1">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-block bg-gray-700/30 border border-gray-700 text-gray-400 text-xs font-mono uppercase tracking-wider px-2 py-1">
      {label}
    </span>
  );
}

const HistoricoCompras = ({ pagamentos }: Props) => {
  if (!pagamentos || pagamentos.length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-gray-800 p-6 flex items-center gap-3">
        <Receipt className="w-5 h-5 text-gray-600 flex-shrink-0" />
        <p className="text-gray-500 text-sm">Nenhuma compra registrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 overflow-hidden">
      {/* Cabeçalho — visível só em md+ */}
      <div className="hidden md:grid md:grid-cols-[120px_1fr_120px_120px] gap-4 px-4 py-3 border-b border-gray-800 bg-[#111]">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Data</span>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">Produto</span>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider text-right">Valor</span>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-wider text-center">Status</span>
      </div>

      <div className="divide-y divide-gray-800">
        {pagamentos.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-2 md:grid-cols-[120px_1fr_120px_120px] gap-2 md:gap-4 px-4 py-4 items-center"
          >
            <span className="text-gray-400 text-sm font-mono order-1 md:order-none">
              {formatarData(p.created_at)}
            </span>
            <span className="text-white text-sm font-industrial uppercase order-3 md:order-none col-span-2 md:col-span-1 truncate">
              {p.product_name}
            </span>
            <span className="text-white text-sm font-mono md:text-right order-2 md:order-none">
              {formatarValor(p.amount)}
            </span>
            <span className="md:text-center order-4 md:order-none col-span-2 md:col-span-1">
              {statusBadge(p.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoricoCompras;
