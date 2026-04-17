import { Play } from 'lucide-react';

interface ContinueCardProps {
  productSlug: string;
  productName: string;
  nextLessonSlug: string;
  nextLessonTitle: string;
  completed: number;
  total: number;
  percent: number;
}

const ContinueCard = ({
  productName,
  nextLessonSlug,
  nextLessonTitle,
  completed,
  total,
  percent,
}: ContinueCardProps) => {
  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-[#111] border border-yellow-500/30 p-6 mb-8">
      <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider mb-2">
        Continuar de onde parou
      </p>
      <h3 className="font-industrial text-white uppercase text-lg mb-1">{productName}</h3>
      <p className="text-gray-400 text-sm mb-4">
        Próxima aula: <span className="text-white">{nextLessonTitle}</span>
      </p>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="text-xs font-mono text-gray-500 mb-1">
            {completed} de {total} aulas · {percent}%
          </div>
          <div
            className="h-1 bg-gray-800"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-yellow-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <a
          href={`/membros/aulas/${nextLessonSlug}/`}
          className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-yellow-400 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Continuar
        </a>
      </div>
    </div>
  );
};

export default ContinueCard;
