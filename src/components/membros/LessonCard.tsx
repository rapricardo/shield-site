import { Lock, Play, CheckCircle } from 'lucide-react';

export interface LessonInfo {
  slug: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  locked: boolean;
  paid: boolean;
  sequentialLocked?: boolean;
}

interface LessonCardProps {
  lesson: LessonInfo;
}

const LessonCard = ({ lesson }: LessonCardProps) => {
  const { title, description, href, completed, locked, paid, sequentialLocked } = lesson;

  // Estado: bloqueada pela regra sequencial
  if (sequentialLocked) {
    return (
      <div className="bg-[#111] border border-gray-800 p-6 opacity-50 relative">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <Lock className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-industrial text-white uppercase text-sm mb-1">{title}</h3>
            <p className="text-gray-600 text-[11px] font-mono uppercase tracking-wider">
              Complete a aula anterior para desbloquear
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: bloqueada (sem acesso ao produto)
  if (locked) {
    return (
      <div className="bg-[#111] border border-gray-800 p-6 opacity-50 relative">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <Lock className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-industrial text-white uppercase text-sm">{title}</h3>
              {paid && (
                <span className="text-[10px] font-mono uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-2 py-0.5">
                  CONTEUDO PAGO
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: concluída
  if (completed) {
    return (
      <a href={href} className="block bg-[#111] border border-gray-800 hover:border-green-500/50 p-6 transition-colors relative group">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-industrial text-white uppercase text-sm">{title}</h3>
              <span className="text-[10px] font-mono uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/30 px-2 py-0.5">
                CONCLUIDO
              </span>
            </div>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
      </a>
    );
  }

  // Estado: disponível
  return (
    <a href={href} className="block bg-[#111] border border-gray-800 hover:border-yellow-500 p-6 transition-colors relative group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <Play className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="flex-1">
          <h3 className="font-industrial text-white uppercase text-sm mb-1">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
    </a>
  );
};

export default LessonCard;
