<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Building2, MapPin, Phone, Globe, Save, Camera, 
  Info, MessageSquare, Mail, Instagram, Facebook, Map, Fingerprint,
  QrCode, Share2, Copy, Download, ExternalLink, Printer
} from 'lucide-vue-next'
import { computed } from 'vue'

const settings = ref({
  companyName: 'LIDER REFRIGERAÇÃO',
  whatsapp: '(11) 99999-9999',
  email: 'contato@liderefrigeracao.com.br',
  instagram: 'https://instagram.com/liderefrigeracao',
  facebook: 'https://facebook.com/liderefrigeracao',
  address: 'Av. Industrial, 1000 - Setor de Transportes',
  googleMapsUrl: '',
  latitude: '-18.9723105',
  longitude: '-48.3720316',
  cnpj: '00.000.000/0001-00',
  logo: '',
  aboutYears: '15+',
  aboutTitle: 'Excelência em Refrigeração de Transportes',
  aboutDescription: 'A Lider Refrigeração nasceu com o compromisso de oferecer soluções técnicas de alta precisão para o transporte de cargas refrigeradas. Entendemos que cada minuto parado representa um prejuízo, por isso focamos em agilidade e qualidade extrema.',
  aboutImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80',
  loginBackground: '',
  siteUrl: 'https://liderefrigeracao.com.br'
})

