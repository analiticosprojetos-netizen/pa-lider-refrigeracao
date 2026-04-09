"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const [settings, setSettings] = React.useState({
    companyName: 'LIDER REFRIGERAÇÃO',
    whatsapp: '(11) 99999-9999',
    email: 'contato@liderefrigeracao.com.br',
    address: 'Av. Industrial, 1000 - Setor de Transportes',
    latitude: '',
    longitude: ''
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('lider_site_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const mapsUrl = settings.latitude && settings.longitude 
    ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

  return (
    <footer className="bg-blue-900 text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{settings.companyName}</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Especialistas em refrigeração de transportes. Atendimento técnico qualificado para caminhões e carretas.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-sm text-blue-200">
              <div className="flex items-center gap-2"><Phone size={16} /> {settings.whatsapp}</div>
              <div className="flex items-center gap-2"><Mail size={16} /> {settings.email}</div>
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MapPin size={16} /> {settings.address}
              </a>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <h4 className="font-semibold mb-4">Acesso Restrito</h4>
            <Link 
              to="/login" 
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-blue-700"
            >
              <Settings size={16} />
              GESTÃO
            </Link>
          </div>
        </div>
        <div className="border-t border-blue-800 pt-6 text-center text-xs text-blue-400">
          © {new Date().getFullYear()} {settings.companyName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;