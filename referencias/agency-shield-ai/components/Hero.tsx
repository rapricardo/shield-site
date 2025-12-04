import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center border-b border-gray-800 bg-grid-pattern overflow-hidden pt-20 pb-20">
      {/* Decorative Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-5xl text-center">
        
        {/* Top Tagline */}
        <div className="inline-flex items-center gap-2 border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 rounded-sm mb-8 animate-fade-in-up">
          <Cpu className="w-4 h-4 text-yellow-500" />
          <span className="text-yellow-500 text-xs font-bold tracking-widest uppercase font-industrial">
            Parceria Estratégica Para Agências de Performance (B2B2B)
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-industrial text-white leading-[1.1] mb-8 uppercase tracking-tight">
          Pare de perder contratos porque seu cliente <span className="text-yellow-500 bg-yellow-900/20 px-2">não sabe vender</span> os leads que você gera.
        </h1>

        {/* Sub-headline */}
        <div className="max-w-3xl mx-auto space-y-6 text-lg md:text-xl text-gray-400 font-light mb-12 border-l-2 border-yellow-500/50 pl-6 text-left md:text-center md:border-l-0 md:pl-0">
          <p>
            Você entrega o tráfego. O cliente reclama que "o lead é ruim". O cliente cancela.
          </p>
          <p className="text-gray-200 font-medium">
            Eu instalo a <strong className="text-white">Infraestrutura de IA (n8n + Agentes)</strong> dentro do seu cliente que atende, qualifica e agenda reuniões em 30 segundos.
          </p>
          <p className="text-yellow-500 font-bold uppercase tracking-wide">
            O cliente vende mais. Você retém o contrato. Nós lucramos.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={scrollToForm}
            className="group relative px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg uppercase tracking-wider transition-all clip-path-polygon hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            [ Quero Blindar Meus Contratos ]
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            Parceria Exclusiva • Limite de 5 Agências/Trimestre
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;