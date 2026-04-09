"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialFloatingBar from '@/components/SocialFloatingBar';
import BannerCarousel from '@/components/BannerCarousel';
import { 
  Truck, 
  Award, 
  ThermometerSnowflake, 
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const [settings, setSettings] = React.useState({
    whatsapp: '11999999999',
    email: 'contato@liderefrigeracao.com.br',
    address: 'Av. Industrial, 1000 - Setor de Transportes',
    banners: [],
    carouselDelay: 6,
    aboutYears: '15+',
    aboutTitle: 'Excelência em Refrigeração de Transportes',
    aboutDescription: 'A Lider Refrigeração nasceu com o compromisso de oferecer soluções técnicas de alta precisão para o transporte de cargas refrigeradas. Entendemos que cada minuto parado representa um prejuízo, por isso focamos em agilidade e qualidade extrema.',
    aboutImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80'
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
      
      {/* Hero Section com Carrossel Dinâmico */}
      <BannerCarousel 
        banners={settings.banners} 
        onContactClick={scrollToContact} 
        delay={settings.carouselDelay}
      />

      {/* Sobre Nós */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-blue-100 border-8 border-blue-50 shadow-2xl">
                <img 
                  src={settings.aboutImage} 
                  alt="Oficina Lider" 
                  className="w-full h-full object-cover opacity-80 mix-blend-multiply"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-2xl shadow-xl hidden md:block">
                <p className="text-4xl font-black mb-1">{settings.aboutYears}</p>
                <p className="text-xs font-bold uppercase tracking-widest">Anos de Experiência</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                Nossa História
              </div>
              <h2 className="text-4xl font-black text-blue-900 leading-tight">
                {settings.aboutTitle}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {settings.aboutDescription}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="flex gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl h-fit text-blue-600"><ShieldCheck size={24}/></div>
                  <div>
                    <h4 className="font-bold text-blue-900">Qualidade Garantida</h4>
                    <p className="text-sm text-gray-500">Peças originais e técnicos certificados.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl h-fit text-blue-600"><Clock size={24}/></div>
                  <div>
                    <h4 className="font-bold text-blue-900">Agilidade</h4>
                    <p className="text-sm text-gray-500">Atendimento rápido para não parar sua carga.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl h-fit text-blue-600"><Users size={24}/></div>
                  <div>
                    <h4 className="font-bold text-blue-900">Equipe Especializada</h4>
                    <p className="text-sm text-gray-500">Treinados nas maiores marcas do mercado.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl h-fit text-blue-600"><Award size={24}/></div>
                  <div>
                    <h4 className="font-bold text-blue-900">Referência</h4>
                    <p className="text-sm text-gray-500">Líder no setor de manutenção de baús.</p>
                  </div>
                </div>
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