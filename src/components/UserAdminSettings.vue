<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Shield, UserPlus, Trash2, X, Briefcase, Plus, Save, Edit2, Eye, Camera, KeyRound, User
} from 'lucide-vue-next'
import { useAuthStore, type UserProfile, type RolePermissions } from '../stores/auth'

const authStore = useAuthStore()
const users = ref<UserProfile[]>([])
const roles = ref<string[]>(['ADMIN', 'CEO', 'DIRETOR', 'GERENTE', 'ANALISTA'])
const newRoleName = ref('')
const newUser = ref({ username: '', email: '', password: '', role: 'ANALISTA' })

// Modal de edição
const editingUser = ref<UserProfile | null>(null)
const isEditModalOpen = ref(false)
const editForm = ref({ username: '', email: '', password: '', avatarUrl: '' })

const DEFAULT_PERMISSIONS: RolePermissions = {
  estoque: { view: true, edit: false, delete: false },
  orcamentos: { view: true, edit: false, delete: false },
  clientes: { view: true, edit: false, delete: false },
  historico: { view: true, edit: false, delete: false },
  financeiro: { view: false, edit: false, delete: false },
  config: { view: false, edit: false, delete: false },
}

const FULL_PERMISSIONS: RolePermissions = {
  estoque: { view: true, edit: true, delete: true },
  orcamentos: { view: true, edit: true, delete: true },
  clientes: { view: true, edit: true, delete: true },
  historico: { view: true, edit: true, delete: true },
  financeiro: { view: true, edit: true, delete: true },
  config: { view: true, edit: true, delete: true },
}

onMounted(() => {
  const savedUsers = localStorage.getItem('lider_users')
  if (savedUsers) {
    users.value = JSON.parse(savedUsers)
  } else {
    const admin: UserProfile = {
      id: '1',
      username: 'admin',
      email: 'admin@lider.com',
      password: '1234',
      role: 'ADMIN',
      permissions: FULL_PERMISSIONS,
      avatarUrl: ''
    } as any
    users.value = [admin]
    localStorage.setItem('lider_users', JSON.stringify(users.value))
  }
  const savedRoles = localStorage.getItem('lider_roles')
  if (savedRoles) roles.value = JSON.parse(savedRoles)
})

const saveUsers = () => {
  localStorage.setItem('lider_users', JSON.stringify(users.value))
}

const saveRoles = () => {
  localStorage.setItem('lider_roles', JSON.stringify(roles.value))
}

const handleAddRole = () => {
  if (!newRoleName.value) return
  const upper = newRoleName.value.toUpperCase()
  if (roles.value.includes(upper)) return alert('Cargo já existe')
  roles.value.push(upper)
  saveRoles()
  newRoleName.value = ''
}

const handleAddUser = () => {
  if (!newUser.value.username || !newUser.value.email) return
  const user: UserProfile = {
    id: Math.random().toString(36).substr(2, 9),
    username: newUser.value.username,
    email: newUser.value.email,
    password: newUser.value.password,
    role: newUser.value.role,
    permissions: (newUser.value.role === 'ADMIN' || newUser.value.role === 'CEO') ? FULL_PERMISSIONS : DEFAULT_PERMISSIONS
  }
  users.value.push(user)
  saveUsers()
  newUser.value = { username: '', email: '', password: '', role: 'ANALISTA' }
}

const openEditModal = (user: any) => {
  editingUser.value = user
  editForm.value = {
    username: user.username,
    email: user.email,
    password: '',
    avatarUrl: user.avatarUrl || ''
  }
  isEditModalOpen.value = true
}

