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
    showSuccess('Mensagem enviada com sucesso!');
    (e.target as HTMLFormElement).reset();
  };

  const scrollToContact = () => {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D2C6C]">
      <Navbar />
      <SocialFloatingBar />
      
      {/* Hero Section - Limpo e Impactante */}
      <section className="relative py-20 md:py-32 border-b-8 border-[#1E5BB8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-6xl md:text-8xl font-black text-white italic leading-none tracking-tighter">
                LÍDER
              </h1>
              <h2 className="text-4xl md:text-6xl font-black text-[#66D1FF] italic leading-none tracking-tighter mt-2">
                REFRIGERAÇÃO
              </h2>
              <div className="mt-8 inline-block bg-[#1E5BB8] px-6 py-2 rounded-md">
                <p className="text-white text-sm md:text-lg font-bold uppercase tracking-widest">
                  Manutenção Preventiva e Corretiva
                </p>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl">
              <div className="bg-white/10 p-8 rounded-2xl border-l-8 border-[#66D1FF] shadow-2xl">
                <h3 className="text-2xl font-bold uppercase mb-4 text-white">Reformas em Baús Frigoríficos</h3>
                <p className="text-blue-100 mb-8">Atendimento especializado Thermo King, Carrier e Thermo Star para frotas e autônomos.</p>
                
                <div className="flex gap-4 mb-8">
                  <div className="bg-white px-4 py-2 rounded font-black italic text-[#0D2C6C]">Carrier</div>
                  <div className="bg-white px-4 py-2 rounded flex flex-col items-center leading-none">
                    <span className="text-[#1E5BB8] text-[10px] font-bold uppercase">Thermo Star</span>
                    <div className="h-1 w-full bg-[#1E5BB8] mt-1" />
                  </div>
                </div>

                <Button 
                  onClick={scrollToContact}
                  className="btn-primary w-full py-8 text-xl rounded-xl"
                >
                  Solicitar Orçamento
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section id="servicos" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 uppercase">Nossas Especialidades</h2>
            <div className="w-24 h-1.5 bg-[#66D1FF] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Baús Frigoríficos", desc: "Reformas estruturais e isolamento térmico." },
              { icon: Award, title: "Peças Originais", desc: "Componentes homologados com garantia." },
              { icon: ThermometerSnowflake, title: "Thermo King", desc: "Manutenção especializada certificada." },
              { icon: CheckCircle2, title: "Certificação", desc: "Técnicos treinados pelas fabricantes." }
            ].map((item, idx) => (
              <div key={idx} className="section-card hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 bg-[#1E5BB8] rounded-lg flex items-center justify-center mb-6">
                  <item.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0D2C6C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 bg-[#1E5BB8] text-white">
                <h2 className="text-3xl font-bold mb-12 uppercase">Fale Conosco</h2>
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <Phone className="text-[#66D1FF]" size={24} />
                    <div>
                      <p className="text-xs uppercase opacity-70">WhatsApp</p>
                      <p className="text-xl font-bold">{settings.whatsapp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="text-[#66D1FF]" size={24} />
                    <div>
                      <p className="text-xs uppercase opacity-70">E-mail</p>
                      <p className="text-xl font-bold">{settings.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="text-[#66D1FF]" size={24} />
                    <div>
                      <p className="text-xs uppercase opacity-70">Endereço</p>
                      <p className="text-lg font-bold">{settings.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input className="bg-white/5 border-white/20 text-white h-14" placeholder="Nome" required />
                    <Input className="bg-white/5 border-white/20 text-white h-14" placeholder="Telefone" required />
                  </div>
                  <Input className="bg-white/5 border-white/20 text-white h-14" placeholder="Assunto" required />
                  <Textarea className="bg-white/5 border-white/20 text-white min-h-[120px]" placeholder="Mensagem..." required />
                  <Button type="submit" className="btn-primary w-full py-8 text-lg">
                    <MessageSquare className="mr-2" /> Enviar Mensagem
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