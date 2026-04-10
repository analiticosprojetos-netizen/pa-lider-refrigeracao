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

interface Transaction {
  id: string;
  description: string;
  value: number;
  category: string;
  date: string;
  type: 'Entrada' | 'Saída';
  status: 'Pendente' | 'Concluído';
  paymentDate?: string;
}

interface FinanceTabProps {
  orders: any[];
}

const FinanceTab = ({ orders }: FinanceTabProps) => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [formType, setFormType] = React.useState<'Entrada' | 'Saída'>('Saída');
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  
  const [newTransaction, setNewTransaction] = React.useState({
    description: '',
    value: '',
    category: 'Fixo',
    date: new Date().toISOString().split('T')[0],
    status: 'Pendente' as const
  });

  React.useEffect(() => {
    const saved = localStorage.getItem('lider_transactions');
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  const saveTransactions = (updated: Transaction[]) => {
    setTransactions(updated);
    localStorage.setItem('lider_transactions', JSON.stringify(updated));
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.value) {
      showError('Preencha a descrição e o valor.');
      return;
    }

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: newTransaction.description,
      value: Number(newTransaction.value),
      category: newTransaction.category,
      date: newTransaction.date,
      type: formType,
      status: 'Pendente'
    };

    saveTransactions([transaction, ...transactions]);
    setNewTransaction({ ...newTransaction, description: '', value: '' });
    showSuccess(`${formType} registrada com sucesso!`);
  };

  const toggleStatus = (id: string) => {
    const updated = transactions.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'Pendente' ? 'Concluído' : 'Pendente';
        return { 
          ...t, 
          status: newStatus,
          paymentDate: newStatus === 'Concluído' ? new Date().toLocaleDateString() : undefined
        };
      }
      return t;
    });
    saveTransactions(updated);
    showSuccess('Status atualizado!');
  };

  const deleteTransaction = (id: string) => {
    if (window.confirm('Excluir este lançamento permanentemente?')) {
      saveTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction({ ...transaction });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingTransaction) return;
    const updated = transactions.map(t => t.id === editingTransaction.id ? editingTransaction : t);
    saveTransactions(updated);
    setIsEditModalOpen(false);
    showSuccess('Lançamento atualizado!');
  };

  // Cálculos Financeiros
  const revenueFromOrders = orders
    .filter(o => o.status === 'Executado')
    .reduce((acc, o) => acc + o.total, 0);

  const manualEntries = transactions
    .filter(t => t.type === 'Entrada' && t.status === 'Concluído')
    .reduce((acc, t) => acc + t.value, 0);

  const totalRevenue = revenueFromOrders + manualEntries;

  const totalPaidExpenses = transactions
    .filter(t => t.type === 'Saída' && t.status === 'Concluído')
    .reduce((acc, t) => acc + t.value, 0);

  const totalOpenExpenses = transactions
    .filter(t => t.type === 'Saída' && t.status === 'Pendente')
    .reduce((acc, t) => acc + t.value, 0);

  const totalOpenEntries = transactions
    .filter(t => t.type === 'Entrada' && t.status === 'Pendente')
    .reduce((acc, t) => acc + t.value, 0);

  const netProfit = totalRevenue - totalPaidExpenses;

  return (
    <div className="space-y-8">
      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceCard 
          title="Entradas (Total)" 
          value={totalRevenue} 
          icon={<ArrowUpRight className="text-green-500" />} 
          color="border-green-100 bg-green-50/30"
          subtitle="Orçamentos + Entradas Manuais"
        />
        <FinanceCard 
          title="Saídas (Pago)" 
          value={totalPaidExpenses} 
          icon={<CheckCircle2 className="text-blue-500" />} 
          color="border-blue-100 bg-blue-50/30"
          subtitle="Contas já liquidadas"
        />
        <FinanceCard 
          title="A Pagar (Pendente)" 
          value={totalOpenExpenses} 
          icon={<Clock className="text-red-500" />} 
          color="border-red-100 bg-red-50/30"
          subtitle="Despesas em aberto"
        />
        <FinanceCard 
          title="Lucro Real" 
          value={netProfit} 
          icon={<Wallet className={netProfit >= 0 ? "text-green-600" : "text-red-600"} />} 
          color={netProfit >= 0 ? "border-green-100 bg-green-50/30" : "border-red-200 bg-red-50"}
          subtitle="Entradas - Saídas Pagas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lançamento Financeiro */}
        <Card className="h-fit shadow-lg border-blue-100 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
            <div className="flex flex-col gap-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white">
                <Receipt className="text-blue-600" /> Novo Lançamento
              </CardTitle>
              <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <button 
                  onClick={() => setFormType('Entrada')}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${
                    formType === 'Entrada' 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <ArrowUpRight size={14} /> Entrada
                </button>
                <button 
                  onClick={() => setFormType('Saída')}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${
                    formType === 'Saída' 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <ArrowDownRight size={14} /> Saída
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Descrição</label>
                <Input 
                  placeholder={formType === 'Entrada' ? "Ex: Venda de Peça Avulsa, Aporte..." : "Ex: Aluguel, Luz, Peças..."}
                  value={newTransaction.description}
                  onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Valor (R$)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={newTransaction.value}
                    onChange={e => setNewTransaction({...newTransaction, value: e.target.value})}
                    className="dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Categoria</label>
                  <Select value={newTransaction.category} onValueChange={v => setNewTransaction({...newTransaction, category: v})}>
                    <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixo">Fixo</SelectItem>
                      <SelectItem value="Variável">Variável</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                      <SelectItem value="Venda">Venda</SelectItem>
                      <SelectItem value="Piedade">Piedade</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase">Data</label>
                <Input 
                  type="date" 
                  value={newTransaction.date}
                  onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <Button 
                type="submit" 
                className={`w-full py-6 font-bold transition-colors ${
                  formType === 'Entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Plus className="mr-2 h-4 w-4" /> Lançar {formType}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabela de Lançamentos */}
        <Card className="lg:col-span-2 shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white">
              <PieChart className="text-blue-600" /> Gestão de Fluxo de Caixa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                    <TableHead className="font-bold">Data</TableHead>
                    <TableHead className="font-bold">Descrição</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Valor</TableHead>
                    <TableHead className="text-right font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id} className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/30 ${t.status === 'Concluído' ? 'opacity-70' : ''}`}>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">{t.date.split('-').reverse().join('/')}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            {t.type === 'Entrada' ? <ArrowUpRight size={12} className="text-green-500" /> : <ArrowDownRight size={12} className="text-red-500" />}
                            <span className="font-bold dark:text-gray-300">{t.description}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 uppercase ml-5">{t.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <button 
                          onClick={() => toggleStatus(t.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                            t.status === 'Concluído' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 animate-pulse'
                          }`}
                        >
                          {t.status === 'Concluído' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {t.status === 'Concluído' ? (t.type === 'Entrada' ? 'Recebido' : 'Pago') : 'Pendente'}
                        </button>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${t.type === 'Entrada' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.type === 'Entrada' ? '+' : '-'} R$ {t.value.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400" onClick={() => handleEditClick(t)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteTransaction(t.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">Nenhum lançamento manual registrado.</TableCell>
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
            <DialogTitle className="text-blue-900 dark:text-white">Editar Lançamento</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Descrição</label>
                <Input 
                  value={editingTransaction.description} 
                  onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Valor (R$)</label>
                  <Input 
                    type="number"
                    value={editingTransaction.value} 
                    onChange={(e) => setEditingTransaction({...editingTransaction, value: Number(e.target.value)})} 
                    className="dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Categoria</label>
                  <Select value={editingTransaction.category} onValueChange={v => setEditingTransaction({...editingTransaction, category: v})}>
                    <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fixo">Fixo</SelectItem>
                      <SelectItem value="Variável">Variável</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                      <SelectItem value="Venda">Venda</SelectItem>
                      <SelectItem value="Piedade">Piedade</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Data</label>
                <Input 
                  type="date"
                  value={editingTransaction.date} 
                  onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="dark:border-slate-800">Cancelar</Button>
            <Button className="bg-blue-600" onClick={handleSaveEdit}>Salvar Alterações</Button>
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