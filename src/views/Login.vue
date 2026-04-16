<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-950 p-4 transition-colors">
    <div class="absolute top-8 left-8">
      <router-link to="/" class="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 transition">
        <ArrowLeft class="h-4 w-4" /> Voltar ao site
      </router-link>
    </div>
    
    <div class="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl border border-blue-100 dark:border-slate-800 rounded-xl overflow-hidden">
      <!-- Header do Card -->
      <div class="p-6 text-center space-y-2 border-b border-gray-100 dark:border-slate-800">
        <div class="flex justify-center mb-4">
          <div class="bg-blue-600 p-3 rounded-2xl shadow-lg ring-4 ring-blue-50/50 dark:ring-slate-800/50">
            <Snowflake class="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 class="text-2xl font-bold text-blue-900 dark:text-white tracking-tight">Gestão Lider</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Entre com seu usuário ou e-mail</p>
      </div>

      <!-- Corpo do Formulário -->
      <form @submit.prevent="handleLogin" class="p-6 space-y-6">
        <div class="space-y-4">
          <div class="relative">
            <User class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              v-model="identifier"
              type="text"
              placeholder="Usuário ou E-mail"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-950 dark:text-white transition"
              required
            />
          </div>

          <div class="relative">
            <Lock class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              v-model="password"
              type="password"
              placeholder="Senha"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-950 dark:text-white transition"
              required
            />
          </div>
          
          <div class="flex justify-end">
            <button 
              type="button" 
              @click="handleForgot"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium transition"
            >
              <HelpCircle class="w-3 h-3" /> Esqueceu a senha?
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg transition-transform transform active:scale-95 shadow-lg flex justify-center items-center gap-2"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <span v-else>Entrar no Sistema</span>
        </button>

        <p v-if="error" class="text-sm font-semibold text-red-500 text-center animate-pulse">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Snowflake, Lock, User, ArrowLeft, HelpCircle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const identifier = ref('admin')
const password = ref('1234')
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true
  
  try {
    await authStore.login(identifier.value, password.value)
    alert(`Bem-vindo, ${authStore.user?.username}!`)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

const handleForgot = () => {
  alert('Por favor, entre em contato com o administrador do sistema para redefinir sua senha.')
}
</script>
