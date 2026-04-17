import { Play, ShoppingCart } from 'lucide-react';

interface FreeStarterCardProps {
  firstFreeLessonSlug: string | null;
  firstFreeLessonTitle: string | null;
  firstFreeLessonDesc: string | null;
  offerPriceLabel?: string;
  offerCtaUrl?: string;
  offerProductSlug?: string;
}

const FreeStarterCard = ({
  firstFreeLessonSlug,
  firstFreeLessonTitle,
  firstFreeLessonDesc,
  offerPriceLabel = '12x R$ 92,98',
  offerCtaUrl,
  offerProductSlug = 'maquina-videos',
}: FreeStarterCardProps) => {
  return (
    <div className="space-y-8">
      {firstFreeLessonSlug && (
        <div className="bg-[#111] border border-gray-800 p-6">
          <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-wider mb-2">
            Comece gratuito
          </p>
          <h3 className="font-industrial text-white uppercase text-lg mb-1">
            {firstFreeLessonTitle}
          </h3>
          {firstFreeLessonDesc && (
            <p className="text-gray-400 text-sm mb-4">{firstFreeLessonDesc}</p>
          )}
          <a
            href={`/membros/aulas/${firstFreeLessonSlug}/`}
            className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-yellow-400 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Assistir grátis
          </a>
        </div>
      )}

      <div className="border border-gray-800 p-6">
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">
          Desbloqueie o conteúdo completo
        </p>
        <h3 className="font-industrial text-white uppercase text-lg mb-4">
          Acesse a Máquina de Produção completa
        </h3>
        {offerCtaUrl ? (
          <a
            href={offerCtaUrl}
            className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-yellow-400 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Adquirir acesso — {offerPriceLabel}
          </a>
        ) : (
          <form method="POST" action="/api/checkout">
            <input type="hidden" name="productSlug" value={offerProductSlug} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-yellow-500 text-black font-bold px-6 py-3 font-mono text-xs uppercase tracking-wider hover:bg-yellow-400 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Adquirir acesso — {offerPriceLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FreeStarterCard;
