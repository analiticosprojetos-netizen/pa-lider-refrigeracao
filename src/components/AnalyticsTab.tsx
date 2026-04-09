"use client";

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  CheckCircle2, Clock, Ban, Users, FileText, Download, Calendar, Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToExcel } from '@/utils/exportUtils';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, isSameDay, isSameWeek, isSameMonth, isSameYear, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnalyticsTabProps {
  orders: any[];
  usersCount: number;
}

const AnalyticsTab = ({ orders, usersCount }: AnalyticsTabProps) => {
  const [timeframe, setTimeframe] = React.useState<'day' | 'week' | 'month' | 'year'>('day');

  // Estatísticas básicas
  const stats = {
    executed: orders.filter(o => o.status === 'Executado').length,
    pending: orders.filter(o => o.status === 'Pendente').length,
    cancelled: orders.filter(o => o.status === 'Cancelado').length,
    users: usersCount
  };

  // Lógica para o gráfico
  const getChartData = () => {
    const now = new Date();
    const executedOrders = orders.filter(o => o.status === 'Executado' && o.executedAt);

    if (timeframe === 'day') {
      // Últimos 7 dias
      return Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(now, 6 - i);
        const count = executedOrders.filter(o => isSameDay(new Date(o.executedAt), date)).length;
        return { name: format(date, 'dd/MM'), value: count };
      });
    }

    if (timeframe === 'week') {
      // Últimas 4 semanas
      return Array.from({ length: 4 }).map((_, i) => {
        const date = subDays(now, (3 - i) * 7);
        const count = executedOrders.filter(o => isSameWeek(new Date(o.executedAt), date, { weekStartsOn: 0 })).length;
        return { name: `Sem ${4-i}`, value: count };
      });
    }

    if (timeframe === 'month') {
      // Últimos 6 meses
      return Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(now, 5 - i);
        const count = executedOrders.filter(o => isSameMonth(new Date(o.executedAt), date)).length;
        return { name: format(date, 'MMM', { locale: ptBR }), value: count };
      });
    }

    if (timeframe === 'year') {
      // Últimos 3 anos
      const currentYear = now.getFullYear();
      return [currentYear - 2, currentYear - 1, currentYear].map(year => {
        const count = executedOrders.filter(o => new Date(o.executedAt).getFullYear() === year).length;
        return { name: year.toString(), value: count };
      });
    }

    return [];
  };

  const chartData = getChartData();

  const handleExportReport = () => {
    const reportData = orders.map(o => ({
      ID: o.id,
      Cliente: o.clientName,
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
              <Filter size={18} className="text-blue-600" /> Produtividade (Ordens Executadas)
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
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" fontSize={12} tick={{fill: '#64748b'}} axisLine={false} />
                <YAxis fontSize={12} tick={{fill: '#64748b'}} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  cursor={{ fill: '#f8fafc', opacity: 0.1 }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]}>
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
            <FileText size={18} className="text-blue-600" /> Relatório Analítico de Ordens
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
                  <TableHead className="font-bold">Entrada</TableHead>
                  <TableHead className="font-bold">Conclusão/Canc.</TableHead>
                  <TableHead className="font-bold">Técnico</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/20">
                    <TableCell className="font-bold text-blue-600 dark:text-blue-400">#{o.id}</TableCell>
                    <TableCell className="text-sm dark:text-gray-300">{o.clientName}</TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400">{o.date}</TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                      {o.executedAt || o.cancelledAt || '-'}
                    </TableCell>
                    <TableCell className="text-sm font-medium dark:text-gray-300">{o.technician}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        o.status === 'Executado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        o.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold dark:text-gray-300">R$ {o.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
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