const qrCodeUrl = computed(() => {
  const url = settings.value.siteUrl || 'https://liderefrigeracao.com.br'
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`
})

const copyLink = () => {
  navigator.clipboard.writeText(settings.value.siteUrl)
  alert('Link copiado para a área de transferência!')
}

const printQRCode = () => {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`
    <html>
      <head>
        <title>Imprimir QR Code - ${settings.value.companyName}</title>
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
          img { width: 300px; height: 300px; margin-bottom: 20px; }
          h1 { font-size: 24px; margin: 0; }
          p { font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <h1>${settings.value.companyName}</h1>
        <img src="${qrCodeUrl.value}" />
        <p>${settings.value.siteUrl}</p>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body>
    </html>
  `)
}

const downloadQRCode = async () => {
  const response = await fetch(qrCodeUrl.value)
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `qrcode_${settings.value.companyName.toLowerCase().replace(/\s+/g, '_')}.png`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
}

import { SettingsService } from '../services/SettingsService'

onMounted(async () => {
  try {
    const data = await SettingsService.getSettings();
      if (data) {
        // Mescla os dados do banco, ignorando campos nulos
        const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null));
        Object.assign(settings.value, cleanData);
      }
  } catch (err) {
    console.error('Erro ao carregar configurações institucionais:', err);
  }
})

const save = async () => {
  try {
    await SettingsService.updateSettings(settings.value);
    alert('Configurações institucionais salvas no banco com sucesso!');
  } catch (err: any) {
    alert('Erro ao salvar no banco: ' + err.message);
  }
}

const handleFileUpload = (type: 'logo' | 'aboutImage' | 'loginBackground') => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('A imagem é muito grande. Escolha uma imagem de até 3MB.')
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          settings.value[type] = ev.target.result as string
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700 pb-12">
    <!-- Grid Principal (2 Colunas conforme o print) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      <!-- COLUNA 1: Contatos e Identidade -->
      <div class="bg-white dark:bg-slate-900 rounded-[32px] border border-blue-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
         <div class="px-10 py-8 border-b dark:border-slate-800 flex items-center justify-between bg-blue-50/20 dark:bg-slate-800/20">
            <div class="flex items-center gap-3">
               <Globe class="text-blue-600" :size="20" />
               <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tighter">Contatos e Identidade</h3>
            </div>
            <button @click="save" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
               <Save :size="14" class="inline mr-1" /> Salvar Alterações
            </button>
         </div>

         <div class="p-10 space-y-8">
            <!-- Logo Card -->
            <div class="space-y-3">
               <label class="text-[10px] font-black text-blue-900 dark:text-gray-400 uppercase tracking-widest pl-1">LOGO DA EMPRESA (PARA O PDF)</label>
               <div @click="handleFileUpload('logo')" class="p-8 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[28px] flex items-center gap-6 cursor-pointer group hover:border-blue-400 transition-all">
                  <div class="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 flex items-center justify-center text-gray-300 group-hover:text-blue-500 overflow-hidden">
                     <img v-if="settings.logo" :src="settings.logo" class="w-full h-full object-contain" />
                     <Camera v-else :size="32" />
                  </div>
                  <div>
                     <p class="text-xs font-black text-blue-900 dark:text-white uppercase">Upload da Logo</p>
                     <p class="text-[10px] text-gray-400 font-bold mt-1 leading-relaxed">Recomendado: PNG ou JPG com fundo branco ou transparente.</p>
                  </div>
               </div>
            </div>

            <!-- Inputs Identidade -->
            <div class="space-y-5">
               <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">Nome da Empresa (PDF)</label>
                  <input v-model="settings.companyName" type="text" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
               </div>

               <div class="grid grid-cols-2 gap-6">
                  <div class="space-y-1.5">
                     <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">WhatsApp</label>
                     <input v-model="settings.whatsapp" type="text" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
                  </div>
                  <div class="space-y-1.5">
                     <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">E-mail</label>
                     <input v-model="settings.email" type="email" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
                  </div>
               </div>

               <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">Instagram</label>
                  <input v-model="settings.instagram" type="text" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
               </div>

               <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">Facebook</label>
                  <input v-model="settings.facebook" type="text" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
               </div>

               <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">Endereço</label>
                  <input v-model="settings.address" type="text" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
               </div>

               <!-- Maps Card -->
               <div class="p-8 bg-blue-50/30 dark:bg-slate-950/40 rounded-[28px] border border-blue-100/50 dark:border-slate-800 space-y-6">
                  <div class="flex items-center gap-2">
                     <MapPin class="text-blue-600" :size="16" />
                     <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-800 dark:text-blue-400">LOCALIZAÇÃO EXATA (GOOGLE MAPS)</h4>
                  </div>
                  
                  <div class="space-y-3">
                     <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-0.5">LINK DIRETO DO GOOGLE MAPS (RECOMENDADO)</label>
                     <input v-model="settings.googleMapsUrl" type="text" placeholder="Cole o link de compartilhamento aqui..." class="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 outline-none font-bold text-xs dark:text-white" />
                     <p class="text-[9px] text-gray-400 italic px-1">Dica: No Google Maps, clique em "Compartilhar" e copie o link.</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                     <div class="space-y-1.5">
                        <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-0.5">LATITUDE</label>
                        <input v-model="settings.latitude" type="text" class="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 outline-none font-bold text-xs dark:text-white" />
                     </div>
                     <div class="space-y-1.5">
                        <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-0.5">LONGITUDE</label>
                        <input v-model="settings.longitude" type="text" class="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 outline-none font-bold text-xs dark:text-white" />
                     </div>
                  </div>
               </div>

               <div class="space-y-1.5 pt-4">
                  <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">CNPJ</label>
                  <input v-model="settings.cnpj" type="text" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
               </div>
            </div>
         </div>
      </div>

      <!-- COLUNA 2: Conteúdo Institucional -->
      <div class="bg-white dark:bg-slate-900 rounded-[32px] border border-blue-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
         <div class="px-10 py-8 border-b dark:border-slate-800 flex items-center justify-between bg-blue-50/20 dark:bg-slate-800/20">
            <div class="flex items-center gap-3">
               <Info class="text-blue-600" :size="20" />
               <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tighter">Conteúdo Institucional (Sobre Nós)</h3>
            </div>
         </div>

         <div class="p-10 space-y-8">
            <!-- Imagem Sobre Nós -->
            <div class="space-y-3">
               <label class="text-[10px] font-black text-blue-900 dark:text-gray-400 uppercase tracking-widest pl-1">IMAGEM DA SEÇÃO SOBRE</label>
               <div @click="handleFileUpload('aboutImage')" class="p-8 bg-gray-50/50 dark:bg-slate-950/50 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[28px] flex items-center gap-6 cursor-pointer group hover:border-blue-400 transition-all">
                  <div class="w-32 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 flex items-center justify-center text-gray-300 group-hover:text-blue-500 overflow-hidden">
                     <img v-if="settings.aboutImage" :src="settings.aboutImage" class="w-full h-full object-cover" />
                     <Camera v-else :size="32" />
                  </div>
                  <div>
                     <p class="text-xs font-black text-blue-900 dark:text-white uppercase">Alterar Foto Sobre</p>
                     <p class="text-[10px] text-gray-400 font-bold mt-1 leading-relaxed">Esta imagem aparece ao lado do texto institucional na página inicial.</p>
                  </div>
               </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
               <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">Anos de Experiência</label>
                  <input v-model="settings.aboutYears" type="text" placeholder="Ex: 15+" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
               </div>
               <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">Título da Seção</label>
                  <input v-model="settings.aboutTitle" type="text" class="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
               </div>
            </div>

            <div class="space-y-1.5">
               <label class="text-[10px] font-black text-gray-900 dark:text-gray-400 uppercase tracking-widest pl-1">Descrição / História</label>
               <textarea v-model="settings.aboutDescription" rows="8" class="w-full px-6 py-5 rounded-3xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-bold text-sm dark:text-white transition-all resize-none leading-relaxed"></textarea>
            </div>

             <!-- Divisor e Fundo do Login (Separado em baixo) -->
             <div class="pt-10 border-t dark:border-slate-800 space-y-10">
                
                <!-- SEÇÃO QR CODE DIGITAL (NOVA) -->
                <div class="space-y-6">
                   <div class="flex items-center gap-3">
                      <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                         <QrCode class="text-purple-600" :size="18" />
                      </div>
                      <h4 class="text-xs font-black uppercase tracking-widest text-purple-900 dark:text-purple-400">Cartão de Visita Digital (QR Code)</h4>
                   </div>

                   <div class="p-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-950/40 dark:to-slate-900/40 rounded-[40px] border border-purple-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
                      <!-- QR Code Preview -->
                      <div class="relative group">
                         <div class="absolute -inset-4 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                         <div class="relative w-48 h-48 bg-white p-4 rounded-3xl shadow-2xl border border-white flex items-center justify-center overflow-hidden">
                            <img :src="qrCodeUrl" class="w-full h-full object-contain" alt="QR Code Site" />
                         </div>
                      </div>

                      <div class="flex-1 space-y-6 text-center md:text-left">
                         <div>
                            <p class="text-sm font-black text-blue-900 dark:text-white uppercase tracking-tight mb-1">Link do Site / Cartão Digital</p>
                            <div class="flex items-center gap-2">
                               <input v-model="settings.siteUrl" type="text" placeholder="https://seusite.com.br" class="flex-1 px-5 py-3 rounded-xl bg-white/60 dark:bg-slate-900 border border-purple-100 dark:border-slate-800 outline-none font-bold text-xs dark:text-white focus:ring-2 focus:ring-purple-400 transition-all" />
                               <button @click="copyLink" class="p-3 bg-white hover:bg-purple-50 text-purple-600 rounded-xl border border-purple-100 shadow-sm transition-all" title="Copiar Link">
                                  <Copy :size="16" />
                               </button>
                            </div>
                         </div>

                         <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <button @click="downloadQRCode" class="flex items-center gap-2 bg-blue-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                               <Download :size="14" /> Baixar Imagem
                            </button>
                            <button @click="printQRCode" class="flex items-center gap-2 bg-white text-blue-900 border border-blue-100 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-md">
                               <Printer :size="14" /> Imprimir
                            </button>
                            <a :href="settings.siteUrl" target="_blank" class="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl">
                               <ExternalLink :size="14" /> Acessar Link
                            </a>
                         </div>
                         
                         <p class="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                            O QR Code é atualizado automaticamente ao alterar o link acima. Você pode imprimi-lo para colocar em balcões ou compartilhar a imagem digitalmente.
                         </p>
                      </div>
                   </div>
                </div>

                <div class="space-y-3">
                   <label class="text-[10px] font-black text-blue-900 dark:text-gray-400 uppercase tracking-widest pl-1">IMAGEM DE FUNDO DO LOGIN (TELA DE ENTRADA)</label>
                   <div @click="handleFileUpload('loginBackground')" class="p-8 bg-blue-50/10 dark:bg-slate-950/40 border-2 border-dashed border-blue-100/50 dark:border-slate-800 rounded-[28px] flex items-center gap-6 cursor-pointer group hover:border-blue-400 transition-all shadow-sm">
                      <div class="w-32 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 flex items-center justify-center text-gray-300 group-hover:text-blue-500 overflow-hidden">
                         <img v-if="settings.loginBackground" :src="settings.loginBackground" class="w-full h-full object-cover" />
                         <Camera v-else :size="32" />
                      </div>
                      <div>
                         <p class="text-xs font-black text-blue-900 dark:text-white transition-colors group-hover:text-blue-600">Fundo da Tela de Login</p>
                         <p class="text-[10px] text-gray-400 font-bold mt-1 leading-relaxed">Personalize a imagem que aparece no fundo da página de login.</p>
                      </div>
                   </div>
                </div>
             </div>
         </div>
      </div>
    </div>
  </div>
</template>
