"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Truck, ShieldCheck, Award, ThermometerSnowflake, CheckCircle2 } from 'lucide-react';

const Index = () => {
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

      {/* Marcas */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Trabalhamos com as melhores marcas</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="text-2xl font-black text-gray-800">THERMO KING</span>
            <span className="text-2xl font-black text-gray-800">CARRIER</span>
            <span className="text-2xl font-black text-gray-800">THERMO STAR</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;