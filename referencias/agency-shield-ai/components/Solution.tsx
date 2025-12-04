import React from 'react';
import { Zap, Database, CheckCircle2, Server, Terminal } from 'lucide-react';

const Solution: React.FC = () => {
  const deliverables = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Speed to Lead",
      desc: "Automação que chama o lead no WhatsApp em < 60 segundos. O lead pensa que é mágica. Nós sabemos que é API."
    },
    {
      icon: <Database className="w-6 h-6 text-yellow-400" />,
      title: "Reativação de Base",
      desc: "Pegamos os leads 'mortos' dos meses anteriores e esprememos dinheiro deles via campanhas de reengajamento automatizadas."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-yellow-400" />,
      title: "Qualificação via IA",
      desc: "O vendedor do seu cliente só recebe o lead pronto para passar o cartão. O 'lixo' é filtrado antes de chegar no humano."
    },
    {
      icon: <Server className="w-6 h-6 text-yellow-400" />,
      title: "Infraestrutura Própria",
      desc: "VPS Dedicada, Portainer, n8n self-hosted, Evolution API. Sem 'gambiarras' no Zapier que quebram no fim de semana."
    }
  ];

  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-500/5 -skew-x-12 transform origin-top-right pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          
          {/* Header Area */}
          <div className="md:w-1/3 sticky top-24">
            <div className="inline-flex items-center gap-2 text-yellow-500 font-mono text-sm mb-4">
               <Terminal className="w-4 h-4" />
               <span>SYSTEM_READY</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-industrial text-white mb-6 leading-none uppercase">
              Eu sou o seu braço de <span className="text-yellow-500">Tecnologia</span> e Operações.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Pare de tentar ensinar seu gestor de tráfego a configurar webhooks. Eu entro como um parceiro técnico invisível (White Label) ou estratégico.
            </p>
            <div className="h-1 w-24 bg-yellow-500"></div>
          </div>

          {/* Grid Area */}
          <div className="md:w-2/3 grid gap-6">
            {deliverables.map((item, index) => (
              <div key={index} className="flex items-start gap-6 bg-[#111] p-6 border border-gray-800 hover:border-yellow-500/50 transition-all duration-300 group">
                <div className="shrink-0 p-3 bg-black border border-gray-700 group-hover:border-yellow-500 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 font-industrial uppercase">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Solution;