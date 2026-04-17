<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import SocialFloatingBar from '../components/SocialFloatingBar.vue'
import BannerCarousel from '../components/BannerCarousel.vue'
import SpecialtiesCarousel from '../components/SpecialtiesCarousel.vue'
import { 
  Truck, Award, ThermometerSnowflake, CheckCircle2, Phone, Mail, 
  MapPin, MessageSquare, ShieldCheck, Clock, Users, Navigation 
} from 'lucide-vue-next'

const router = useRouter()

const settings = ref({
  companyName: 'LIDER REFRIGERAÇÃO',
  whatsapp: '(11) 99999-9999',
  email: 'contato@liderefrigeracao.com.br',
  address: 'Av. Industrial, 1000 - Setor de Transportes',
  googleMapsUrl: '',
  latitude: '',
  longitude: '',
  banners: [],
  carouselDelay: 6,
  specialties: [] as any[],
  aboutYears: '15+',
  aboutTitle: 'Excelência em Refrigeração de Transportes',
  aboutDescription: 'A Lider Refrigeração nasceu com o compromisso de oferecer soluções técnicas de alta precisão para o transporte de cargas refrigeradas. Entendemos que cada minuto parado representa um prejuízo, por isso focamos em agilidade e qualidade extrema.',
  aboutImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80'
})

const contactForm = ref({
  name: '',
  phone: '',
  subject: '',
  message: ''
})

onMounted(() => {
  const saved = localStorage.getItem('lider_site_settings')
  if (saved) Object.assign(settings.value, JSON.parse(saved))
})

const formatPhone = (e: any) => {
  let val = e.target.value.replace(/\D/g, '')
  if (val.length > 11) val = val.slice(0, 11)
  if (val.length > 10) {
    contactForm.value.phone = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
  } else if (val.length > 6) {
    contactForm.value.phone = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`
  } else if (val.length > 2) {
    contactForm.value.phone = `(${val.slice(0, 2)}) ${val.slice(2)}`
  } else {
    contactForm.value.phone = val
  }
}

const handleContactSubmit = async () => {
  // Lógica de Captura de Lead (Salva como O.S. Pendente no Sistema)
  const newLead = {
    id: `SITE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    date: new Date().toLocaleDateString('pt-BR'),
    status: 'Pendente',
    clientName: contactForm.value.name,
    phone: contactForm.value.phone,
    plate: 'SITE',
    vehicleModel: 'MENSAGEM VIA SITE',
    report: `ASSUNTO: ${contactForm.value.subject} \n\n MENSAGEM: ${contactForm.value.message}`,
    origin: 'site',
    total: 0,
    parts: [],
    labor: []
  }

  const savedOrders = localStorage.getItem('lider_orders')
  const orders = savedOrders ? JSON.parse(savedOrders) : []
  orders.unshift(newLead)
  localStorage.setItem('lider_orders', JSON.stringify(orders))

  alert('Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.')
  contactForm.value = { name: '', phone: '', subject: '', message: '' }
}

const scrollToContact = () => {
  document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })
}

