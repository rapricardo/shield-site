import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import CohortCard from './CohortCard';
import ContinueCard from './ContinueCard';
import FreeStarterCard from './FreeStarterCard';
import ProductHubCard from './ProductHubCard';

interface ProductProgress {
  productSlug: string;
  productName: string;
  total: number;
  completed: number;
  percent: number;
}

interface ContinueFrom {
  productSlug: string;
  productName: string;
  nextLessonSlug: string;
  nextLessonTitle: string;
  completed: number;
  total: number;
  percent: number;
}

interface FreeStarter {
  slug: string;
  title: string;
  description: string;
}

interface EnrolledCohortProp {
  cohort_id: string;
  name: string;
  product_name: string;
  starts_at: string;
  ends_at: string;
  meet_url: string | null;
  notes: string | null;
}

interface DashboardProps {
  name: string;
  isAdmin: boolean;
  products: ProductProgress[];
  continueFrom: ContinueFrom | null;
  freeStarter: FreeStarter | null;
  cohorts: EnrolledCohortProp[];
  mensagem?: string | null;
}

const MSG_CONFIG: Record<
  string,
  {
    icon: typeof AlertTriangle;
    color: string;
    bg: string;
    border: string;
    text: string;
  }
> = {
  bloqueado: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'Você não tem acesso a esse conteúdo. Desbloqueie abaixo.',
  },
  sucesso: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'Compra confirmada. Bem-vindo ao conteúdo completo.',
  },
  'senha-atualizada': {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'Senha atualizada com sucesso.',
  },
};

const Dashboard = ({
  name,
  isAdmin,
  products,
  continueFrom,
  freeStarter,
  cohorts,
  mensagem,
}: DashboardProps) => {
  const msgConfig = mensagem ? MSG_CONFIG[mensagem] : null;
  const hasProducts = products.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-industrial text-white uppercase mb-2">
            Bem-vindo, {name}
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            {hasProducts ? 'ACESSO COMPLETO' : 'ACESSO GRATUITO'}
          </p>
        </div>
        {isAdmin && (
          <a
            href="/admin/"
            className="inline-flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-mono uppercase tracking-wider px-3 py-2 hover:bg-yellow-500/20 transition-colors shrink-0"
          >
            <Shield className="w-3 h-3" />
            Admin
          </a>
        )}
      </div>

      {/* Mensagem de status */}
      {msgConfig && (
        <div
          className={`${msgConfig.bg} border ${msgConfig.border} ${msgConfig.color} text-sm p-4 mb-8 flex items-center gap-3`}
        >
          <msgConfig.icon className="w-5 h-5 flex-shrink-0" />
          {msgConfig.text}
        </div>
      )}

      {/* Continuar de onde parou */}
      {continueFrom && <ContinueCard {...continueFrom} />}

      {/* Minhas turmas (mentoria) */}
      {cohorts.length > 0 && (
        <div className="mb-10">
          <h2 className="font-industrial text-white uppercase text-lg mb-4 border-b border-gray-800 pb-2">
            Minhas Turmas
          </h2>
          <div className="space-y-4">
            {cohorts.map((c) => (
              <CohortCard key={c.cohort_id} cohort={c} />
            ))}
          </div>
        </div>
      )}

      {/* Meus produtos */}
      {hasProducts && (
        <div className="mb-10">
          <h2 className="font-industrial text-white uppercase text-lg mb-4 border-b border-gray-800 pb-2">
            Meus Produtos
          </h2>
          <div className="space-y-4">
            {products.map((p) => (
              <ProductHubCard key={p.productSlug} {...p} />
            ))}
          </div>
        </div>
      )}

      {/* Sem acesso — preview gratuita + CTA */}
      {!hasProducts && (
        <FreeStarterCard
          firstFreeLessonSlug={freeStarter?.slug || null}
          firstFreeLessonTitle={freeStarter?.title || null}
          firstFreeLessonDesc={freeStarter?.description || null}
        />
      )}
    </div>
  );
};

export default Dashboard;
