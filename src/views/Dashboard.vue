<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useInventoryStore } from '../stores/inventory'
import { useOrderStore } from '../stores/orders'
import { useFinanceStore } from '../stores/finances'

import CustomersTab from '../components/CustomersTab.vue'
import FinanceTab from '../components/FinanceTab.vue'
import OrdersTab from '../components/OrdersTab.vue'
import InventoryTab from '../components/InventoryTab.vue'
import SettingsTab from '../components/SettingsTab.vue'
import TrechoTab from '../components/TrechoTab.vue'

import { 
  Snowflake, ShieldCheck, LogOut, Loader2, LayoutDashboard, Package, 
  FileText, Users, Landmark, Settings, Moon, Sun, 
  AlertTriangle, BarChart3, Camera, KeyRound, User, X, Save, Menu, Route
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const inventoryStore = useInventoryStore()
const orderStore = useOrderStore()
const financeStore = useFinanceStore()

const currentTab = ref('dashboard')
const isSidebarOpen = ref(true)
const isDarkMode = ref(false)
const isProfileModalOpen = ref(false)
const profileForm = ref({ username: '', email: '', password: '', avatarUrl: '' })
const technicalTeam = ref<any[]>([])
const goalSettings = ref({
  type: 'valor',
  target: 5000
})

const FULL_PERMISSIONS = {
  estoque: { view: true, edit: true, delete: true },
  orcamentos: { view: true, edit: true, delete: true },
  clientes: { view: true, edit: true, delete: true },
  historico: { view: true, edit: true, delete: true },
  financeiro: { view: true, edit: true, delete: true },
  config: { view: true, edit: true, delete: true },
}

const getUserStatus = (user: any) => {
  if (user.id === authStore.user?.id) {
    return { color: 'bg-green-400', animation: 'animate-pulse', label: 'Conectado', active: true }
  }
  return { color: '', animation: '', label: user.role === 'ADMIN' ? 'Administrador' : 'Técnico(a)', active: false }
}

const openProfileModal = () => {
  if (!authStore.user) return
  profileForm.value = {
    username: authStore.user.username,
    email: authStore.user.email,
    password: '',
    avatarUrl: (authStore.user as any).avatarUrl || ''
  }
  isProfileModalOpen.value = true
}

const saveProfile = () => {
  if (!authStore.user) return
  authStore.user.username = profileForm.value.username
  authStore.user.email = profileForm.value.email
  ;(authStore.user as any).avatarUrl = profileForm.value.avatarUrl

  // Atualiza também na lista de usuários
  const savedUsers = localStorage.getItem('lider_users')
  if (savedUsers) {
    const users = JSON.parse(savedUsers)
    const idx = users.findIndex((u: any) => u.id === authStore.user!.id)
    if (idx !== -1) {
      users[idx].username = profileForm.value.username
      users[idx].email = profileForm.value.email
      users[idx].avatarUrl = profileForm.value.avatarUrl
      if (profileForm.value.password) users[idx].password = profileForm.value.password
      localStorage.setItem('lider_users', JSON.stringify(users))
    }
  }

  localStorage.setItem('lider_user', JSON.stringify(authStore.user))
  isProfileModalOpen.value = false
  alert('Perfil atualizado com sucesso!')
}

const handleAvatarUpload = () => {
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
          profileForm.value.avatarUrl = ev.target.result as string
        }
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const tabs = computed(() => {
  if (authStore.user?.role === 'MOTORISTA') {
    return [{ id: 'trecho', name: 'Trecho', icon: Route }]
  }

  const base = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  ]
  
  if (authStore.hasPermission('estoque', 'view')) base.push({ id: 'estoque', name: 'Estoque', icon: Package })
  if (authStore.hasPermission('orcamentos', 'view')) base.push({ id: 'orcamentos', name: 'Orçamentos', icon: FileText })
  if (authStore.hasPermission('clientes', 'view')) base.push({ id: 'clientes', name: 'Clientes', icon: Users })
  if (authStore.hasPermission('financeiro', 'view')) base.push({ id: 'financeiro', name: 'Financeiro', icon: Landmark })
  base.push({ id: 'trecho', name: 'Trecho', icon: Route })
  if (authStore.hasPermission('config', 'view')) base.push({ id: 'config', name: 'Sistema', icon: Settings })
  
  return base
})

