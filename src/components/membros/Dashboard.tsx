import { AlertTriangle, CheckCircle, ShoppingCart } from 'lucide-react';
import LessonCard from './LessonCard';
import type { LessonInfo } from './LessonCard';

interface DashboardProps {
  name: string;
  accessSlugs: string[];
  completedSlugs: string[];
  mensagem?: string | null;
}

const FREE_LESSONS: Omit<LessonInfo, 'completed' | 'locked'>[] = [
  {
    slug: 'oportunidade',
    title: 'A Oportunidade',
    description: 'Entenda o cenário atual e a oportunidade que poucos estão aproveitando.',
    href: '/membros/aulas/oportunidade',
    paid: false,
  },
  {
    slug: 'demonstracao',
    title: 'Demonstração',
    description: 'Veja na prática como funciona o processo completo.',
    href: '/membros/aulas/demonstracao',
    paid: false,
  },
  {
    slug: 'como-vender',
    title: 'Como Vender',
    description: 'Aprenda a abordagem de vendas que gera resultados consistentes.',
    href: '/membros/aulas/como-vender',
    paid: false,
  },
];

const PAID_LESSONS: Omit<LessonInfo, 'completed' | 'locked'>[] = [
  {
    slug: 'introducao',
    title: 'Introdução ao Método',
    description: 'Fundamentos e visão geral do método completo.',
    href: '/membros/aulas/introducao',
    paid: true,
  },
  {
    slug: 'skills',
    title: 'Skills Essenciais',
    description: 'As habilidades técnicas que você precisa dominar.',
    href: '/membros/aulas/skills',
    paid: true,
  },
  {
    slug: 'workflow',
    title: 'Workflow Completo',
    description: 'O fluxo de trabalho otimizado do início ao fim.',
    href: '/membros/aulas/workflow',
    paid: true,
  },
  {
    slug: 'download',
    title: 'Downloads e Recursos',
    description: 'Templates, planilhas e materiais de apoio.',
    href: '/membros/aulas/download',
    paid: true,
  },
];

function buildLessons(
  templates: Omit<LessonInfo, 'completed' | 'locked'>[],
  completedSlugs: string[],
  allLocked: boolean
): LessonInfo[] {
  const lessons: LessonInfo[] = [];

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    const completed = completedSlugs.includes(template.slug);

    let locked = allLocked;
    if (!allLocked && i > 0) {
      const prevSlug = templates[i - 1].slug;
      locked = !completedSlugs.includes(prevSlug);
    }

    lessons.push({
      ...template,
      completed,
      locked,
    });
  }

  return lessons;
}

const MSG_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; border: string; text: string }> = {
  bloqueado: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'Complete as aulas anteriores para desbloquear esta aula.',
  },
  sucesso: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'Aula marcada como concluída com sucesso!',
  },
};

const Dashboard = ({ name, accessSlugs, completedSlugs, mensagem }: DashboardProps) => {
  const hasMaquinaAccess = accessSlugs.includes('maquina-videos');
  const freeLessons = buildLessons(FREE_LESSONS, completedSlugs, false);
  const paidLessons = buildLessons(PAID_LESSONS, completedSlugs, !hasMaquinaAccess);

  const msgConfig = mensagem ? MSG_CONFIG[mensagem] : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-industrial text-white uppercase mb-2">
          Bem-vindo, {name}
        </h1>
        <p className="text-gray-500 text-sm font-mono">
          {hasMaquinaAccess ? 'ACESSO COMPLETO' : 'ACESSO GRATUITO'}
        </p>
      </div>

      {/* Mensagem */}
      {msgConfig && (
        <div className={`${msgConfig.bg} border ${msgConfig.border} ${msgConfig.color} text-sm p-4 mb-8 flex items-center gap-3`}>
          <msgConfig.icon className="w-5 h-5 flex-shrink-0" />
          {msgConfig.text}
        </div>
      )}

      {/* Aulas gratuitas */}
      <div className="mb-10">
        <h2 className="font-industrial text-white uppercase text-lg mb-4 border-b border-gray-800 pb-2">
          Aulas Gratuitas
        </h2>
        <div className="space-y-3">
          {freeLessons.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </div>

      {/* CTA para checkout */}
      {!hasMaquinaAccess && (
        <div className="bg-[#111] border border-yellow-500/30 p-8 mb-10 text-center">
          <h3 className="font-industrial text-white uppercase text-xl mb-2">
            Desbloqueie o conteudo completo
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Acesse todas as aulas, templates e recursos exclusivos.
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

      {/* Aulas pagas */}
      <div className="mb-10">
        <h2 className="font-industrial text-white uppercase text-lg mb-4 border-b border-gray-800 pb-2">
          Conteudo Completo
        </h2>
        <div className="space-y-3">
          {paidLessons.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
