import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

const BusinessModel: React.FC = () => {
  return (
    <section className="py-24 bg-[#0f0f0f] border-t border-b border-gray-800">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2 className="text-3xl md:text-5xl font-bold font-industrial text-center text-white mb-16 uppercase">
          Como funciona a parceria
        </h2>

        <div className="grid md:grid-cols-2 gap-0 border border-gray-700 bg-[#0a0a0a]">
          
          {/* Client Column */}
          <div className="p-10 border-b md:border-b-0 md:border-r border-gray-700 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-600 group-hover:bg-gray-400 transition-colors"></div>
            <h3 className="text-2xl font-bold font-industrial text-gray-400 mb-8 uppercase tracking-wide">
              Para o Seu Cliente
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center mt-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-gray-300">Aumento imediato de conversão (Lead -&gt; Agendamento).</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center mt-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-gray-300">Fim da briga Marketing vs. Vendas.</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center mt-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-gray-300">Sensação de que a <strong className="text-white">Sua Agência</strong> resolveu o problema de faturamento dele.</p>
              </li>
            </ul>
          </div>

          {/* Agency Column */}
          <div className="p-10 relative bg-yellow-900/5 group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-600 group-hover:bg-yellow-400 transition-colors"></div>
            <h3 className="text-2xl font-bold font-industrial text-yellow-500 mb-8 uppercase tracking-wide flex items-center gap-2">
              Para a Sua Agência <ArrowRight className="w-5 h-5" />
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-1">
                  <Check className="w-3 h-3 text-yellow-500" />
                </div>
                <div>
                  <strong className="text-white block mb-1 font-industrial">Setup Fee & Markup</strong>
                  <p className="text-sm text-gray-400">Você pode cobrar um markup sobre o meu serviço ou repassar direto como custo operacional.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-1">
                  <Check className="w-3 h-3 text-yellow-500" />
                </div>
                <div>
                  <strong className="text-white block mb-1 font-industrial">Retenção Brutal</strong>
                  <p className="text-sm text-gray-400">Cliente que vende não cancela. O churn despenca.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center mt-1">
                  <Check className="w-3 h-3 text-yellow-500" />
                </div>
                <div>
                  <strong className="text-white block mb-1 font-industrial">Diferencial Competitivo</strong>
                  <p className="text-sm text-gray-400">"Nós somos a única agência que entrega Leads + Máquina de Vendas".</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BusinessModel;