"use client";

import React from 'react';
import { Snowflake, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white dark:bg-slate-950 border-b border-blue-100 dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Snowflake className="h-8 w-8 text-blue-600" />
              <div>
                <span className="text-xl font-bold text-blue-900 dark:text-white block leading-none">LIDER REFRIGERAÇÃO</span>
                <span className="text-[10px] text-blue-500 uppercase tracking-widest font-medium">Manutenção Preventiva e Corretiva</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#servicos" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Serviços</a>
            <a href="#sobre" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Sobre Nós</a>
            <a href="#contato" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Contato</a>
            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="text-blue-900 dark:text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-blue-50 dark:border-slate-800 p-4 space-y-4">
          <a href="#servicos" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 font-medium">Serviços</a>
          <a href="#sobre" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 font-medium">Sobre Nós</a>
          <a href="#contato" onClick={() => setIsOpen(false)} className="block text-gray-600 dark:text-gray-300 font-medium">Contato</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;