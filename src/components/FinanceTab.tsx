"use client";

import React from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Receipt, Plus, Trash2, 
  AlertCircle, Wallet, PieChart, Calendar, ArrowUpRight, ArrowDownRight,
  Percent, CheckCircle2, Clock, Edit2, Save, X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';

interface Expense {
  id: string;
  description: string;
  value: number;
  category: string;
  dueDate: string;
  paymentDate?: string;
  status: 'Pago' | 'Em Aberto';
}

interface FinanceTabProps {
  orders: any[];
}

const FinanceTab = ({ orders }: FinanceTabProps) => {
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = React.useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  
  const [newExpense, setNewExpense] = React.useState({
    description: '',
    value: '',
    category: 'Fixo',
    dueDate: new Date().toISOString().split('T')[0]
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
      dueDate: newExpense.dueDate,
      status: 'Em Aberto'
    };

    saveExpenses([expense, ...expenses]);
    setNewExpense({ ...newExpense, description: '', value: '' });
    showSuccess('Despesa registrada como "Em Aberto"!');
  };

  const toggleStatus = (id: string) => {
    const updated = expenses.map(e => {
      if (e.id === id) {
        const isPaying = e.status === 'Em Aberto';
        return { 
          ...e, 
          status: isPaying ? 'Pago' : 'Em Aberto',
          paymentDate: isPaying ? new Date().toISOString().split('T')[0] : undefined
        } as Expense;
      }
      return e;
    });
    saveExpenses(updated);
    showSuccess('Status da despesa atualizado!');
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense({ ...expense });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingExpense) return;
    const updated = expenses.map(e => e.id === editingExpense.id ? editingExpense : e);
    saveExpenses(updated);
    setIsEditModalOpen(false);
    showSuccess('Despesa atualizada!');
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

  const totalPaidExpenses = expenses
    .filter(e => e.status === 'Pago')
    .reduce((acc, e) => acc + e.value, 0);

  const totalPendingExpenses = expenses
    .filter(e => e.status === 'Em Aberto')
    .reduce((acc, e) => acc + e.value, 0);

  const totalDiscounts = orders
    .filter(o => o.status === 'Executado')
    .reduce((acc, o) => acc + (o.discountValue || 0), 0);

  const netProfit = revenueExecuted - totalPaidExpenses;

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
          title="Saídas (Pago)" 
          value={totalPaidExpenses} 
          icon={<ArrowDownRight className="text-red-500" />} 
          color="border-red-100 bg-red-50/30"
          subtitle="Total já quitado"
        />
        <FinanceCard 
          title="Contas a Pagar" 
          value={totalPendingExpenses} 
          icon={<Clock className="text-orange-500" />} 
          color="border-orange-100 bg-orange-50/30"
          subtitle="Dívidas em aberto"
        />
        <FinanceCard 
          title="Saldo Real" 
          value={netProfit} 
          icon={<Wallet className={netProfit >= 0 ? "text-blue-500" : "text-red-600"} />} 
          color={netProfit >= 0 ? "border-blue-100 bg-blue-50/30" : "border-red-200 bg-red-50"}
          subtitle="Lucro (Entradas - Pagos)"
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
                <label className="text-[10px] font-black text-gray-400 uppercase">Data de Vencimento</label>
                <Input 
                  type="date" 
                  value={newExpense.dueDate}
                  onChange={e => setNewExpense({...newExpense, dueDate: e.target.value})}
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
                    <TableHead className="font-bold">Vencimento</TableHead>
                    <TableHead className="font-bold">Descrição</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Valor</TableHead>
                    <TableHead className="text-right font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((e) => (
                    <TableRow key={e.id} className="hover:bg-blue-50/10 dark:hover:bg-slate-800/10">
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col">
                          <span>{e.dueDate.split('-').reverse().join('/')}</span>
                          {e.paymentDate && <span className="text-[9px] text-green-500 font-bold">Pago em: {e.paymentDate.split('-').reverse().join('/')}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium dark:text-gray-300">{e.description}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold">{e.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button 
                          onClick={() => toggleStatus(e.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                            e.status === 'Pago' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}
                        >
                          {e.status === 'Pago' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {e.status}
                        </button>
                      </TableCell>
                      <TableCell className="text-right font-bold dark:text-gray-300">R$ {e.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400" onClick={() => handleEditClick(e)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteExpense(e.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
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

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-white">Editar Despesa</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Descrição</label>
                <Input 
                  value={editingExpense.description} 
                  onChange={(e) => setEditingExpense({...editingExpense, description: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Valor (R$)</label>
                  <Input 
                    type="number"
                    value={editingExpense.value} 
                    onChange={(e) => setEditingExpense({...editingExpense, value: Number(e.target.value)})} 
                    className="dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Categoria</label>
                  <Select value={editingExpense.category} onValueChange={v => setEditingExpense({...editingExpense, category: v})}>
                    <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixo">Fixo</SelectItem>
                      <SelectItem value="Variável">Variável</SelectItem>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Vencimento</label>
                <Input 
                  type="date"
                  value={editingExpense.dueDate} 
                  onChange={(e) => setEditingExpense({...editingExpense, dueDate: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="dark:border-slate-800">Cancelar</Button>
            <Button className="bg-blue-600" onClick={handleSaveEdit}>
              <Save className="mr-2 h-4 w-4" /> Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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