const mapsUrl = computed(() => {
  return settings.value.googleMapsUrl || (settings.value.latitude && settings.value.longitude 
    ? `https://www.google.com/maps/search/?api=1&query=${settings.value.latitude},${settings.value.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.value.address)}`)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-slate-950 transition-colors font-sans selection:bg-blue-600 selection:text-white">
    <Navbar />
    <SocialFloatingBar />
    
    <BannerCarousel 
      :banners="settings.banners" 
      :delay="settings.carouselDelay"
      @contact-click="scrollToContact"
    />

    <!-- Seção: Sobre Nós -->
    <section id="sobre" class="py-32 bg-white dark:bg-slate-950 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div class="relative group">
            <div class="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
            <div class="aspect-square rounded-[40px] overflow-hidden border-[12px] border-blue-50 dark:border-slate-800 shadow-3xl bg-blue-100 dark:bg-slate-800">
              <img 
                :src="settings.aboutImage" 
                alt="Equipe Lider" 
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
            </div>
            <div class="absolute -bottom-10 -right-10 bg-blue-600 text-white p-10 rounded-3xl shadow-3xl animate-bounce-slow">
              <p class="text-5xl font-black mb-1 leading-none">{{ settings.aboutYears }}</p>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Anos transformando o mercado</p>
            </div>
          </div>
          
          <div class="space-y-8">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest">
              <ShieldCheck :size="16" /> Nossa Trajetória
            </div>
            <h2 class="text-5xl md:text-6xl font-black text-blue-900 dark:text-white leading-[1.1] tracking-tighter">
              {{ settings.aboutTitle }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400 text-lg leading-relaxed whitespace-pre-line">
              {{ settings.aboutDescription }}
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div v-for="feat in [
                { t: 'Qualidade Extrema', d: 'Peças originais e processos certificados.', i: Award },
                { t: 'Máxima Agilidade', d: 'Seu caminhão de volta à estrada rapidinho.', i: Clock },
                { t: 'Técnicos de Elite', d: 'Especialistas treinados pelas grandes marcas.', i: Users },
                { t: 'Suporte VIP', d: 'Atendimento humanizado e personalizado.', i: MessageSquare }
              ]" :key="feat.t" class="flex gap-4 group">
                <div class="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <component :is="feat.i" :size="24" />
                </div>
                <div>
                  <h4 class="font-black text-blue-900 dark:text-gray-100 text-sm uppercase tracking-wide">{{ feat.t }}</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ feat.d }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Seção: Especialidades -->
    <section id="servicos" class="py-32 bg-gray-50 dark:bg-slate-900/50 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-black text-blue-900 dark:text-white mb-4 italic tracking-tighter">Nossas Especialidades</h2>
          <div class="w-24 h-2 bg-blue-600 mx-auto rounded-full" />
        </div>
        
        <SpecialtiesCarousel :items="settings.specialties" />
      </div>
    </section>

    <!-- Seção: Contato (Redesign Premium Alto Padrão) -->
    <section id="contato" class="py-32 bg-white dark:bg-slate-950 relative overflow-hidden">
      <!-- Elementos Decorativos de Fundo (Blobs) -->
      <div class="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div class="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] animate-bounce-slow" />
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="bg-gray-900 rounded-[60px] shadow-4xl overflow-hidden border border-white/5 flex flex-col lg:flex-row transition-all duration-700 hover:shadow-blue-500/10">
          
          <!-- Lado Esquerdo: Info (Mesh Gradient) -->
          <div class="lg:w-[45%] p-12 md:p-20 relative overflow-hidden flex flex-col justify-between bg-mesh-gradient">
            <div class="relative z-10">
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-8 border border-white/10">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" /> Central de Atendimento
              </div>
              <h2 class="text-4xl md:text-5xl font-black text-white leading-[1.05] tracking-tighter mb-12">
                Vamos manter sua carga na <span class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200 uppercase italic">temperatura certa?</span>
              </h2>
              
              <div class="space-y-10">
                <div v-for="info in [
                  { t: 'WhatsApp / Telefone', v: settings.whatsapp, i: Phone, c: 'blue' },
                  { t: 'E-mail Corporativo', v: settings.email, i: Mail, c: 'indigo' },
                  { t: 'Localização Técnica', v: settings.address, i: MapPin, c: 'cyan', link: mapsUrl }
                ]" :key="info.t" class="flex items-center gap-6 group cursor-pointer">
                  <div class="h-16 w-16 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
                    <component :is="info.i" class="text-white w-7 h-7" />
                  </div>
                  <div>
                    <p class="text-blue-200/50 text-[10px] font-black uppercase tracking-widest">{{ info.t }}</p>
                    <p class="text-xl md:text-2xl font-black text-white tracking-tight break-all">{{ info.v }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative z-10 mt-16 pt-10 border-t border-white/5">
               <a :href="mapsUrl" target="_blank" class="group relative inline-flex items-center gap-4 bg-white text-blue-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest overflow-hidden transition-all active:scale-95">
                  <div class="absolute inset-0 bg-blue-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                  <Navigation :size="20" class="relative z-10 group-hover:text-white transition-colors" /> 
                  <span class="relative z-10 group-hover:text-white transition-colors">Traçar Rota via Maps</span>
               </a>
            </div>
          </div>

          <!-- Lado Direito: Form (Glassmorphism) -->
          <div class="flex-grow p-12 md:p-20 bg-slate-50 dark:bg-slate-900/40 backdrop-blur-3xl relative">
            <div class="max-w-md mx-auto relative z-10">
              <div class="mb-12">
                <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Envie sua solicitação</h3>
                <p class="text-slate-500 text-sm mt-2 font-medium">Resposta média em até 15 minutos via WhatsApp.</p>
              </div>

              <form @submit.prevent="handleContactSubmit" class="space-y-8">
                <div class="space-y-6">
                  <div class="group">
                    <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest transition-colors group-focus-within:text-blue-500">Seu Nome Completo</label>
                    <input v-model="contactForm.name" type="text" placeholder="Ex: João da Silva" class="glass-input" required />
                  </div>
                  
                  <div class="group">
                    <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest transition-colors group-focus-within:text-blue-500">WhatsApp para Retorno</label>
                    <input v-model="contactForm.phone" @input="formatPhone" type="text" placeholder="(11) 99999-9999" class="glass-input" required />
                  </div>

                  <div class="group">
                    <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest transition-colors group-focus-within:text-blue-500">Serviço Desejado</label>
                    <select v-model="contactForm.subject" class="glass-input outline-none cursor-pointer">
                      <option value="" disabled>Selecione uma especialidade...</option>
                      <option>Manutenção Preventiva</option>
                      <option>Conserto de Emergência</option>
                      <option>Reforma de Baú Frigorífico</option>
                      <option>Sistemática Thermo King/Carrier</option>
                      <option>Outros Assuntos</option>
                    </select>
                  </div>

                  <div class="group">
                    <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest transition-colors group-focus-within:text-blue-500">Detalhes Técnicos</label>
                    <textarea v-model="contactForm.message" rows="4" placeholder="Descreva brevemente o que aconteceu..." class="glass-input resize-none" required></textarea>
                  </div>
                </div>

                <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white py-6 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                  <MessageSquare :size="24" /> Solicitar Atendimento
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<style scoped>
.animate-bounce-slow {
  animation: bounce 6s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
}

.glass-input {
  @apply w-full px-8 py-5 rounded-2xl bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 font-bold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 dark:text-white;
}

.glass-input:focus {
  @apply border-blue-400 bg-white dark:bg-black/40;
}
</style>