const handleSaveEdit = () => {
  if (!editingUser.value) return
  const idx = users.value.findIndex(u => u.id === editingUser.value!.id)
  if (idx === -1) return

  users.value[idx].username = editForm.value.username
  users.value[idx].email = editForm.value.email
  ;(users.value[idx] as any).avatarUrl = editForm.value.avatarUrl
  if (editForm.value.password) {
    users.value[idx].password = editForm.value.password
  }
  saveUsers()

  // Atualiza sessão se for o usuário logado
  if (authStore.user && authStore.user.id === editingUser.value.id) {
    authStore.user.username = editForm.value.username
    authStore.user.email = editForm.value.email
    ;(authStore.user as any).avatarUrl = editForm.value.avatarUrl
    localStorage.setItem('lider_user', JSON.stringify(authStore.user))
  }

  isEditModalOpen.value = false
  alert('Usuário atualizado com sucesso!')
}

const togglePermission = (userId: string, tab: keyof RolePermissions, action: 'view' | 'edit' | 'delete') => {
  const user = users.value.find(u => u.id === userId)
  // ADMIN sempre mantém todas as permissões
  if (!user || user.role === 'ADMIN') return
  user.permissions[tab][action] = !user.permissions[tab][action]
  saveUsers()
}

const deleteUser = (id: string) => {
  if (confirm('Deseja excluir este usuário?')) {
    users.value = users.value.filter(u => u.id !== id)
    saveUsers()
  }
}
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Gestão de Cargos -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-blue-50 dark:border-slate-800 shadow-xl">
      <div class="flex items-center gap-3 mb-6">
        <Briefcase class="text-blue-600" />
        <h3 class="text-lg font-black text-blue-900 dark:text-white">Gestão de Cargos</h3>
      </div>
      <div class="flex gap-4 items-end mb-6">
        <div class="flex-1 space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Novo Cargo</label>
          <input v-model="newRoleName" placeholder="Ex: COORDENADOR" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none dark:text-white" />
        </div>
        <button @click="handleAddRole" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"><Plus :size="18" /> Criar</button>
      </div>
      <div class="flex flex-wrap gap-2">
        <div v-for="role in roles" :key="role" class="px-4 py-1.5 bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 rounded-full font-black text-xs flex items-center gap-2 border border-blue-100 dark:border-slate-700">
          {{ role }}
          <button v-if="role !== 'ADMIN'" @click="roles = roles.filter(r => r !== role); saveRoles()" class="hover:text-red-500"><X :size="14" /></button>
        </div>
      </div>
    </div>

    <!-- Novo Usuário -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-blue-50 dark:border-slate-800 shadow-xl">
      <div class="flex items-center gap-3 mb-6">
        <UserPlus class="text-blue-600" />
        <h3 class="text-lg font-black text-blue-900 dark:text-white">Cadastrar Novo Usuário</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Usuário</label>
          <input v-model="newUser.username" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none dark:text-white" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">E-mail</label>
          <input v-model="newUser.email" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none dark:text-white" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Senha</label>
          <input v-model="newUser.password" type="password" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none dark:text-white" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-bold text-gray-400 uppercase">Cargo</label>
          <select v-model="newUser.role" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 dark:bg-slate-950 outline-none dark:text-white appearance-none">
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <button @click="handleAddUser" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">Criar Usuário</button>
      </div>
    </div>

    <!-- Tabela de Controle de Acessos -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border border-blue-50 dark:border-slate-800 shadow-xl overflow-hidden">
      <div class="p-8 border-b dark:border-slate-800">
        <div class="flex items-center gap-3">
          <Shield class="text-blue-600" />
          <h3 class="text-lg font-black text-blue-900 dark:text-white">Controle de Acessos</h3>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-slate-800 text-[10px] font-black uppercase text-gray-500 border-b dark:border-slate-700">
              <th class="px-6 py-4">Usuário</th>
              <th v-for="t in ['estoque', 'orcamentos', 'clientes', 'historico', 'financeiro', 'config']" :key="t" class="px-6 py-4 text-center">{{ t }}</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
            <tr v-for="u in users" :key="u.id" class="dark:text-slate-300 hover:bg-blue-50/10 dark:hover:bg-slate-800/10 transition-colors">
              <td class="px-6 py-4">
                <!-- Avatar + Info -->
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <img v-if="(u as any).avatarUrl" :src="(u as any).avatarUrl" class="w-full h-full object-cover" />
                    <span v-else class="font-black text-blue-600 dark:text-blue-400 text-sm">{{ u.username.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div>
                    <p class="font-black text-blue-900 dark:text-white">{{ u.username }}</p>
                    <p class="text-[10px] opacity-60">{{ u.email }}</p>
                    <span class="text-[10px] font-black text-blue-600 uppercase">{{ u.role }}</span>
                  </div>
                </div>
              </td>
              <td v-for="tab in (['estoque', 'orcamentos', 'clientes', 'historico', 'financeiro', 'config'] as const)" :key="tab" class="px-6 py-4">
                <div class="flex gap-1 justify-center">
                  <button v-for="a in (['view', 'edit', 'delete'] as const)" :key="a" @click="togglePermission(u.id, tab, a)"
                    :disabled="u.role === 'ADMIN'"
                    :class="[
                      'p-1.5 rounded-lg border transition-all',
                      u.permissions[tab]?.[a] 
                        ? 'bg-blue-600 border-blue-700 text-white' 
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-400 opacity-40 grayscale',
                      u.role === 'ADMIN' ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
                    ]">
                    <component :is="a === 'view' ? Eye : a === 'edit' ? Edit2 : Trash2" :size="12" />
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <!-- Editar — disponível para TODOS os usuários incluindo ADMIN -->
                  <button @click="openEditModal(u)" class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-100 dark:border-blue-800 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                    <Edit2 :size="15" />
                  </button>
                  <!-- Excluir — apenas não-ADMIN -->
                  <button v-if="u.role !== 'ADMIN'" @click="deleteUser(u.id)" class="p-2 bg-red-50 text-red-400 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    <Trash2 :size="15" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Editar Usuário -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div class="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <!-- Header Modal -->
        <div class="px-10 py-8 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-blue-50/30 dark:bg-slate-800/30">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <User class="text-blue-600" :size="20" />
            </div>
            <div>
              <h3 class="text-xl font-black text-blue-900 dark:text-white uppercase tracking-tight">Editar Usuário</h3>
              <p class="text-[10px] text-gray-400 font-bold uppercase">{{ editingUser?.role }}</p>
            </div>
          </div>
          <button @click="isEditModalOpen = false" class="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl text-gray-400 transition-all">
            <X :size="22" />
          </button>
        </div>

        <div class="p-10 space-y-6">
          <!-- Preview Avatar -->
          <div class="flex items-center gap-6">
            <div class="h-20 w-20 rounded-2xl overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 border-4 border-blue-100 dark:border-blue-900/30">
              <img v-if="editForm.avatarUrl" :src="editForm.avatarUrl" class="w-full h-full object-cover" />
              <span v-else class="font-black text-blue-600 dark:text-blue-400 text-3xl">{{ editingUser?.username.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex-1 space-y-1.5">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Camera :size="11" /> URL da Foto de Perfil
              </label>
              <input v-model="editForm.avatarUrl" type="text" placeholder="https://..." class="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs dark:text-white" />
            </div>
          </div>

          <!-- Nome -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <User :size="11" /> Nome de Usuário
            </label>
            <input v-model="editForm.username" type="text" class="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 font-black text-sm dark:text-white transition-all" />
          </div>

          <!-- E-mail -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail</label>
            <input v-model="editForm.email" type="email" class="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
          </div>

          <!-- Nova Senha -->
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <KeyRound :size="11" /> Nova Senha <span class="text-gray-300 font-normal normal-case">(deixe em branco para manter)</span>
            </label>
            <input v-model="editForm.password" type="password" placeholder="••••••••" class="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 font-black text-sm dark:text-white transition-all" />
          </div>
        </div>

        <div class="px-10 py-8 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
          <button @click="isEditModalOpen = false" class="px-6 py-3 font-black text-gray-400 uppercase text-xs hover:text-gray-600">Cancelar</button>
          <button @click="handleSaveEdit" class="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2">
            <Save :size="16" /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
