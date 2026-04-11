"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { 
  CheckCircle2, Clock, Ban, Users, FileText, Download, Calendar, Filter, Tooltip as TooltipIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToExcel } from '@/utils/exportUtils';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, isSameDay, isSameWeek, isSameMonth, isSameYear, subDays, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnalyticsTabProps {
  orders: any[];
  transactions: any[];
  usersCount: number;
}

const AnalyticsTab = ({ orders, transactions, usersCount }: AnalyticsTabProps) => {
  const [timeframe, setTimeframe] = React.useState<'day' | 'week' | 'month' | 'year'>('day');

  // Filtra transações manuais que são da categoria Orçamento (Serviços Avulsos)
  const manualBudgets = transactions.filter(t => t.category === 'Orçamento');

  // Combina os dados para o relatório
  const combinedData = [
    ...orders.map(o => ({
      id: o.id,
      displayId: `#${o.id}`,
      clientName: o.clientName,
      date: o.date,
      executedAt: o.executedAt,
      cancelledAt: o.cancelledAt,
      technician: o.technician,
      status: o.status,
      total: o.total,
      isManual: false,
      servicesSummary: o.services?.map((s: any) => s.description).join(', ') || '-'
    })),
    ...manualBudgets.map(t => ({
      id: t.id,
      displayId: `#AV-${t.id}`,
      clientName: 'Serviço Avulso',
      date: t.date.split('-').reverse().join('/') + ', 00:00:00',
      executedAt: t.status === 'Concluído' ? t.date : null,
      cancelledAt: null,
      technician: 'Financeiro',
      status: t.status === 'Concluído' ? 'Executado' : 'Pendente',
      total: t.value,
      isManual: true,
      servicesSummary: t.description // Pega o título/descrição do lançamento manual
    }))
  ].sort((a, b) => {
    try {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } catch (e) {
      return 0;
    }
  });

  // Estatísticas consolidadas
  const stats = {
    executed: combinedData.filter(o => o.status === 'Executado' || o.status === 'Concluído').length,
    pending: combinedData.filter(o => o.status === 'Pendente').length,
    cancelled: combinedData.filter(o => o.status === 'Cancelado').length,
    users: usersCount
  };

  // Lógica para o gráfico (Consolidando OS e Manuais)
  const getChartData = () => {
    const now = new Date();
    const allExecuted = combinedData.filter(o => (o.status === 'Executado' || o.status === 'Concluído') && o.executedAt);

    if (timeframe === 'day') {
      return Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(now, 6 - i);
        const count = allExecuted.filter(o => {
          try {
            const execDate = parseISO(o.executedAt);
            return isSameDay(execDate, date);
          } catch (e) {
            return false;
          }
        }).length;
        return { name: format(date, 'dd/MM'), value: count };
      });
    }

    if (timeframe === 'week') {
      return Array.from({ length: 4 }).map((_, i) => {
        const date = subDays(now, (3 - i) * 7);
        const count = allExecuted.filter(o => {
          try {
            const execDate = parseISO(o.executedAt);
            return isSameWeek(execDate, date, { weekStartsOn: 0 });
          } catch (e) {
            return false;
          }
        }).length;
        return { name: `Sem ${4-i}`, value: count };
      });
    }

    if (timeframe === 'month') {
      return Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(now, 5 - i);
        const count = allExecuted.filter(o => {
          try {
            const execDate = parseISO(o.executedAt);
            return isSameMonth(execDate, date);
          } catch (e) {
            return false;
          }
        }).length;
        return { name: format(date, 'MMM', { locale: ptBR }), value: count };
      });
    }

    if (timeframe === 'year') {
      const currentYear = now.getFullYear();
      return [currentYear - 2, currentYear - 1, currentYear].map(year => {
        const count = allExecuted.filter(o => {
          try {
            const execDate = parseISO(o.executedAt);
            return execDate.getFullYear() === year;
          } catch (e) {
            return false;
          }
        }).length;
        return { name: year.toString(), value: count };
      });
    }

    return [];
  };

  const chartData = getChartData();

  const handleExportReport = () => {
    const reportData = combinedData.map(o => ({
      ID: o.displayId,
      Cliente: o.clientName,
      Serviços: o.servicesSummary,
      Status: o.status,
      'Data Entrada': o.date,
      'Data Conclusão/Cancelamento': o.executedAt || o.cancelledAt || '-',
      Técnico: o.technician,
      Total: `R$ ${o.total.toFixed(2)}`
    }));
    exportToExcel(reportData, 'relatorio_analitico_lider');
  };

  return (
    <div className="space-y-8">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Executados" 
          value={stats.executed} 
          icon={<CheckCircle2 className="text-green-500" />} 
          color="border-green-100 bg-green-50/30"
        />
        <SummaryCard 
          title="Pendentes" 
          value={stats.pending} 
          icon={<Clock className="text-yellow-500" />} 
          color="border-yellow-100 bg-yellow-50/30"
        />
        <SummaryCard 
          title="Cancelados" 
          value={stats.cancelled} 
          icon={<Ban className="text-red-500" />} 
          color="border-red-100 bg-red-50/30"
        />
        <SummaryCard 
          title="Usuários" 
          value={stats.users} 
          icon={<Users className="text-blue-500" />} 
          color="border-blue-100 bg-blue-50/30"
        />
      </div>

      {/* Gráfico de Produtividade */}
      <Card className="shadow-lg border-blue-100 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between border-b border-blue-50 dark:border-slate-800 pb-4">
          <div>
            <CardTitle className="text-lg text-blue-900 dark:text-white flex items-center gap-2">
              <Filter size={18} className="text-blue-600" /> Produtividade Consolidada (OS + Avulsos)
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">Acompanhamento de entregas por período</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['day', 'week', 'month', 'year'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${
                  timeframe === t 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t === 'day' ? 'Dia' : t === 'week' ? 'Semana' : t === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748b'}} axisLine={false} />
                <YAxis fontSize={12} tick={{fill: '#64748b'}} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  cursor={{ fill: '#f8fafc', opacity: 0.1 }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="value" position="top" style={{ fill: '#64748b', fontSize: '12px', fontWeight: 'bold' }} />
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#3b82f6' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Relatório Detalhado */}
      <Card className="shadow-lg border-blue-100 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-blue-900 dark:text-white flex items-center gap-2">
            <FileText size={18} className="text-blue-600" /> Relatório Analítico de Ordens e Serviços
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportReport} className="dark:border-slate-700">
            <Download size={14} className="mr-2" /> Exportar Relatório
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                  <TableHead className="font-bold">ID</TableHead>
                  <TableHead className="font-bold">Cliente</TableHead>
                  <TableHead className="font-bold">Serviços Realizados</TableHead>
                  <TableHead className="font-bold">Conclusão/Canc.</TableHead>
                  <TableHead className="font-bold">Técnico</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedData.map((o) => (
                  <TableRow key={o.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/20">
                    <TableCell className={`font-bold whitespace-nowrap ${o.isManual ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {o.displayId}
                    </TableCell>
                    <TableCell className="text-sm dark:text-gray-300 font-medium">{o.clientName}</TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400 max-w-[300px] truncate" title={o.servicesSummary}>
                      {o.servicesSummary}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                      {o.executedAt ? (o.isManual ? o.executedAt.split('-').reverse().join('/') : format(parseISO(o.executedAt), 'dd/MM/yy HH:mm')) : (o.cancelledAt ? format(parseISO(o.cancelledAt), 'dd/MM/yy HH:mm') : '-')}
                    </TableCell>
                    <TableCell className="text-sm font-medium dark:text-gray-300">{o.technician}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        o.status === 'Executado' || o.status === 'Concluído' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        o.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold dark:text-gray-300">R$ {o.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {combinedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">Nenhum dado disponível para o relatório.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
  <Card className={`border shadow-sm ${color}`}>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-blue-900 dark:text-white">{value}</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm">
        {icon}
      </div>
    </CardContent>
  </Card>
);

export default AnalyticsTab;