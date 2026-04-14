import { AlertTriangle, CheckCircle, ShoppingCart, Shield } from 'lucide-react';
import LessonCard from './LessonCard';
import type { LessonInfo } from './LessonCard';
import CohortCard from './CohortCard';

interface LessonFromDB {
  id: string;
  product_slug: string;
  slug: string;
  title: string;
  description: string | null;
  type: string;
  is_free: boolean;
  order_index: number;
  category: string;
}

interface CategoryGroupProps {
  category: string;
  label: string;
  description: string;
  lessons: LessonFromDB[];
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
  accessSlugs: string[];
  completedSlugs: string[];
  mensagem?: string | null;
  categories: CategoryGroupProps[];
  isAdmin: boolean;
  cohorts: EnrolledCohortProp[];
}

const MSG_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; border: string; text: string }> = {
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

function buildLessonInfo(lesson: LessonFromDB, accessSlugs: string[], completedSlugs: string[]): LessonInfo {
  const hasAccess = lesson.is_free || accessSlugs.includes(lesson.product_slug);
  return {
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description || '',
    href: `/membros/aulas/${lesson.slug}/`,
    completed: completedSlugs.includes(lesson.slug),
    locked: !hasAccess,
    paid: !lesson.is_free,
  };
}

const Dashboard = ({ name, accessSlugs, completedSlugs, mensagem, categories, isAdmin, cohorts }: DashboardProps) => {
  const hasMaquinaAccess = accessSlugs.includes('maquina-videos');
  const msgConfig = mensagem ? MSG_CONFIG[mensagem] : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-industrial text-white uppercase mb-2">
            Bem-vindo, {name}
          </h1>
          <p className="text-gray-500 text-sm font-mono">
            {hasMaquinaAccess ? 'ACESSO COMPLETO' : 'ACESSO GRATUITO'}
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

      {/* Minhas Turmas */}
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

      {/* Mensagem */}
      {msgConfig && (
        <div className={`${msgConfig.bg} border ${msgConfig.border} ${msgConfig.color} text-sm p-4 mb-8 flex items-center gap-3`}>
          <msgConfig.icon className="w-5 h-5 flex-shrink-0" />
          {msgConfig.text}
        </div>
      )}

      {/* CTA de compra se não tiver acesso à máquina */}
      {!hasMaquinaAccess && (
        <div className="bg-[#111] border border-yellow-500/30 p-8 mb-10 text-center">
          <h3 className="font-industrial text-white uppercase text-xl mb-2">
            Desbloqueie o conteúdo completo
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Acesse a Máquina de Produção completa: 66 arquivos, skills e templates prontos.
          </p>
          <form method="POST" action="/api/checkout">
            <input type="hidden" name="productSlug" value="maquina-videos" />
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 px-8 uppercase tracking-widest transition-all inline-flex items-center gap-2 group"
              style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              [ Adquirir Acesso Completo — 12x R$ 92,98 ]
            </button>
          </form>
        </div>
      )}

      {/* Categorias de aulas */}
      {categories.length === 0 && (
        <p className="text-gray-500 text-sm font-mono text-center py-12">
          Nenhuma aula disponível ainda.
        </p>
      )}

      {categories.map((cat) => (
        <div key={cat.category} className="mb-10">
          <div className="mb-4 border-b border-gray-800 pb-2">
            <h2 className="font-industrial text-white uppercase text-lg">
              {cat.label}
            </h2>
            {cat.description && (
              <p className="text-gray-600 text-xs font-mono mt-1">{cat.description}</p>
            )}
          </div>
          <div className="space-y-3">
            {cat.lessons.map((lesson) => (
              <LessonCard
                key={lesson.slug}
                lesson={buildLessonInfo(lesson, accessSlugs, completedSlugs)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
