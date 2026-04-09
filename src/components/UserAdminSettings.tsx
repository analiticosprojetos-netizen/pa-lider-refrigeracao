"use client";

import React from 'react';
import { Shield, UserPlus, Trash2, Check, X, Lock, Eye, Edit2, AlertCircle, Briefcase, Plus, Mail, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';

export interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissions {
  estoque: Permission;
  orcamentos: Permission;
  clientes: Permission;
  historico: Permission;
  config: Permission;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: string;
  permissions: RolePermissions;
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  estoque: { view: true, edit: false, delete: false },
  orcamentos: { view: true, edit: false, delete: false },
  clientes: { view: true, edit: false, delete: false },
  historico: { view: true, edit: false, delete: false },
  config: { view: false, edit: false, delete: false },
};

const FULL_PERMISSIONS: RolePermissions = {
  estoque: { view: true, edit: true, delete: true },
  orcamentos: { view: true, edit: true, delete: true },
  clientes: { view: true, edit: true, delete: true },
  historico: { view: true, edit: true, delete: true },
  config: { view: true, edit: true, delete: true },
};

const UserAdminSettings = () => {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [roles, setRoles] = React.useState<string[]>(['ADMIN', 'CEO', 'DIRETOR', 'GERENTE', 'ANALISTA']);
  const [newRoleName, setNewRoleName] = React.useState('');
  const [newUser, setNewUser] = React.useState({ username: '', email: '', password: '', role: 'ANALISTA' });
  
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  React.useEffect(() => {
    const savedUsers = localStorage.getItem('lider_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else {
      const admin: UserProfile = { 
        id: '1', 
        username: 'admin', 
        email: 'admin@lider.com',
        password: '1234',
        role: 'ADMIN', 
        permissions: FULL_PERMISSIONS 
      };
      setUsers([admin]);
      localStorage.setItem('lider_users', JSON.stringify([admin]));
    }

    const savedRoles = localStorage.getItem('lider_roles');
    if (savedRoles) setRoles(JSON.parse(savedRoles));
  }, []);

  const saveUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('lider_users', JSON.stringify(updatedUsers));
  };

  const saveRoles = (updatedRoles: string[]) => {
    setRoles(updatedRoles);
    localStorage.setItem('lider_roles', JSON.stringify(updatedRoles));
  };

  const handleAddRole = () => {
    if (!newRoleName) return;
    const upperRole = newRoleName.toUpperCase();
    if (roles.includes(upperRole)) {
      showError('Este cargo já existe.');
      return;
    }
    const updatedRoles = [...roles, upperRole];
    saveRoles(updatedRoles);
    setNewRoleName('');
    showSuccess('Novo cargo criado!');
  };

  const handleDeleteRole = (roleToDelete: string) => {
    if (roleToDelete === 'ADMIN') {
      showError('O cargo ADMIN não pode ser excluído.');
      return;
    }
    if (users.some(u => u.role === roleToDelete)) {
      showError('Não é possível excluir um cargo que possui usuários vinculados.');
      return;
    }
    const updatedRoles = roles.filter(r => r !== roleToDelete);
    saveRoles(updatedRoles);
    showSuccess('Cargo excluído.');
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      showError('Preencha todos os campos (Nome, E-mail e Senha).');
      return;
    }
    
    if (users.some(u => u.username === newUser.username || u.email === newUser.email)) {
      showError('Nome de usuário ou e-mail já cadastrado.');
      return;
    }

    const user: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      permissions: (newUser.role === 'ADMIN' || newUser.role === 'CEO') ? FULL_PERMISSIONS : DEFAULT_PERMISSIONS
    };
    saveUsers([...users, user]);
    setNewUser({ username: '', email: '', password: '', role: roles[0] || 'ANALISTA' });
    showSuccess('Usuário criado com sucesso!');
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveUserEdit = () => {
    if (!editingUser) return;
    
    if (!editingUser.username || !editingUser.email) {
      showError('Nome e E-mail são obrigatórios.');
      return;
    }

    const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
    saveUsers(updatedUsers);
    setIsEditModalOpen(false);
    showSuccess('Dados do usuário atualizados!');
  };

  const togglePermission = (userId: string, tab: keyof RolePermissions, action: keyof Permission) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const newPerms = { ...u.permissions };
        newPerms[tab] = { ...newPerms[tab], [action]: !newPerms[tab][action] };
        return { ...u, permissions: newPerms };
      }
      return u;
    });
    saveUsers(updated);
  };

  const deleteUser = (id: string) => {
    if (window.confirm('Excluir este usuário?')) {
      saveUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* GESTÃO DE CARGOS */}
      <Card className="border-blue-100 dark:border-slate-800 shadow-md dark:bg-slate-900">
        <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white">
            <Briefcase className="text-blue-600" /> Gestão de Cargos (Hierarquias)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Nome do Novo Cargo</label>
              <Input 
                placeholder="Ex: COORDENADOR" 
                value={newRoleName} 
                onChange={e => setNewRoleName(e.target.value)}
                className="dark:bg-slate-950 dark:border-slate-800"
              />
            </div>
            <Button onClick={handleAddRole} className="bg-blue-600">
              <Plus className="mr-2 h-4 w-4" /> Criar Cargo
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <div key={role} className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-blue-100 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-xs font-black text-blue-900 dark:text-blue-400">{role}</span>
                {role !== 'ADMIN' && (
                  <button onClick={() => handleDeleteRole(role)} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* NOVO USUÁRIO */}
      <Card className="border-blue-100 dark:border-slate-800 shadow-md dark:bg-slate-900">
        <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white">
            <UserPlus className="text-blue-600" /> Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Nome de Usuário</label>
              <Input 
                placeholder="Ex: joao.silva" 
                value={newUser.username} 
                onChange={e => setNewUser({...newUser, username: e.target.value})}
                className="dark:bg-slate-950 dark:border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</label>
              <Input 
                type="email"
                placeholder="email@lider.com" 
                value={newUser.email} 
                onChange={e => setNewUser({...newUser, email: e.target.value})}
                className="dark:bg-slate-950 dark:border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Senha de Acesso</label>
              <Input 
                type="password"
                placeholder="Defina uma senha" 
                value={newUser.password} 
                onChange={e => setNewUser({...newUser, password: e.target.value})}
                className="dark:bg-slate-950 dark:border-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Cargo / Hierarquia</label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({...newUser, role: v})}>
                <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddUser} className="bg-blue-600 w-full">
              Criar Usuário
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TABELA DE PERMISSÕES */}
      <Card className="border-blue-100 dark:border-slate-800 shadow-md overflow-hidden dark:bg-slate-900">
        <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white">
            <Shield className="text-blue-600" /> Controle de Acessos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-slate-800/30">
                  <TableHead className="w-[250px] font-bold">Usuário / E-mail</TableHead>
                  <TableHead className="text-center font-bold">Estoque</TableHead>
                  <TableHead className="text-center font-bold">Orçamentos</TableHead>
                  <TableHead className="text-center font-bold">Clientes</TableHead>
                  <TableHead className="text-center font-bold">Histórico</TableHead>
                  <TableHead className="text-center font-bold">Config</TableHead>
                  <TableHead className="text-right font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/20">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-blue-900 dark:text-white">{user.username}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{user.email}</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter mt-1">{user.role}</span>
                      </div>
                    </TableCell>
                    
                    {(['estoque', 'orcamentos', 'clientes', 'historico', 'config'] as const).map((tab) => (
                      <TableCell key={tab} className="text-center">
                        <div className="flex gap-1 justify-center">
                          <PermissionToggle 
                            active={user.permissions[tab].view} 
                            icon={<Eye size={12} />} 
                            label="Ver"
                            onClick={() => togglePermission(user.id, tab, 'view')}
                            disabled={user.role === 'ADMIN'}
                          />
                          <PermissionToggle 
                            active={user.permissions[tab].edit} 
                            icon={<Edit2 size={12} />} 
                            label="Edit"
                            onClick={() => togglePermission(user.id, tab, 'edit')}
                            disabled={user.role === 'ADMIN'}
                          />
                          <PermissionToggle 
                            active={user.permissions[tab].delete} 
                            icon={<Trash2 size={12} />} 
                            label="Del"
                            onClick={() => togglePermission(user.id, tab, 'delete')}
                            disabled={user.role === 'ADMIN'}
                          />
                        </div>
                      </TableCell>
                    ))}

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400" onClick={() => handleEditUser(user)}>
                          <Edit2 size={16} />
                        </Button>
                        {user.role !== 'ADMIN' && (
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteUser(user.id)}>
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE EDIÇÃO DE USUÁRIO */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-white">Editar Perfil do Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Nome de Usuário</label>
                <Input 
                  value={editingUser.username} 
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">E-mail</label>
                <Input 
                  type="email"
                  value={editingUser.email} 
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Nova Senha (Deixe em branco para manter)</label>
                <Input 
                  type="password"
                  placeholder="Digite a nova senha..."
                  onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Cargo / Hierarquia</label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(v) => setEditingUser({...editingUser, role: v})}
                  disabled={editingUser.username === 'admin'} // Proteção para o admin principal
                >
                  <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="dark:border-slate-800">Cancelar</Button>
            <Button className="bg-blue-600" onClick={handleSaveUserEdit}>
              <Save className="mr-2 h-4 w-4" /> Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const PermissionToggle = ({ active, icon, label, onClick, disabled }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void, disabled?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`p-1.5 rounded-md transition-all border ${
      active 
        ? 'bg-blue-600 border-blue-700 text-white shadow-sm' 
        : 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 grayscale opacity-50'
    } ${disabled ? 'cursor-not-allowed opacity-30' : 'hover:scale-110'}`}
  >
    {icon}
  </button>
);

export default UserAdminSettings;