onMounted(async () => {
  if (!authStore.user) {
    router.push('/login')
    return
  }

  // Redirecionamento automático para Motoristas
  if (authStore.user.role === 'MOTORISTA') {
    currentTab.value = 'trecho'
  }
  
  const savedUsers = localStorage.getItem('lider_users')
  if (savedUsers) {
     technicalTeam.value = JSON.parse(savedUsers)
  } else {
    // Inicializa a lista de usuários com o admin se estiver vazia
    const adminUser = {
      id: '1',
      username: 'admin',
      email: 'admin@lider.com',
      role: 'ADMIN',
      permissions: FULL_PERMISSIONS,
      avatarUrl: ''
    }
    technicalTeam.value = [adminUser]
    localStorage.setItem('lider_users', JSON.stringify(technicalTeam.value))
  }

  const savedSettings = localStorage.getItem('lider_site_settings')
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings)
    goalSettings.value.type = parsed.goalType || 'valor'
    goalSettings.value.target = parsed.goalTarget || 5000
  }

  await Promise.all([
    inventoryStore.loadStock(),
    orderStore.loadOrders(),
    financeStore.loadFinances()
  ])
})

const logout = () => {
  authStore.logout()
  router.push('/')
}

// Recarrega configurações sempre que voltar para a aba dashboard
watch(currentTab, (newTab) => {
  if (newTab === 'dashboard') {
    const savedSettings = localStorage.getItem('lider_site_settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      goalSettings.value.type = parsed.goalType || 'valor'
      goalSettings.value.target = parsed.goalTarget || 5000
    }
  }
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const homeStats = computed(() => {
  return {
    osToday: orderStore.orders.filter(o => o.date === new Date().toLocaleDateString()).length,
    lowStock: inventoryStore.lowStockCount,
    revenueMonth: financeStore.totalReceitas,
    profit: financeStore.saldo
  }
})

const topParts = computed(() => {
  return [...inventoryStore.parts]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)
})

// Lógica de Metas Dinâmicas
const goalProgress = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  let currentAmount = 0

  if (goalSettings.value.type === 'valor') {
    // Soma receitas do mês atual
    currentAmount = financeStore.transactions
      .filter(t => t.type === 'receita')
      .filter(t => {
        const d = new Date(t.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((acc, t) => acc + t.amount, 0)
  } else if (goalSettings.value.type === 'orcamento') {
    // Soma valor dos orçamentos fechados (Executados) no mês atual
    currentAmount = orderStore.orders
      .filter(o => o.status === 'Executado' && o.executedAt)
      .filter(o => {
        const d = new Date(o.executedAt!)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((acc, o) => acc + o.total, 0)
  } else if (goalSettings.value.type === 'produtividade') {
    // Conta O.S. Executadas no mês atual
    currentAmount = orderStore.orders
      .filter(o => o.status === 'Executado' && o.executedAt)
      .filter(o => {
        const d = new Date(o.executedAt!)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      }).length
  }

  const percentage = (currentAmount / goalSettings.value.target) * 100
  return {
    value: Math.min(Math.round(percentage * 10) / 10, 100),
    current: currentAmount,
    target: goalSettings.value.target,
    label: goalSettings.value.type === 'valor' ? 'Faturamento' : goalSettings.value.type === 'orcamento' ? 'Vendas (O.S.)' : 'Produtividade'
  }
})
</script>

<template>
  <div v-if="!authStore.user" class="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-950">
    <Loader2 class="h-12 w-12 text-blue-600 animate-spin" />
  </div>
  
  <div v-else class="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors flex font-sans">
    <!-- ============================================ -->
    <!-- SIDEBAR - só em desktop (lg+)               -->
    <!-- ============================================ -->
    <aside :class="[isSidebarOpen ? 'w-64' : 'w-20', 'hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 sticky top-0 h-screen z-20 shrink-0 transition-all duration-300']">
      <div :class="[isSidebarOpen ? 'p-8 pb-4' : 'p-4 pb-4 flex justify-center']">
        <div class="flex items-center gap-3 cursor-pointer group" @click="isSidebarOpen = !isSidebarOpen" v-if="isSidebarOpen">
          <div class="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Snowflake class="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-black text-blue-900 dark:text-white leading-tight">Lider</h1>
            <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest">Refrigeração</p>
          </div>
        </div>
        <div v-else @click="isSidebarOpen = !isSidebarOpen" class="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 flex-shrink-0 mt-4 cursor-pointer hover:scale-110 transition-transform">
          <Snowflake class="h-6 w-6 text-white" />
        </div>
      </div>

      <nav class="flex-grow p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id" :title="!isSidebarOpen ? tab.name : ''"
          :class="[
            'w-full flex items-center rounded-2xl text-xs font-black transition-all group',
            isSidebarOpen ? 'px-4 py-3.5 gap-3 justify-start' : 'px-0 py-3.5 justify-center',
            currentTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600'
          ]">
          <component :is="tab.icon" :size="isSidebarOpen ? 18 : 22" :class="currentTab === tab.id ? 'text-white flex-shrink-0' : 'text-gray-400 group-hover:text-blue-600 flex-shrink-0'" />
          <span v-if="isSidebarOpen" class="uppercase tracking-widest truncate">{{ tab.name }}</span>
        </button>
      </nav>

      <!-- Avatar sidebar também clicável -->
      <div class="p-4 border-t border-gray-100 dark:border-slate-800 overflow-hidden">
        <div @click="openProfileModal" :class="[isSidebarOpen ? 'p-4 justify-start' : 'p-2 justify-center', 'bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center gap-3 mb-4 border border-gray-100 dark:border-slate-800 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-all group']">
          <div class="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 overflow-hidden">
            <img v-if="(authStore.user as any).avatarUrl" :src="(authStore.user as any).avatarUrl" class="w-full h-full object-cover" />
            <ShieldCheck v-else class="w-6 h-6 text-blue-600" />
          </div>
          <div v-if="isSidebarOpen" class="overflow-hidden min-w-0">
            <p class="text-xs font-black text-blue-900 dark:text-white truncate">{{ authStore.user.username }}</p>
            <p class="text-[10px] text-gray-400 font-bold truncate group-hover:text-blue-500 transition-colors">Editar perfil ›</p>
          </div>
        </div>
        <button @click="logout" :class="[isSidebarOpen ? 'px-4 justify-center' : 'px-0 justify-center w-12 mx-auto', 'w-full flex items-center gap-2 py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 font-black text-xs uppercase hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95']" :title="!isSidebarOpen ? 'Sair do Sistema' : ''">
          <LogOut :size="18" class="flex-shrink-0" /> <span v-if="isSidebarOpen">Sair do Sistema</span>
        </button>
      </div>
    </aside>

    <!-- ============================================ -->
    <!-- CONTEÚDO PRINCIPAL                           -->
    <!-- ============================================ -->
    <main class="flex-grow flex flex-col min-w-0 bg-gray-50 dark:bg-slate-950 overflow-y-auto pb-20 lg:pb-0">
      <!-- Header Topo -->
      <header class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 sm:px-8 py-3 sticky top-0 z-30 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <!-- Logo mobile -->
          <div class="flex items-center gap-2 lg:hidden">
            <div class="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-500/30">
              <Snowflake class="h-5 w-5 text-white" />
            </div>
            <span class="font-black text-blue-900 dark:text-white text-sm uppercase tracking-tight">Lider</span>
          </div>
        </div>

        <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest hidden lg:block mx-auto flex-1 text-center">
          Bem-vindo, {{ authStore.user.username }}
        </p>

        <div class="flex items-center gap-2 ml-auto">
          <button @click="toggleDarkMode" class="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 transition-all hover:scale-110">
            <Sun v-if="isDarkMode" :size="18" />
            <Moon v-else :size="18" />
          </button>
          <!-- Avatar clicável — abre modal de perfil -->
          <button @click="openProfileModal" class="h-9 w-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/20 hover:ring-4 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all shrink-0">
            <img v-if="(authStore.user as any).avatarUrl" :src="(authStore.user as any).avatarUrl" class="w-full h-full object-cover" />
            <span v-else>{{ authStore.user.username.charAt(0).toUpperCase() }}</span>
          </button>
          <!-- Botão Sair — só no mobile, canto direito após o avatar -->
          <button @click="logout" class="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 font-black text-[10px] uppercase hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95">
            <LogOut :size="15" /> Sair
          </button>
        </div>
      </header>

      <!-- Conteúdo das abas -->
      <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">

        <!-- Dashboard Summary -->
        <div v-if="currentTab === 'dashboard'" class="space-y-6 animate-in fade-in duration-500">
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="stat in [
              { t: 'Pedidos Hoje', v: homeStats.osToday, i: FileText, c: 'blue', show: true },
              { t: 'Estoque Alerta', v: homeStats.lowStock, i: Package, c: 'amber', show: true },
              { t: 'Receita Total', v: 'R$ ' + homeStats.revenueMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), i: Landmark, c: 'green', show: authStore.hasFinanceSubPerm('viewCards') },
              { t: 'Saldo Caixa', v: 'R$ ' + homeStats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), i: ShieldCheck, c: 'indigo', show: authStore.hasFinanceSubPerm('viewCards') }
            ].filter(s => s.show)" :key="stat.t" class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-50 dark:border-slate-800 flex items-center gap-4">
              <div :class="['p-3 rounded-xl bg-'+stat.c+'-50 dark:bg-'+stat.c+'-900/10 text-'+stat.c+'-500 shrink-0']">
                <component :is="stat.i" :size="20" />
              </div>
              <div class="min-w-0">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">{{ stat.t }}</p>
                <p class="text-base sm:text-xl font-black text-blue-900 dark:text-white mt-0.5 truncate">{{ stat.v }}</p>
              </div>
            </div>
          </div>

          <!-- Gráfico + Equipe -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 shadow-xl border border-blue-50 dark:border-slate-800">
              <div class="flex items-center justify-between mb-6 gap-4">
                <h3 class="text-base sm:text-xl font-black text-blue-900 dark:text-white">Top 8 Peças</h3>
                <div class="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                  <BarChart3 :size="12" /> Tempo Real
                </div>
              </div>
              <div class="h-48 sm:h-64 flex items-end justify-between px-2 gap-2 sm:gap-4">
                <div v-for="p in topParts" :key="p.id" class="flex-1 flex flex-col items-center justify-end h-full gap-2 group">
                  <div class="w-full max-w-[40px] bg-blue-600 dark:bg-blue-500 rounded-t-xl relative group-hover:bg-blue-400 transition-all duration-700 shadow-lg shadow-blue-500/20" :style="{ height: `${(p.quantity / 150) * 100}%` }">
                    <span class="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">{{ p.quantity }}</span>
                  </div>
                  <span class="text-[9px] font-bold text-gray-400 uppercase truncate w-full text-center">{{ p.name.split(' ')[0] }}</span>
                </div>
              </div>
            </div>

            <div class="bg-blue-900 dark:bg-indigo-950 rounded-[28px] p-6 sm:p-8 shadow-xl text-white flex flex-col justify-between">
              <div>
                <h3 class="text-lg sm:text-xl font-black mb-4">Equipe Técnica</h3>
                <div class="space-y-3">
                  <div v-for="user in technicalTeam" :key="user.id" class="flex items-center gap-3 p-3 bg-white/10 rounded-2xl border border-white/5 group hover:bg-white/20 transition-all">
                    <div class="h-10 w-10 overflow-hidden rounded-xl bg-indigo-500 relative flex items-center justify-center font-black text-white shrink-0 shadow-inner">
                      <img v-if="user.avatarUrl" :src="user.avatarUrl" class="w-full h-full object-cover" />
                      <span v-else>{{ user.username.charAt(0).toUpperCase() }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-black truncate text-blue-50 group-hover:text-white transition-colors">{{ user.username }}</p>
                      <p class="text-[10px] opacity-70 font-bold text-blue-200 truncate">{{ getUserStatus(user).label }}</p>
                    </div>
                    <div v-if="getUserStatus(user).active" :class="['ml-auto h-2.5 w-2.5 rounded-full shrink-0 shadow-lg', getUserStatus(user).color, getUserStatus(user).animation]"></div>
                  </div>
                </div>
              </div>
              <div class="mt-6 pt-6 border-t border-white/10">
                <div class="flex justify-between items-end mb-2">
                  <p class="text-[10px] font-black uppercase opacity-60">Meta de {{ goalProgress.label }}</p>
                  <p class="text-[10px] font-black">{{ goalProgress.value }}%</p>
                </div>
                <div class="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-2">
                  <div class="h-full bg-yellow-400 rounded-full transition-all duration-1000" :style="{ width: `${goalProgress.value}%` }"></div>
                </div>
                <div class="flex justify-between text-[9px] font-bold opacity-50 px-1">
                  <span>{{ (goalSettings.type === 'valor' || goalSettings.type === 'orcamento') ? 'R$ ' + goalProgress.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : goalProgress.current + ' un' }}</span>
                  <span>Alvo: {{ (goalSettings.type === 'valor' || goalSettings.type === 'orcamento') ? 'R$ ' + goalProgress.target.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : goalProgress.target + ' un' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Estoque -->
        <div v-show="currentTab === 'estoque'">
          <InventoryTab />
        </div>

        <!-- Tab Clientes -->
        <div v-show="currentTab === 'clientes'">
          <CustomersTab />
        </div>

        <!-- Tab Financeiro -->
        <div v-show="currentTab === 'financeiro'">
          <FinanceTab />
        </div>

        <!-- Tab Orçamentos -->
        <div v-show="currentTab === 'orcamentos'">
          <OrdersTab />
        </div>

        <!-- Tab Sistema -->
        <div v-show="currentTab === 'config'" class="animate-in fade-in duration-500">
          <SettingsTab />
        </div>

        <!-- Tab Trecho -->
        <div v-show="currentTab === 'trecho'" class="animate-in fade-in duration-500">
          <TrechoTab />
        </div>

      </div>
    </main>

    <!-- ============================================ -->
    <!-- BOTTOM NAV - só em mobile (< lg)            -->
    <!-- ============================================ -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div class="flex items-center justify-around px-2 py-2">
        <button v-for="tab in tabs" :key="tab.id" @click="currentTab = tab.id"
          :class="[
            'flex flex-col items-center gap-1 px-2 py-2 rounded-2xl transition-all flex-1 min-w-0',
            currentTab === tab.id ? 'text-blue-600' : 'text-gray-400 active:text-gray-600'
          ]">
          <div :class="[
            'p-2 rounded-xl transition-all',
            currentTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/30 scale-110' : ''
          ]">
            <component :is="tab.icon" :size="22" />
          </div>
          <span class="text-[9px] font-black uppercase tracking-tight truncate w-full text-center">{{ tab.name }}</span>
        </button>
      </div>
    </nav>

    <!-- ============================================ -->
    <!-- MODAL DE PERFIL (avatar clicável)           -->
    <!-- ============================================ -->
    <div v-if="isProfileModalOpen" class="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-blue-50/30 dark:bg-slate-800/30">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <User class="text-blue-600" :size="20" />
            </div>
            <div>
              <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Meu Perfil</h3>
              <p class="text-[10px] text-gray-400 font-bold uppercase">{{ authStore.user.role }}</p>
            </div>
          </div>
          <button @click="isProfileModalOpen = false" class="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl text-gray-400 transition-all">
            <X :size="22" />
          </button>
        </div>

        <div class="p-10 space-y-6">
          <!-- Preview Avatar -->
          <div class="flex items-center gap-6">
            <div class="h-20 w-20 rounded-2xl overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border-4 border-blue-100 dark:border-blue-900/30">
              <img v-if="profileForm.avatarUrl" :src="profileForm.avatarUrl" class="w-full h-full object-cover" />
              <span v-else class="font-black text-blue-600 dark:text-blue-400 text-3xl">{{ profileForm.username?.charAt(0).toUpperCase() || authStore.user.username.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1 space-y-2">
               <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Camera :size="11" /> Foto de Perfil
               </label>
               <button @click="handleAvatarUpload" class="w-full px-4 py-3 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 hover:border-blue-400 dark:hover:border-blue-600 hover:text-blue-500 transition-all font-bold text-xs dark:text-white">
                 <Camera :size="16" /> Procurar Imagem Local...
               </button>
            </div>
          </div>

          <!-- Nome -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nome de Usuário</label>
            <input v-model="profileForm.username" type="text" class="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
          </div>

          <!-- Email -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</label>
            <input v-model="profileForm.email" type="email" class="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
          </div>

          <!-- Nova Senha -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <KeyRound :size="11" /> Nova Senha <span class="text-gray-300 font-normal normal-case ml-1">(em branco = mantém atual)</span>
            </label>
            <input v-model="profileForm.password" type="password" placeholder="••••••••" class="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
          </div>
        </div>

        <div class="px-10 py-8 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
          <button @click="isProfileModalOpen = false" class="px-6 py-3 font-black text-gray-400 uppercase text-xs hover:text-gray-600">Cancelar</button>
          <button @click="saveProfile" class="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2">
            <Save :size="16" /> Salvar Perfil
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>
