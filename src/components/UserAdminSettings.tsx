"use client";

import React from 'react';
import { Shield, UserPlus, Trash2, Check, X, Lock, Eye, Edit2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess } from '@/utils/toast';

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
  role: 'ADMIN' | 'CEO' | 'DIRETOR' | 'GERENTE' | 'ANALISTA';
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
  const [newUser, setNewUser] = React.useState({ username: '', role: 'ANALISTA' as UserProfile['role'] });
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('lider_users');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      // Usuário padrão inicial
      const admin: UserProfile = {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
        permissions: FULL_PERMISSIONS
      };
      setUsers([admin]);
      localStorage.setItem('lider_users', JSON.stringify([admin]));
    }
  }, []);

  const saveUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('lider_users', JSON.stringify(updatedUsers));
  };

  const handleAddUser = () => {
    if (!newUser.username) return;
    
    const user: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUser.username,
      role: newUser.role,
      permissions: (newUser.role === 'ADMIN' || newUser.role === 'CEO') ? FULL_PERMISSIONS : DEFAULT_PERMISSIONS
    };

    saveUsers([...users, user]);
    setNewUser({ username: '', role: 'ANALISTA' });
    showSuccess('Usuário criado com sucesso!');
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
    <div className="space-y-6">
      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-50">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <UserPlus className="text-blue-600" /> Novo Usuário / Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Nome de Usuário</label>
              <Input 
                placeholder="Ex: joao.silva" 
                value={newUser.username} 
                onChange={e => setNewUser({...newUser, username: e.target.value})}
              />
            </div>
            <div className="w-full md:w-48 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Cargo / Hierarquia</label>
              <Select value={newUser.role} onValueChange={(v: any) => setNewUser({...newUser, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CEO">CEO</SelectItem>
                  <SelectItem value="DIRETOR">Diretor</SelectItem>
                  <SelectItem value="GERENTE">Gerente</SelectItem>
                  <SelectItem value="ANALISTA">Analista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
              Criar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 shadow-md overflow-hidden">
        <CardHeader className="bg-blue-50/50 border-b border-blue-50">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <Shield className="text-blue-600" /> Controle de Acessos e Permissões
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[200px] font-bold">Usuário / Cargo</TableHead>
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
                  <TableRow key={user.id} className="hover:bg-blue-50/20">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-blue-900">{user.username}</span>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{user.role}</span>
                      </div>
                    </TableCell>
                    
                    {(['estoque', 'orcamentos', 'clientes', 'historico', 'config'] as const).map((tab) => (
                      <TableCell key={tab} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex gap-2">
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
                        </div>
                      </TableCell>
                    ))}

                    <TableCell className="text-right">
                      {user.role !== 'ADMIN' && (
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteUser(user.id)}>
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start">
        <AlertCircle className="text-amber-600 shrink-0" />
        <div className="text-xs text-amber-800 space-y-1">
          <p className="font-bold uppercase">Nota sobre Hierarquia:</p>
          <p>• <b>ADMIN/CEO:</b> Possuem acesso total por padrão.</p>
          <p>• <b>DIRETOR/GERENTE:</b> Podem ter permissões de edição e exclusão delegadas.</p>
          <p>• <b>ANALISTA:</b> Geralmente possui apenas permissão de visualização.</p>
        </div>
      </div>
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
        : 'bg-gray-100 border-gray-200 text-gray-400 grayscale opacity-50'
    } ${disabled ? 'cursor-not-allowed opacity-30' : 'hover:scale-110'}`}
  >
    {icon}
  </button>
);

export default UserAdminSettings;