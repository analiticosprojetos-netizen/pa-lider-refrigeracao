"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Snowflake, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Banner {
  id: string;
  url: string;
  zoom: number;
  rotate: number;
}

interface BannerCarouselProps {
  banners: Banner[];
  onContactClick: () => void;
  delay?: number;
}

const BannerCarousel = ({ banners, onContactClick, delay = 6 }: BannerCarouselProps) => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: delay * 1000, stopOnInteraction: false })
  ]);

  return (
    <section className="relative overflow-hidden border-b-8 border-blue-800 h-[500px] md:h-[450px]">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          
          {/* BANNER 1: OFICIAL (Fundo Azul Sólido) */}
          <div className="embla__slide relative h-full flex-shrink-0 w-full bg-[#1a365d]">
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <Snowflake className="absolute top-10 left-10 text-white w-8 h-8" />
              <Snowflake className="absolute bottom-10 right-10 text-white w-14 h-14" />
            </div>
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <OfficialBannerContent onContactClick={onContactClick} />
              </div>
            </div>
          </div>

          {/* BANNERS DE IMAGEM (Upload do Usuário) */}
          {banners.map((banner) => (
            <div key={banner.id} className="embla__slide relative h-full flex-shrink-0 w-full">
              <div className="absolute inset-0 overflow-hidden">
                <img 
                  src={banner.url} 
                  alt="Banner" 
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: `scale(${banner.zoom / 100}) rotate(${banner.rotate}deg)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent" />
              </div>
              
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <OfficialBannerContent onContactClick={onContactClick} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const OfficialBannerContent = ({ onContactClick }: { onContactClick: () => void }) => {
  const [settings, setSettings] = React.useState({
    address: 'Av. Industrial, 1000 - Setor de Transportes',
    latitude: '',
    longitude: ''
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('lider_site_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({
        address: parsed.address || 'Av. Industrial, 1000 - Setor de Transportes',
        latitude: parsed.latitude || '',
        longitude: parsed.longitude || ''
      });
    }
  }, []);

  // No Banner, usamos estritamente Latitude e Longitude para abrir o mapa no ponto exato
  const mapsUrl = (settings.latitude && settings.longitude)
    ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
      <div className="text-center lg:text-left flex-1">
        <div className="space-y-0">
          <h1 className="text-6xl md:text-8xl font-black text-white italic leading-none tracking-tighter drop-shadow-lg">
            LÍDER
          </h1>
          <h2 className="text-4xl md:text-6xl font-black text-white italic leading-none tracking-tighter drop-shadow-lg">
            REFRIGERAÇÃO
          </h2>
        </div>
        <div className="mt-6 inline-block border-2 border-white/30 bg-blue-900/20 backdrop-blur-sm px-6 py-2 rounded-full">
          <p className="text-white text-sm md:text-base font-bold uppercase tracking-[0.2em]">
            Manutenção Preventivas e Corretivas
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center lg:items-end gap-6">
        <div className="bg-blue-800/40 backdrop-blur-md p-6 rounded-2xl border-l-4 border-blue-400 max-w-md text-center lg:text-left">
          <h3 className="text-lg md:text-xl font-bold text-white uppercase mb-2 leading-tight">
            Reformas e Manutenção em Baús Frigoríficos
          </h3>
          <p className="text-blue-100 text-xs md:text-sm">
            Especialistas em Thermo King para baú de caminhão e carretas.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button 
            onClick={onContactClick}
            className="bg-blue-500 hover:bg-blue-400 text-white font-black px-8 py-7 text-lg rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] transform hover:scale-105 transition-all uppercase tracking-wider"
          >
            Solicitar Orçamento
          </Button>
          
          <a 
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 hover:bg-blue-50 font-black px-8 py-4 text-lg rounded-xl shadow-xl transform hover:scale-105 transition-all uppercase tracking-wider"
          >
            <MapPin size={24} className="text-blue-600" />
            Como Chegar
          </a>
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;