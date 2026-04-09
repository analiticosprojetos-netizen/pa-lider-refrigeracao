"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-blue-600 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586191582151-f73872dfd183?q=80&w=2000')] bg-cover bg-center" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Especialistas em Refrigeração de <span className="text-blue-200">Caminhões e Carretas</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Manutenção preventiva e corretiva com foco em Thermo King e Carrier. Garantindo a temperatura ideal para sua carga.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#contato" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg">
                Solicitar Orçamento
              </a>
              <div className="flex items-center gap-2 text-white font-medium">
                <ShieldCheck className="text-blue-200" />
                Representante Autorizada
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços e Especialidades */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Nossas Especialidades</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Truck className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Baús Frigoríficos</h3>
              <p className="text-gray-600 text-sm">Reformas completas e manutenção estrutural em baús de todas as marcas.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Autorizada</h3>
              <p className="text-gray-600 text-sm">Representante oficial Carrier e Thermo Star. Peças originais e garantia.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <ThermometerSnowflake className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Thermo King</h3>
              <p className="text-gray-600 text-sm">Especialistas certificados em sistemas Thermo King para caminhões e carretas.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Transporte</h3>
              <p className="text-gray-600 text-sm">Soluções completas para transporte refrigerado de curta e longa distância.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000" 
                alt="Oficina Lider" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-2xl hidden md:block">
                <p className="text-4xl font-bold">15+</p>
                <p className="text-sm opacity-80">Anos de Experiência</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-blue-900 mb-6">Compromisso com a Qualidade e Agilidade</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                A Lider Refrigeração nasceu da necessidade de oferecer um serviço técnico especializado e confiável para o setor de transportes. Sabemos que cada hora com o caminhão parado representa prejuízo, por isso focamos em diagnósticos precisos e reparos rápidos.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-2 rounded-lg"><Clock className="text-blue-600" size={20} /></div>
                  <div>
                    <h4 className="font-bold text-blue-900">Atendimento Rápido</h4>
                    <p className="text-sm text-gray-500">Equipe pronta para atender emergências e manutenções programadas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-2 rounded-lg"><ShieldCheck className="text-blue-600" size={20} /></div>
                  <div>
                    <h4 className="font-bold text-blue-900">Garantia de Serviço</h4>
                    <p className="text-sm text-gray-500">Utilizamos apenas peças originais e homologadas pelas fabricantes.</p>
                  </div>
                </div>
              </div>
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
                      <p className="text-xl font-bold">(11) 99999-9999</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-xl"><Mail size={24} /></div>
                    <div>
                      <p className="text-blue-200 text-sm">E-mail</p>
                      <p className="text-xl font-bold">contato@liderefrigeracao.com.br</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 p-3 rounded-xl"><MapPin size={24} /></div>
                    <div>
                      <p className="text-blue-200 text-sm">Endereço</p>
                      <p className="text-xl font-bold">Av. Industrial, 1000 - Setor de Transportes</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 lg:p-12">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nome</label>
                      <Input placeholder="Seu nome completo" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Telefone</label>
                      <Input placeholder="(00) 00000-0000" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Assunto</label>
                    <Input placeholder="Ex: Orçamento Manutenção" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mensagem</label>
                    <Textarea placeholder="Descreva sua necessidade..." className="min-h-[120px]" required />
                  </div>
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