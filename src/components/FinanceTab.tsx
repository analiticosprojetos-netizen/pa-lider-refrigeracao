"use client";

import React from 'react';
import { 
  TrendingUp, TrendingDown, Landmark, Receipt, 
  Plus, Calendar, Search, Filter, Download, 
  ArrowUpCircle, ArrowDownCircle, Wallet, BarChart3,
  AlertCircle, CheckCircle2, Clock, Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';
import { UserProfile } from './UserAdminSettings';

interface FinanceTabProps {
  orders: any[];
}

const FinanceTab = ({ orders }: FinanceTabProps) => {
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  // Se não tiver permissão de ver o financeiro, nem renderiza
  if (currentUser && !currentUser.permissions.financeiro.view) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full"><AlertCircle className="text-red-500 h-12 w-12" /></div>
        <h3 className="text-xl font-bold text-gray-900">Acesso Negado</h3>
        <p className="text-gray-500 max-w-xs">Você não tem permissão para visualizar o módulo financeiro. Contate o administrador.</p>
      </div>
    );
  }

  const perms = currentUser?.permissions.financeiro;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-white">Gestão Financeira</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Exportar Relatório</Button>
        </div>
      </div>

      <Tabs defaultValue={perms?.abaLancamentos ? "lancamentos" : perms?.abaFluxoCaixa ? "fluxo" : "resumo"} className="w-full">
        <TabsList className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 mb-6 w-full justify-start overflow-x-auto flex-nowrap scrollbar-hide">
          <TabsTrigger value="resumo">Resumo Geral</TabsTrigger>
          {perms?.abaLancamentos && <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>}
          {perms?.abaFluxoCaixa && <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>}
          {perms?.abaContasPagar && <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>}
          {perms?.abaContasReceber && <TabsTrigger value="receber">Contas a Receber</TabsTrigger>}
          {perms?.abaRelatorios && <TabsTrigger value="relatorios">Relatórios</TabsTrigger>}
        </TabsList>

        <TabsContent value="resumo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-100 bg-green-50/30">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-green-600 uppercase">Receitas (Mês)</p>
                    <h3 className="text-2xl font-black text-green-700">R$ 45.250,00</h3>
                  </div>
                  <TrendingUp className="text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-100 bg-red-50/30">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-red-600 uppercase">Despesas (Mês)</p>
                    <h3 className="text-2xl font-black text-red-700">R$ 12.800,00</h3>
                  </div>
                  <TrendingDown className="text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-100 bg-blue-50/30">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase">Saldo Projetado</p>
                    <h3 className="text-2xl font-black text-blue-700">R$ 32.450,00</h3>
                  </div>
                  <Landmark className="text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Clock size={18} className="text-blue-600" /> Últimas Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 italic">Resumo das atividades financeiras recentes...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {perms?.abaLancamentos && (
          <TabsContent value="lancamentos">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Livro de Lançamentos</CardTitle>
                {currentUser?.permissions.financeiro.edit && (
                  <Button className="bg-blue-600"><Plus className="mr-2 h-4 w-4" /> Novo Lançamento</Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-gray-400">
                  <Receipt size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhum lançamento manual registrado este mês.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Outras abas seguem a mesma lógica de verificação de perms... */}
      </Tabs>
    </div>
  );
};

export default FinanceTab;