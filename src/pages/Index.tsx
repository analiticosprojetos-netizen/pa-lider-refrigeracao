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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <SocialFloatingBar />
      
      {/* Hero Section */}
      <section className="relative bg-[#1a365d] py-16 md:py-24 overflow-hidden border-b-8 border-blue-800">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Snowflake className="absolute top-10 left-10 text-white w-8 h-8" />
          <Snowflake className="absolute top-40 left-1/4 text-white w-12 h-12" />
          <Snowflake className="absolute bottom-20 left-20 text-white w-6 h-6" />
          <Snowflake className="absolute top-20 right-1/3 text-white w-10 h-10" />
          <Snowflake className="absolute bottom-10 right-1/4 text-white w-8 h-8" />
          <Snowflake className="absolute top-1/2 right-10 text-white w-14 h-14" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Representante Autorizada:</p>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="bg-white px-4 py-2 rounded-lg flex items-center justify-center">
                    <span className="text-blue-900 font-black italic text-xl">Carrier</span>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg flex flex-col items-center justify-center leading-none">
                    <span className="text-blue-500 text-[10px] font-bold uppercase">Thermo Star</span>
                    <div className="h-1 w-full bg-blue-500 my-1"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 bg-blue-800 rounded flex items-center justify-center border border-blue-400">
                      <span className="text-white font-bold text-xs italic">FK</span>
                    </div>
                    <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                      <Snowflake className="text-blue-600 w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={scrollToContact}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all w-full md:w-auto"
                >
                  SOLICITAR ORÇAMENTO AGORA
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Nossas Especialidades</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50">
              <Truck className="text-blue-600 mb-6" size={48} />
              <h3 className="text-xl font-bold text-blue-900 mb-3">Baús Frigoríficos</h3>
              <p className="text-gray-600 text-sm">Reformas completas e manutenção estrutural.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50">
              <Award className="text-blue-600 mb-6" size={48} />
              <h3 className="text-xl font-bold text-blue-900 mb-3">Autorizada</h3>
              <p className="text-gray-600 text-sm">Representante oficial Carrier e Thermo Star.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50">
              <ThermometerSnowflake className="text-blue-600 mb-6" size={48} />
              <h3 className="text-xl font-bold text-blue-900 mb-3">Thermo King</h3>
              <p className="text-gray-600 text-sm">Especialistas certificados em sistemas Thermo King.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50">
              <CheckCircle2 className="text-blue-600 mb-6" size={48} />
              <h3 className="text-xl font-bold text-blue-900 mb-3">Transporte</h3>
              <p className="text-gray-600 text-sm">Soluções completas para transporte refrigerado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12 bg-blue-600 text-white">
                <h2 className="text-3xl font-bold mb-8">Fale Conosco</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-xl"><Phone size={24} /></div>
                    <div>
                      <p className="text-blue-200 text-sm">Telefone / WhatsApp</p>
                      <p className="text-xl font-bold">{settings.whatsapp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-xl"><Mail size={24} /></div>
                    <div>
                      <p className="text-blue-200 text-sm">E-mail</p>
                      <p className="text-xl font-bold">{settings.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-xl"><MapPin size={24} /></div>
                    <div>
                      <p className="text-blue-200 text-sm">Endereço</p>
                      <p className="text-xl font-bold">{settings.address}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Nome" required />
                    <Input placeholder="Telefone" required />
                  </div>
                  <Input placeholder="Assunto" required />
                  <Textarea placeholder="Mensagem..." className="min-h-[120px]" required />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold">
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