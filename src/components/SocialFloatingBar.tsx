"use client";

import React from 'react';
import { MessageCircle, Instagram, Facebook } from 'lucide-react';

const SocialFloatingBar = () => {
  const [settings, setSettings] = React.useState({
    whatsapp: '5511999999999',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('lider_site_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const whatsappUrl = `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`;

  return (
    <div className="fixed right-4 bottom-1/2 translate-y-1/2 z-50 flex flex-col gap-3">
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        title="WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
      <a 
        href={settings.instagram} 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-[#E4405F] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        title="Instagram"
      >
        <Instagram size={28} />
      </a>
      <a 
        href={settings.facebook} 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-[#1877F2] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        title="Facebook"
      >
        <Facebook size={28} />
      </a>
    </div>
  );
};

export default SocialFloatingBar;