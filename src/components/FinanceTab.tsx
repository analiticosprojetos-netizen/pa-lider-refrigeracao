"use client";

import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Receipt, Plus, Trash2, 
  AlertCircle, Wallet, PieChart, Calendar, ArrowUpRight, ArrowDownRight,
  Percent
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';

interface Expense {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string;
  recurring: boolean;
}

interface FinanceTabProps {
  orders: any[];
}

const FinanceTab = ({ orders }: FinanceTabProps) => {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [newExpense, setNewExpense] = React.useState({
    description: '',
    value: '',
    category: 'Fixo',
    date: new Date().toISOString().split('T')[0],
    recurring: false
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('lider_expenses');
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  const saveExpenses = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem('lider_expenses', JSON.stringify(updated));
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.value) {
      showError('Preencha a descrição e o valor.');
      return;
    }

    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: newExpense.description,
      value: Number(newExpense.value),
      category: newExpense.category,
      date: newExpense.date,
      recurring: newExpense.recurring
    };

    saveExpenses([expense, ...expenses]);
    setNewExpense({ ...newExpense, description: '', value: '' });
    showSuccess('Despesa registrada!');
  };

  const deleteExpense = (id: string) => {
    if (window.confirm('Excluir esta despesa?')) {
      saveExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Cálculos Financeiros
  const revenueExecuted = orders
    .filter(o => o.status === 'Executado')
    .reduce((acc, o) => acc + o.total, 0);

  const revenuePending = orders
    .filter(o => o.status === 'Pendente')
    .reduce((acc, o) => acc + o.total, 0);

  const totalDiscounts = orders
    .filter(o => o.status === 'Executado')
    .reduce((acc, o) => acc + (o.discountValue || 0), 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.value, 0);
  const netProfit = revenueExecuted - totalExpenses;

  return (
    <div className="space-y-8">
      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceCard 
          title="Entradas (Executado)" 
          value={revenueExecuted} 
          icon={<ArrowUpRight className="text-green-500" />} 
          color="border-green-100 bg-green-50/30"
          subtitle="Dinheiro em caixa"
        />
        <FinanceCard 
          title="Saídas (Despesas)" 
          value={totalExpenses} 
          icon={<ArrowDownRight className="text-red-500" />} 
          color="border-red-100 bg-red-50/30"
          subtitle="Custos operacionais"
        />
        <FinanceCard 
          title="Saldo Real" 
          value={netProfit} 
          icon={<Wallet className={netProfit >= 0 ? "text-blue-500" : "text-red-600"} />} 
          color={netProfit >= 0 ? "border-blue-100 bg-blue-50/30" : "border-red-200 bg-red-50"}
          subtitle="Lucro líquido atual"
        />
        <FinanceCard 
          title="Descontos Dados" 
          value={totalDiscounts} 
          icon={<Percent className="text-orange-500" />} 
          color="border-orange-100 bg-orange-50/30"
          subtitle="Total de abatimentos"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lançamento de Despesas */}
        <Card className="h-fit shadow-lg border-blue-100 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white">
              <Receipt className="text-blue-600" /> Registrar Gasto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Descrição do Gasto</label>
                <Input 
                  placeholder="Ex: Conta de Luz, Aluguel..." 
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Valor (R$)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={newExpense.value}
                    onChange={e => setNewExpense({...newExpense, value: e.target.value})}
                    className="dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Categoria</label>
                  <Select value={newExpense.category} onValueChange={v => setNewExpense({...newExpense, category: v})}>
                    <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixo">Fixo (Aluguel, Luz...)</SelectItem>
                      <SelectItem value="Variável">Variável (Peças, Ferramentas)</SelectItem>
                      <SelectItem value="Pessoal">Pessoal (Salários, Pró-labore)</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Data do Pagamento</label>
                <Input 
                  type="date" 
                  value={newExpense.date}
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 font-bold">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Despesa
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabela de Despesas */}
        <Card className="lg:col-span-2 shadow-lg border-blue-100 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white">
              <PieChart className="text-blue-600" /> Histórico de Saídas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                    <TableHead className="font-bold">Data</TableHead>
                    <TableHead className="font-bold">Descrição</TableHead>
                    <TableHead className="font-bold">Categoria</TableHead>
                    <TableHead className="text-right font-bold">Valor</TableHead>
                    <TableHead className="text-right font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((e) => (
                    <TableRow key={e.id} className="hover:bg-red-50/10 dark:hover:bg-red-900/10">
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">{e.date.split('-').reverse().join('/')}</TableCell>
                      <TableCell className="font-medium dark:text-gray-300">{e.description}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400">
                          {e.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-red-600 dark:text-red-400">R$ {e.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteExpense(e.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">Nenhuma despesa registrada.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Orçamentos Pendentes */}
      <Card className="shadow-lg border-yellow-100 dark:border-yellow-900/30 bg-yellow-50/20 dark:bg-yellow-900/5">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-2xl">
              <DollarSign className="text-yellow-600 dark:text-yellow-400" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-400">Previsão de Recebimento</h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-500/70">Valores de orçamentos que ainda estão como "Pendente"</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-yellow-700 dark:text-yellow-400">R$ {revenuePending.toFixed(2)}</p>
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest">Aguardando Execução</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FinanceCard = ({ title, value, icon, color, subtitle }: { title: string, value: number, icon: React.ReactNode, color: string, subtitle: string }) => (
  <Card className={`border shadow-sm ${color}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</p>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-black ${value < 0 ? 'text-red-600' : 'text-blue-900 dark:text-white'}`}>
        R$ {value.toFixed(2)}
      </p>
      <p className="text-[10px] text-gray-400 mt-1 font-medium">{subtitle}</p>
    </CardContent>
  </Card>
);

export default FinanceTab;