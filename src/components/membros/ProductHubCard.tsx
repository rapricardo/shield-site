interface ProductHubCardProps {
  productSlug: string;
  productName: string;
  completed: number;
  total: number;
  percent: number;
}

const ProductHubCard = ({
  productSlug,
  productName,
  completed,
  total,
  percent,
}: ProductHubCardProps) => {
  return (
    <a
      href={`/membros/p/${productSlug}/`}
      className="block bg-[#111] border border-gray-800 hover:border-yellow-500 p-6 transition-colors group"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="font-industrial text-white uppercase text-base group-hover:text-yellow-500 transition-colors">
          {productName}
        </h3>
        <span className="text-xs font-mono text-gray-500 whitespace-nowrap">
          {completed}/{total} · {percent}%
        </span>
      </div>
      <div
        className="h-1 bg-gray-800 w-full"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso em ${productName}: ${percent} por cento`}
      >
        <div
          className="h-full bg-yellow-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </a>
  );
};

export default ProductHubCard;
