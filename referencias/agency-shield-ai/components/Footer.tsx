import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 bg-black border-t border-gray-900 text-center">
      <div className="container mx-auto px-6">
        <p className="text-gray-600 text-sm font-mono">
          © {new Date().getFullYear()} Agency Shield AI. Infraestrutura de Retenção.
        </p>
        <p className="text-gray-800 text-xs mt-2 uppercase tracking-widest">
          Não vendemos sonhos. Vendemos sistemas.
        </p>
      </div>
    </footer>
  );
};

export default Footer;