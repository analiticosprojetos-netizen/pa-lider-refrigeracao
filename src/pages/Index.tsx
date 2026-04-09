"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialFloatingBar from '@/components/SocialFloatingBar';
import { 
  Truck, 
  Award, 
  ThermometerSnowflake, 
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Snowflake,
  Sparkles
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
    showSuccess('Mensagem enviada com sucesso!');
    (e.target as HTMLFormElement).reset();
  };

  const scrollToContact = () => {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#66D1FF] selection:text-[#0D2C6C]">
      <Navbar />
      <SocialFloatingBar />
      
      {/* Hero Section - Com Reflexos e Profundidade */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        {/* Luzes de Fundo (Reflexos) */}
        <div className="light-reflection w-[800px] h-[800px] -top-40 -left-40 animate-pulse" />
        <div className="light-reflection w-[600px] h-[600px] bottom-0 right-0 opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
            
            <div className="text-center lg:text-left flex-1">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-[#66D1FF]/20 blur-3xl rounded-full animate-pulse" />
                <h1 className="text-7xl md:text-9xl font-black italic leading-none tracking-tighter ice-text relative">
                  LÍDER
                </h1>
                <h2 className="text-4xl md:text-6xl font-black text-[#66D1FF] italic leading-none tracking-tighter mt-2 drop-shadow-2xl">
                  REFRIGERAÇÃO
                </h2>
              </div>
              
              <div className="mt-12 glass-card inline-block px-8 py-4 rounded-2xl">
                <p className="text-white text-sm md:text-lg font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                  <Sparkles size={20} className="text-[#66D1FF]" />
                  Manutenção de Alta Performance
                </p>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl">
              <div className="glass-card p-10 rounded-[2.5rem] border-t-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-1 w-12 bg-[#66D1FF] rounded-full" />
                  <span className="text-[#66D1FF] font-black uppercase tracking-widest text-xs">Especialistas</span>
                </div>
                <h3 className="text-3xl font-black uppercase mb-4 leading-tight">Reformas em Baús Frigoríficos</h3>
                <p className="text-blue-100/80 font-medium mb-8">Atendimento especializado Thermo King, Carrier e Thermo Star para frotas e autônomos.</p>
                
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/10 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-white font-black italic text-xl">Carrier</span>
                    <span className="text-[10px] uppercase opacity-50">Autorizada</span>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                    <span className="text-[#66D1FF] font-black text-xl">Thermo Star</span>
                    <div className="h-1 w-8 bg-[#66D1FF] mt-1" />
                  </div>
                </div>

                <Button 
                  onClick={scrollToContact}
                  className="btn-reflective w-full py-8 text-xl rounded-2xl uppercase tracking-widest"
                >
                  Solicitar Orçamento
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Especialidades - Cards com Efeito de Vidro Polido */}
      <section id="servicos" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-24">
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter ice-text">Nossas Especialidades</h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-[#66D1FF] to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Baús Frigoríficos", desc: "Reformas estruturais e isolamento térmico." },
              { icon: Award, title: "Peças Originais", desc: "Componentes homologados com garantia de fábrica." },
              { icon: ThermometerSnowflake, title: "Thermo King", desc: "Manutenção preventiva e corretiva especializada." },
              { icon: CheckCircle2, title: "Certificação", desc: "Técnicos treinados pelas maiores fabricantes." }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-10 rounded-[2rem] group hover:-translate-y-3 transition-all duration-500">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1E5BB8] to-[#66D1FF] rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                  <item.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-blue-100/60 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato - Layout de Alto Impacto com Reflexos */}
      <section id="contato" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-24 bg-gradient-to-br from-[#1E5BB8] to-[#0D2C6C] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                <h2 className="text-5xl font-black mb-16 ice-text uppercase">Fale Conosco</h2>
                
                <div className="space-y-12">
                  <div className="flex items-center gap-8 group">
                    <div className="bg-white/10 p-5 rounded-2xl group-hover:bg-[#66D1FF]/20 transition-colors border border-white/10">
                      <Phone size={32} className="text-[#66D1FF]" />
                    </div>
                    <div>
                      <p className="text-[#66D1FF] text-xs font-black uppercase tracking-[0.3em] mb-2">WhatsApp</p>
                      <p className="text-3xl font-bold">{settings.whatsapp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 group">
                    <div className="bg-white/10 p-5 rounded-2xl group-hover:bg-[#66D1FF]/20 transition-colors border border-white/10">
                      <Mail size={32} className="text-[#66D1FF]" />
                    </div>
                    <div>
                      <p className="text-[#66D1FF] text-xs font-black uppercase tracking-[0.3em] mb-2">E-mail</p>
                      <p className="text-2xl font-bold">{settings.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 group">
                    <div className="bg-white/10 p-5 rounded-2xl group-hover:bg-[#66D1FF]/20 transition-colors border border-white/10">
                      <MapPin size={32} className="text-[#66D1FF]" />
                    </div>
                    <div>
                      <p className="text-[#66D1FF] text-xs font-black uppercase tracking-[0.3em] mb-2">Localização</p>
                      <p className="text-xl font-bold leading-tight">{settings.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 lg:p-24 bg-white/5">
                <form onSubmit={handleContactSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-[#66D1FF]">Nome</label>
                      <Input className="bg-white/5 border-white/10 text-white h-16 rounded-2xl focus:ring-[#66D1FF] focus:bg-white/10 transition-all" placeholder="Seu nome" required />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-[#66D1FF]">Telefone</label>
                      <Input className="bg-white/5 border-white/10 text-white h-16 rounded-2xl focus:ring-[#66D1FF] focus:bg-white/10 transition-all" placeholder="(00) 00000-0000" required />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-[#66D1FF]">Mensagem</label>
                    <Textarea className="bg-white/5 border-white/10 text-white min-h-[180px] rounded-2xl focus:ring-[#66D1FF] focus:bg-white/10 transition-all" placeholder="Como podemos ajudar?" required />
                  </div>
                  <Button type="submit" className="btn-reflective w-full py-10 text-xl rounded-2xl uppercase tracking-[0.2em]">
                    <MessageSquare className="mr-4" /> Enviar Mensagem
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