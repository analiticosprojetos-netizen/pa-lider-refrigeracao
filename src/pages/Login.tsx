"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Snowflake, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { UserProfile } from '@/components/UserAdminSettings';

const Login = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Buscar usuários cadastrados
    const savedUsers = localStorage.getItem('lider_users');
    const users: UserProfile[] = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Verificar se existe usuário com essas credenciais
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      showSuccess(`Bem-vindo, ${user.username}!`);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/dashboard');
    } else {
      showError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-blue-600 dark:text-blue-400">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao site
        </Button>
      </div>
      
      <Card className="w-full max-w-md shadow-xl border-blue-100 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <Snowflake className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900 dark:text-white">Gestão Lider</CardTitle>
          <CardDescription className="dark:text-gray-400">Entre com suas credenciais de acesso</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Usuário" 
                  className="pl-10 dark:bg-slate-950 dark:border-slate-800"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  type="password" 
                  placeholder="Senha" 
                  className="pl-10 dark:bg-slate-950 dark:border-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg">
              Entrar no Sistema
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;