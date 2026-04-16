<script setup lang="ts">
import { ref } from 'vue'
import { 
  Shield, Globe, Camera, AlertTriangle, Users 
} from 'lucide-vue-next'
import InstitutionalSettings from './InstitutionalSettings.vue'
import BannerSettings from './BannerSettings.vue'
import BusinessRulesSettings from './BusinessRulesSettings.vue'
import UserAdminSettings from './UserAdminSettings.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const currentSubTab = ref('institucional')

const subTabs = [
  { id: 'institucional', name: 'Site e Institucional', icon: Globe },
  { id: 'banners', name: 'Banners', icon: Camera },
  { id: 'regras', name: 'Regras de Negócio', icon: AlertTriangle },
  { id: 'usuarios', name: 'Gestão de Usuários e Permissões', icon: Users },
]
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <!-- Navegação Sub-Tabs (Seguindo o Print) -->
    <div class="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-wrap w-fit transition-all">
       <button v-for="tab in subTabs" :key="tab.id" @click="currentSubTab = tab.id"
         :class="[
           currentSubTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-gray-400 hover:text-gray-600', 
           'px-8 py-3 rounded-xl text-xs font-black uppercase transition-all tracking-widest flex items-center gap-2'
         ]">
         <component :is="tab.icon" :size="14" />
         {{ tab.name }}
       </button>
    </div>

    <!-- Conteúdo das Sub-Tabs -->
    <div class="mt-4">
       <InstitutionalSettings v-if="currentSubTab === 'institucional'" />
       <BannerSettings v-if="currentSubTab === 'banners'" />
       <BusinessRulesSettings v-if="currentSubTab === 'regras'" />
       <UserAdminSettings v-if="currentSubTab === 'usuarios'" />
    </div>
  </div>
</template>
