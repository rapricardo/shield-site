import React from 'react';
import Hero from './components/Hero';
import PainCycle from './components/PainCycle';
import Solution from './components/Solution';
import BusinessModel from './components/BusinessModel';
import Authority from './components/Authority';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-300 overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      <Hero />
      <PainCycle />
      <Solution />
      <BusinessModel />
      <Authority />
      <FAQ />
      <ContactForm />
      <Footer />
    </main>
  );
};

export default App;