import { useState } from 'react';
import { Send, Lock } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    agencyLink: '',
    clientCount: '',
    niche: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Application submitted:', formData);
    alert('Aplicação enviada. Entrarei em contato em breve.');
  };

  return (
    <section id="application-form" className="py-24 bg-[#0a0a0a] relative bg-grid-pattern">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-2xl relative z-10">
        <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Top colored bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-industrial text-white mb-2 uppercase">
              Vamos Escalar a Sua Carteira?
            </h2>
            <p className="text-gray-500 text-sm">
              Preencha os dados abaixo para agendar a reunião de parceria.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Nome do Dono/Sócio</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Link da Agência / Instagram</label>
              <input
                type="text"
                name="agencyLink"
                required
                value={formData.agencyLink}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="www.suaagencia.com.br"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Quantos clientes ativos você tem?</label>
              <select
                name="clientCount"
                required
                value={formData.clientCount}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors appearance-none"
              >
                <option value="" disabled>Selecione uma opção</option>
                <option value="<10">Menos de 10</option>
                <option value="10-30">Entre 10 e 30</option>
                <option value="30+">Mais de 30</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Qual o nicho principal?</label>
              <input
                type="text"
                name="niche"
                required
                value={formData.niche}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
                placeholder="Ex: Imobiliário, Estética, B2B..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 group"
            >
              [ Agendar Reunião de Parceria ]
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-4">
              <Lock className="w-3 h-3" />
              <span>Seus dados estão protegidos. Sem spam.</span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;

