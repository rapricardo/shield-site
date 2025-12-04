import React from 'react';
import { AlertTriangle, TrendingDown, Users, DollarSign } from 'lucide-react';

const PainCycle: React.FC = () => {
  return (
    <section className="py-24 bg-[#0f0f0f] border-b border-gray-800">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold font-industrial text-white mb-16 text-center uppercase tracking-tight">
          <span className="text-red-600 mr-3">⚠</span> O Ciclo da Morte da Agência
        </h2>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-green-900 via-yellow-900 to-red-900 z-0"></div>

          {/* Step 1 */}
          <div className="relative z-10 bg-[#0a0a0a] p-8 border border-gray-800 hover:border-gray-600 transition-colors group">
            <div className="w-16 h-16 bg-green-900/20 border border-green-700/50 rounded-none mb-6 flex items-center justify-center mx-auto group-hover:bg-green-900/30 transition-colors">
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 text-center font-industrial uppercase">1. O Tráfego</h3>
            <p className="text-gray-400 text-center leading-relaxed">
              Você faz um trabalho incrível no Google/Meta Ads. O CPL está ótimo. O volume está alto. Sua parte está feita.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 bg-[#0a0a0a] p-8 border border-gray-800 hover:border-yellow-600/50 transition-colors group">
            <div className="w-16 h-16 bg-yellow-900/20 border border-yellow-700/50 rounded-none mb-6 flex items-center justify-center mx-auto group-hover:bg-yellow-900/30 transition-colors">
              <TrendingDown className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 text-center font-industrial uppercase">2. O Gargalo</h3>
            <p className="text-gray-400 text-center leading-relaxed">
              O comercial do cliente demora 4 horas para responder. Ou nem responde. O lead esfria e compra do concorrente.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 bg-[#0a0a0a] p-8 border border-red-900/30 hover:border-red-600 transition-colors group">
            <div className="w-16 h-16 bg-red-900/20 border border-red-700/50 rounded-none mb-6 flex items-center justify-center mx-auto group-hover:bg-red-900/30 transition-colors">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4 text-center font-industrial uppercase">3. A Culpa</h3>
            <p className="text-gray-400 text-center leading-relaxed">
              O cliente diz: <span className="italic text-red-400">"Esses leads são desqualificados"</span>. O ROI some. Ele te demite.
            </p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gray-900/50 border-l-4 border-yellow-500 max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-gray-300 font-medium italic">
            "Você sabe que a culpa não é do tráfego. Mas discutir com o cliente não paga boleto. A única forma de salvar o <span className="text-white font-bold not-italic">LTV</span> da sua agência é assumir o controle do processo de vendas do cliente. Mas você não tem braço para isso. <span className="text-yellow-500 font-bold not-italic bg-yellow-900/10 px-1">Eu tenho.</span>"
          </p>
        </div>
      </div>
    </section>
  );
};

export default PainCycle;