<script setup lang="ts">
import { computed } from 'vue'
import { Snowflake, MapPin, Phone, Mail, Instagram, Facebook, Settings } from 'lucide-vue-next'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)
</script>

<template>
  <footer class="bg-mesh-gradient text-white py-16 transition-colors relative overflow-hidden">
    <!-- Efeito de brilho sutil no footer -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
        <!-- Logo & Desc -->
        <div class="col-span-1 md:col-span-2 space-y-6">
          <div class="flex items-center gap-3">
            <div class="bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
              <Snowflake class="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h3 class="text-2xl font-black italic tracking-tighter">LIDER</h3>
              <p class="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/80">Refrigeração</p>
            </div>
          </div>
          <p class="text-blue-100/60 text-sm leading-relaxed max-w-sm">
            Especialistas em manutenção preventiva e corretiva de sistemas de refrigeração para transportes. 
            Garantindo a integridade da sua carga com agilidade e precisão técnica.
          </p>
          <div class="flex gap-4">
            <a :href="settings.instagram" class="p-3 bg-white/5 hover:bg-blue-600 rounded-xl transition-all border border-white/5">
              <Instagram :size="20" />
            </a>
            <a :href="settings.facebook" class="p-3 bg-white/5 hover:bg-blue-600 rounded-xl transition-all border border-white/5">
              <Facebook :size="20" />
            </a>
          </div>
        </div>

        <!-- Links Rápidos -->
        <div>
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Navegação</h4>
          <ul class="space-y-4">
            <li v-for="link in [
              { name: 'Serviços', id: 'servicos' },
              { name: 'Sobre Nós', id: 'sobre' },
              { name: 'Contato', id: 'contato' }
            ]" :key="link.id">
              <a :href="`/#${link.id}`" class="text-sm font-bold text-blue-100/60 hover:text-white transition-colors uppercase tracking-widest">
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Contato & Gestão -->
        <div>
          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Atendimento</h4>
          <ul class="space-y-4">
            <li class="flex items-center gap-3 text-sm text-blue-100/60">
              <Phone :size="16" class="text-blue-400" />
              <span>{{ settings.whatsapp }}</span>
            </li>
            <li class="flex items-center gap-3 text-sm text-blue-100/60">
              <Mail :size="16" class="text-blue-400" />
              <span class="truncate">{{ settings.email }}</span>
            </li>
          </ul>
          
          <div class="mt-8 pt-8 border-t border-white/5">
            <router-link 
              to="/login" 
              class="flex items-center justify-center gap-2 bg-blue-800/50 hover:bg-blue-800 px-6 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/5"
            >
              <Settings :size="16" />
              Portal de Gestão
            </router-link>
          </div>
        </div>
      </div>

      <div class="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-[10px] font-black uppercase tracking-widest text-blue-100/30 text-center">
          © {{ new Date().getFullYear() }} {{ settings.companyName }}. Desenvolvido com Excelência.
        </p>
        <div class="flex items-center gap-2 text-[10px] font-black text-blue-400/50 uppercase tracking-widest">
          <span>Status do Sistema:</span>
          <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Online</span>
        </div>
      </div>
    </div>
  </footer>
</template>
