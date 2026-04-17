import { Play, CheckCircle, Lock } from 'lucide-react';

export interface ProductLessonItem {
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  isFree: boolean;
  completed: boolean;
}

interface ProductLessonListProps {
  lessons: ProductLessonItem[];
  nextLessonSlug: string | null;
}

const ProductLessonList = ({ lessons, nextLessonSlug }: ProductLessonListProps) => {
  if (lessons.length === 0) {
    return (
      <p className="text-gray-500 text-sm font-mono text-center py-12">
        Nenhuma aula cadastrada para este produto ainda.
      </p>
    );
  }

  // Índice da próxima aula — tudo ANTES (concluído) e a PRÓPRIA estão desbloqueadas.
  // Tudo DEPOIS está bloqueado pela regra sequencial.
  const nextIndex = nextLessonSlug
    ? lessons.findIndex((l) => l.slug === nextLessonSlug)
    : lessons.length; // se não tem próxima, tudo foi concluído

  const next = nextLessonSlug ? lessons.find((l) => l.slug === nextLessonSlug) : null;

  return (
    <div className="space-y-8">
      {next && (
        <div>
          <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider mb-2">
            Próxima aula
          </p>
          <a
            href={`/membros/aulas/${next.slug}/`}
            className="block bg-gradient-to-br from-yellow-500/10 to-[#111] border border-yellow-500/30 p-6 hover:border-yellow-500 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <Play className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex-1">
                <h3 className="font-industrial text-white uppercase text-base mb-1">
                  {next.title}
                </h3>
                {next.description && (
                  <p className="text-gray-400 text-sm">{next.description}</p>
                )}
              </div>
            </div>
          </a>
        </div>
      )}

      <div>
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-3">
          Todas as aulas
        </p>
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isCompleted = lesson.completed;
            // Bloqueada pela regra sequencial = está depois da "próxima" e não foi concluída
            const isSequentialLocked = !isCompleted && idx > nextIndex;

            if (isSequentialLocked) {
              return (
                <div
                  key={lesson.slug}
                  className="bg-[#111] border border-gray-800 p-6 opacity-50"
                >
                  <div className="flex items-start gap-4">
                    <Lock className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-industrial text-white uppercase text-sm mb-1">
                        {lesson.title}
                      </h3>
                      <p className="text-gray-600 text-[11px] font-mono uppercase tracking-wider">
                        Complete a aula anterior para desbloquear
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (isCompleted) {
              return (
                <a
                  key={lesson.slug}
                  href={`/membros/aulas/${lesson.slug}/`}
                  className="block bg-[#111] border border-gray-800 hover:border-green-500/50 p-6 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-industrial text-white uppercase text-sm">
                          {lesson.title}
                        </h3>
                        <span className="text-[10px] font-mono uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/30 px-2 py-0.5">
                          CONCLUÍDO
                        </span>
                      </div>
                      {lesson.description && (
                        <p className="text-gray-500 text-sm">{lesson.description}</p>
                      )}
                    </div>
                  </div>
                </a>
              );
            }

            // Disponível (é a próxima aula — mas também pode estar listada aqui redundantemente)
            return (
              <a
                key={lesson.slug}
                href={`/membros/aulas/${lesson.slug}/`}
                className="block bg-[#111] border border-gray-800 hover:border-yellow-500 p-6 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <Play className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <h3 className="font-industrial text-white uppercase text-sm mb-1">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-gray-500 text-sm">{lesson.description}</p>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductLessonList;
