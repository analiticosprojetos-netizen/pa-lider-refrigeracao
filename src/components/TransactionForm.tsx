"use client";

import React from 'react';
import { Receipt, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionFormProps {
  onlyEntrada?: boolean;
  formType: 'Entrada' | 'Saída';
  setFormType: (type: 'Entrada' | 'Saída') => void;
  newTransaction: {
    description: string;
    value: string;
    category: string;
    date: string;
  };
  setNewTransaction: (val: any) => void;
  onSubmit: (e: React.FormEvent, forcedType?: 'Entrada' | 'Saída') => void;
}

const TransactionForm = ({ 
  onlyEntrada = false, 
  formType, 
  setFormType, 
  newTransaction, 
  setNewTransaction, 
  onSubmit 
}: TransactionFormProps) => {
  return (
    <Card className="h-fit shadow-lg border-blue-100 dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
        <div className="flex flex-col gap-4">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white">
            <Receipt className="text-blue-600" /> Novo Lançamento
          </CardTitle>
          
          {!onlyEntrada ? (
            <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
              <button 
                type="button"
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
                type="button"
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
          ) : (
            <div className="flex p-1 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
              <div className="flex-1 py-2 text-xs font-black uppercase rounded-lg flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <ArrowUpRight size={14} /> Somente Entrada (Orçamentos)
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={(e) => onSubmit(e, onlyEntrada ? 'Entrada' : undefined)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">Descrição</label>
            <Input 
              placeholder={onlyEntrada || formType === 'Entrada' ? "Ex: Venda de Peça Avulsa, Aporte..." : "Ex: Aluguel, Luz, Peças..."}
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
                  <SelectItem value="Orçamento">Orçamento</SelectItem>
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
              onlyEntrada || formType === 'Entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Plus className="mr-2 h-4 w-4" /> Lançar {onlyEntrada ? 'Entrada' : formType}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;