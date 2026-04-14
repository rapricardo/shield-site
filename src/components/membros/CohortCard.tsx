import { Video, Calendar, ExternalLink } from 'lucide-react';

interface Cohort {
  cohort_id: string;
  name: string;
  product_name: string;
  starts_at: string;
  ends_at: string;
  meet_url: string | null;
  notes: string | null;
}

interface Props {
  cohort: Cohort;
}

export default function CohortCard({ cohort }: Props) {
  const formatDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(cohort.starts_at + 'T00:00:00');
  const endDate = new Date(cohort.ends_at + 'T00:00:00');

  let status: 'upcoming' | 'active' | 'ended' = 'active';
  if (today < startDate) status = 'upcoming';
  else if (today > endDate) status = 'ended';

  const statusLabel = {
    upcoming: 'PRÓXIMA',
    active: 'EM ANDAMENTO',
    ended: 'ENCERRADA',
  }[status];

  const statusColor = {
    upcoming: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
    active: 'text-green-500 border-green-500/30 bg-green-500/10',
    ended: 'text-gray-500 border-gray-500/30 bg-gray-500/10',
  }[status];

  return (
    <div className="bg-[#111] border border-yellow-500/30 p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
            {cohort.product_name}
          </p>
          <h3 className="font-industrial text-white uppercase text-xl">
            {cohort.name}
          </h3>
        </div>
        <span className={`text-xs font-mono border px-2 py-1 shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Calendar className="w-4 h-4 shrink-0" />
        <span>
          {formatDate(cohort.starts_at)} — {formatDate(cohort.ends_at)}
        </span>
      </div>

      {cohort.notes && (
        <p className="text-gray-400 text-sm mb-4 leading-relaxed whitespace-pre-line">
          {cohort.notes}
        </p>
      )}

      {cohort.meet_url && status !== 'ended' ? (
        <a
          href={cohort.meet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-5 uppercase tracking-widest text-xs transition-all"
        >
          <Video className="w-4 h-4" />
          Entrar na Sessão
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : status === 'ended' ? (
        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider">
          Turma encerrada. Gravações em breve na página de aulas.
        </p>
      ) : (
        <p className="text-xs font-mono text-gray-600 uppercase tracking-wider">
          Link da sessão será disponibilizado em breve.
        </p>
      )}
    </div>
  );
}
