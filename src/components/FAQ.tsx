import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Você vai roubar meu cliente?",
      answer: "Não. Meu negócio é infraestrutura, não gestão de tráfego ou criativo. Eu sou o encanador, você é o arquiteto. Eu preciso que você continue mandando leads para minha máquina funcionar."
    },
    {
      question: "Como é a cobrança?",
      answer: "Cobro Setup + Manutenção por cliente. Contrato direto com a empresa ou via agência (whitelabel), você decide. O valor depende da complexidade do funil."
    },
    {
      question: "Serve para clientes pequenos?",
      answer: "Foco em clientes que recebem pelo menos 300 leads/mês ou têm ticket alto (Imóveis, Estética, B2B). Sem volume, a máquina fica ociosa e o ROI não justifica."
    },
    {
      question: "Qual o prazo de implementação?",
      answer: "Normalmente entre 7 a 14 dias para o setup completo, testes de carga e Go-Live."
    }
  ];

  return (
    <section className="py-24 bg-[#0f0f0f] border-t border-gray-800">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold font-industrial text-center text-white mb-16 uppercase">
          FAQ Estratégico
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border transition-all duration-300 ${openIndex === index ? 'border-yellow-500 bg-[#111]' : 'border-gray-800 bg-[#0a0a0a] hover:border-gray-600'}`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className={`font-bold uppercase font-industrial ${openIndex === index ? 'text-white' : 'text-gray-400'}`}>
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-gray-300 leading-relaxed border-t border-gray-800/50 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

