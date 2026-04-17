<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Snowflake, Menu, X } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'

const isMenuOpen = ref(false)
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navLinks = [
  { name: 'Serviços', href: '/#servicos' },
  { name: 'Sobre Nós', href: '/#sobre' },
  { name: 'Contato', href: '/#contato' }
]
</script>

<template>
  <nav 
    :class="[
      'fixed top-0 left-0 w-full z-50 transition-all duration-300',
      isScrolled 
        ? 'bg-mesh-gradient shadow-2xl py-3' 
        : 'bg-transparent md:bg-transparent bg-slate-900/95 backdrop-blur-md py-4 md:py-6 shadow-lg md:shadow-none'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center gap-2 group">
            <div class="bg-blue-600 p-2 rounded-xl group-hover:rotate-180 transition-transform duration-700 shadow-lg shadow-blue-500/30">
              <Snowflake class="h-6 w-6 text-white" />
            </div>
            <div class="flex flex-col">
              <span :class="['text-xl font-black leading-none tracking-tight transition-colors', isScrolled ? 'text-white' : 'text-blue-900 dark:text-white']">LIDER REFRIGERAÇÃO</span>
              <span :class="['text-[8px] uppercase tracking-[0.3em] font-black mt-0.5 transition-colors', isScrolled ? 'text-blue-200' : 'text-blue-500']">Excelência Térmica</span>
            </div>
          </router-link>
        </div>
        
        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-10">
          <a 
            v-for="link in navLinks" 
            :key="link.name" 
            :href="link.href" 
            :class="['text-sm font-black uppercase tracking-widest transition-colors', isScrolled ? 'text-blue-100/80 hover:text-white' : 'text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400']"
          >
            {{ link.name }}
          </a>
          
          <ThemeToggle />
        </div>

        <!-- Mobile Toggle -->
        <div class="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <button 
            @click="isMenuOpen = !isMenuOpen" 
            class="p-2 text-blue-900 dark:text-white bg-white/50 dark:bg-slate-800/50 rounded-xl"
          >
            <component :is="isMenuOpen ? X : Menu" :size="24" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition 
      enter-active-class="animate-in slide-in-from-top duration-300" 
      leave-active-class="animate-out slide-out-to-top duration-300"
    >
      <div 
        v-if="isMenuOpen" 
        class="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-4 space-y-4 shadow-2xl"
      >
        <a 
          v-for="link in navLinks" 
          :key="link.name" 
          :href="link.href" 
          @click="isMenuOpen = false" 
          class="block px-4 py-3 text-sm font-black text-gray-500 dark:text-gray-300 uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          {{ link.name }}
        </a>
        <router-link 
          to="/login" 
          class="block px-4 py-4 text-center bg-blue-600 text-white rounded-xl font-black uppercase text-xs"
        >
          Área de Gestão
        </router-link>
      </div>
    </Transition>
  </nav>
</template>
