"use client";

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Snowflake } from 'lucide-react';
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
}

const BannerCarousel = ({ banners, onContactClick }: BannerCarouselProps) => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  // Se não houver banners, mostra o design padrão azul
  if (banners.length === 0) {
    return (
      <section className="relative bg-[#1a365d] py-16 md:py-24 overflow-hidden border-b-8 border-blue-800">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Snowflake className="absolute top-10 left-10 text-white w-8 h-8" />
          <Snowflake className="absolute top-1/2 right-10 text-white w-14 h-14" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <BannerContent onContactClick={onContactClick} />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b-8 border-blue-800 h-[500px] md:h-[600px]">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {banners.map((banner) => (
            <div key={banner.id} className="embla__slide relative h-full flex-shrink-0 w-full">
              {/* Imagem de Fundo com Ajustes */}
              <div className="absolute inset-0 overflow-hidden">
                <img 
                  src={banner.url} 
                  alt="Banner" 
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ transform: `scale(${banner.zoom / 100}) rotate(${banner.rotate}deg)` }}
                />
                {/* Overlay para garantir leitura do texto */}
                <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-[2px]" />
              </div>
              
              {/* Conteúdo sobreposto */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <BannerContent onContactClick={onContactClick} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BannerContent = ({ onContactClick }: { onContactClick: () => void }) => (
  <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
    <div className="text-center lg:text-left flex-1">
      <div className="inline-block transform -skew-x-12">
        <h1 className="text-6xl md:text-8xl font-black text-white italic leading-none tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
          LÍDER
        </h1>
        <h2 className="text-4xl md:text-6xl font-black text-white italic leading-none tracking-tighter mt-2 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
          REFRIGERAÇÃO
        </h2>
      </div>
      <div className="mt-8 bg-white/10 backdrop-blur-sm inline-block px-6 py-2 rounded-full border border-white/20">
        <p className="text-white text-lg md:text-xl font-bold uppercase tracking-widest">
          Manutenção Preventivas e Corretivas
        </p>
      </div>
    </div>

    <div className="flex-1 text-white space-y-8">
      <div className="bg-blue-900/40 p-6 rounded-2xl border-l-4 border-blue-400">
        <h3 className="text-xl font-bold uppercase mb-2">Reformas e Manutenção em Baús Frigoríficos</h3>
        <p className="text-blue-200 text-sm">Especialistas em Thermo King para baú de caminhão e carretas.</p>
      </div>
      <div className="pt-4">
        <Button 
          onClick={onContactClick}
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all w-full md:w-auto"
        >
          SOLICITAR ORÇAMENTO AGORA
        </Button>
      </div>
    </div>
  </div>
);

export default BannerCarousel;