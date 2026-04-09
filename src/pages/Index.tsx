"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialFloatingBar from '@/components/SocialFloatingBar';
import { 
  Truck, 
  ShieldCheck, 
  Award, 
  ThermometerSnowflake, 
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Snowflake
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const [settings, setSettings] = React.useState({
    whatsapp: '11999999999',
    email: 'contato@liderefrigeracao.com.br',
    address: 'Av. Industrial, 1000 - Setor de Transportes'
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('lider_site_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    (e.target as HTMLFormElement).reset();
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById('contato');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D2C6C]">
      <Navbar />
      <SocialFloatingBar />
      
      {/* Hero Section - Design Premium com Glow e Degradê */}
      <section className="relative py-20 md:py-32 overflow-hidden border-b-4 border-[#1E5BB8]/30">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D2C6C] via-[#1a365d] to-[#0D2C6C]"></div>
        
        {/* Flocos de Neve com Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Snowflake className="absolute top-10 left-10 text-[#66D1FF] w-8 h-8 animate-pulse" />
          <Snowflake className="absolute top-40 left-1/4 text-white w-12 h-12 animate-bounce" />
          <Snowflake className="absolute bottom-20 left-20 text-[#66D1FF] w-6 h-6" />
          <Snowflake className="absolute top-20 right-1/3 text-white w-10 h-10 animate-pulse" />
          <Snowflake className="absolute bottom-10 right-1/4 text-[#66D1FF] w-8 h-8" />
          <Snowflake className="absolute top-1/2 right-10 text-white w-14 h-14 animate-spin-slow" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            
            <div className="text-center lg:text-left flex-1">
              <div className="inline-block transform -skew-x-12">
                <h1 className="text-7xl md:text-9xl font-black text-white italic leading-none tracking-tighter glow-text">
                  LÍDER
                </h1>
                <h2 className="text-4xl md:text-6xl font-black text-[#66D1FF] italic leading-none tracking-tighter mt-2 drop-shadow-lg">
                  REFRIGERAÇÃO
                </h2>
              </div>
              
              <div className="mt-10 bg-white/5 backdrop-blur-md inline-block px-8 py-3 rounded-full border border-[#66D1FF]/30 shadow-[0_0_15px_rgba(102,209,255,0.2)]">
                <p className="text-white text-lg md:text-xl font-bold uppercase tracking-[0.2em]">
                  Manutenção Preventiva e Corretiva
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-8 w-full max-w-xl">
              <div className="bg-[#1E5BB8]/20 backdrop-blur-sm p-8 rounded-3xl border-l-8 border-[#66D1FF] shadow-2xl">
                <h3 className="text-2xl font-black uppercase mb-3 text-white">Reformas e Manutenção em Baús Frigoríficos</h3>
                <p className="text-[#66D1FF] font-medium">Especialistas em Thermo King para baú de caminhão e carretas.</p>
              </div>

              <div className="space-y-6">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[#66D1FF]/80">Representante Autorizada:</p>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="bg-white px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transform hover:scale-105 transition-transform">
                    <span className="text-[#0D2C6C] font-black italic text-2xl">Carrier</span>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-xl flex flex-col items-center justify-center leading-none shadow-[0_0_20px_rgba(255,255,255,0.2)] transform hover:scale-105 transition-transform">
                    <span className="text-[#1E5BB8] text-[12px] font-black uppercase">Thermo Star</span>
                    <div className="h-1.5 w-full bg-[#1E5BB8] mt-1 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={scrollToContact}
                  className="btn-gradient w-full md:w-auto px-12 py-8 text-xl rounded-2xl uppercase tracking-wider"
                >
                  SOLICITAR ORÇAMENTO AGORA
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Especialidades com Cards Escuros e Glow */}
      <section id="servicos" className="py-24 bg-[#0D2C6C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Nossas Especialidades</h2>
            <div className="w-24 h-2 bg-gradient-to-r from-[#1E5BB8] to-[#66D1FF] mx-auto rounded-full shadow-[0_0_10px_rgba(102,209,255,0.5)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Baús Frigoríficos", desc: "Reformas completas e manutenção estrutural." },
              { icon: Award, title: "Autorizada", desc: "Representante oficial Carrier e Thermo Star." },
              { icon: ThermometerSnowflake, title: "Thermo King", desc: "Especialistas certificados em sistemas Thermo King." },
              { icon: CheckCircle2, title: "Transporte", desc: "Soluções completas para transporte refrigerado." }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#1E5BB8]/10 p-10 rounded-[2rem] border border-[#1E5BB8]/30 hover:border-[#66D1FF]/50 transition-all group hover:-translate-y-2 shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1E5BB8] to-[#2FA4FF] rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:shadow-[#66D1FF]/40 transition-all">
                  <item.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-[#66D1FF]/80 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato com Design de Alto Contraste */}
      <section id="contato" className="py-24 bg-[#0D2C6C] relative">
        <div className="absolute inset-0 bg-[#1E5BB8]/5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-[#1E5BB8]/20 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-[#66D1FF]/20">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-20 bg-gradient-to-br from-[#1E5BB8] to-[#0D2C6C] text-white">
                <h2 className="text-4xl font-black mb-12 glow-text uppercase">Fale Conosco</h2>
                <div className="space-y-10">
                  <div className="flex items-center gap-6 group">
                    <div className="bg-[#66D1FF]/20 p-4 rounded-2xl group-hover:bg-[#66D1FF]/40 transition-colors"><Phone size={28} className="text-[#66D1FF]" /></div>
                    <div>
                      <p className="text-[#66D1FF] text-xs font-black uppercase tracking-widest mb-1">WhatsApp</p>
                      <p className="text-2xl font-bold">{settings.whatsapp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="bg-[#66D1FF]/20 p-4 rounded-2xl group-hover:bg-[#66D1FF]/40 transition-colors"><Mail size={28} className="text-[#66D1FF]" /></div>
                    <div>
                      <p className="text-[#66D1FF] text-xs font-black uppercase tracking-widest mb-1">E-mail</p>
                      <p className="text-2xl font-bold">{settings.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="bg-[#66D1FF]/20 p-4 rounded-2xl group-hover:bg-[#66D1FF]/40 transition-colors"><MapPin size={28} className="text-[#66D1FF]" /></div>
                    <div>
                      <p className="text-[#66D1FF] text-xs font-black uppercase tracking-widest mb-1">Endereço</p>
                      <p className="text-xl font-bold leading-tight">{settings.address}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-12 lg:p-20 bg-white/5">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input className="bg-white/10 border-[#66D1FF]/30 text-white placeholder:text-white/40 h-14 rounded-xl focus:ring-[#66D1FF]" placeholder="Nome" required />
                    <Input className="bg-white/10 border-[#66D1FF]/30 text-white placeholder:text-white/40 h-14 rounded-xl focus:ring-[#66D1FF]" placeholder="Telefone" required />
                  </div>
                  <Input className="bg-white/10 border-[#66D1FF]/30 text-white placeholder:text-white/40 h-14 rounded-xl focus:ring-[#66D1FF]" placeholder="Assunto" required />
                  <Textarea className="bg-white/10 border-[#66D1FF]/30 text-white placeholder:text-white/40 min-h-[150px] rounded-xl focus:ring-[#66D1FF]" placeholder="Mensagem..." required />
                  <Button type="submit" className="btn-gradient w-full py-8 text-xl rounded-2xl uppercase tracking-widest">
                    <MessageSquare className="mr-3" /> Enviar Mensagem
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;