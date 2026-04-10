"use client";

import React from 'react';
import { Download, Mail, User, Truck, AlertCircle, Package, Calendar, ShieldCheck, Percent, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';

interface ServiceOrderDetailsProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (order: any) => void;
  onSendEmail: (order: any) => void;
  onSendWhatsApp: (order: any) => void;
}

const ServiceOrderDetails = ({ order, isOpen, onClose, onDownload, onSendEmail, onSendWhatsApp }: ServiceOrderDetailsProps) => {
  if (!order) return null;

  const subtotal = order.subtotal || order.total + (order.discountValue || 0);
  const servicesTotal = order.servicesValue || 0;
  const partsTotal = order.partsValue || 0;

  const formatDateTime = (isoString: string) => {
    if (!isoString) return 'Não informado';
    try {
      return format(parseISO(isoString), 'dd/MM/yyyy');
    } catch (e) {
      return isoString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader className="border-b pb-4 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <DialogTitle className="text-2xl font-bold text-blue-900 dark:text-white">
                Orçamento #{order.id}
              </DialogTitle>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={12} /> Gerado em: {order.date}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onDownload(order)} className="dark:border-slate-700">
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => onSendEmail(order)} className="dark:border-slate-700">
                <Mail className="mr-2 h-4 w-4" /> E-mail
              </Button>
              <Button size="sm" className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none" onClick={() => onSendWhatsApp(order)}>
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                <User size={16} /> Dados do Cliente
              </h3>
              <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-1">
                <p className="text-sm font-bold dark:text-white">{order.clientName}</p>
                <p className="text-xs text-gray-500">Doc: {order.document || 'N/A'}</p>
                <p className="text-xs text-gray-500">Tel: {order.phone || 'N/A'}</p>
                <p className="text-xs text-gray-500">Email: {order.email || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                <Truck size={16} /> Veículo e Equipamento
              </h3>
              <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-1">
                <p className="text-sm font-bold dark:text-white">{order.plate}</p>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-300">{order.vehicleModel}</p>
                <p className="text-xs text-gray-500 mt-2">Equip: {order.equipBrand} {order.equipModel}</p>
                <p className="text-xs text-gray-500">Serviço: {order.serviceType}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                <AlertCircle size={16} /> Diagnóstico Técnico
              </h3>
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-3 h-full">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Problema Relatado</p>
                  <p className="text-sm dark:text-gray-300">{order.problem || 'Nenhum relato.'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Diagnóstico</p>
                  <p className="text-sm dark:text-gray-300">{order.diagnosis || 'Nenhum diagnóstico.'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                <Clock size={16} /> Cronograma de Execução
              </h3>
              <div className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-4 h-full flex flex-col justify-center">
                <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Início:</span>
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-300">{formatDateTime(order.startTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">Fim:</span>
                  <span className="text-sm font-bold text-blue-900 dark:text-blue-300">{formatDateTime(order.endTime)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
              <Package size={16} /> Itens do Orçamento
            </h3>
            <div className="border dark:border-slate-800 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-slate-800">
                  <TableRow>
                    <TableHead className="dark:text-gray-300">Descrição</TableHead>
                    <TableHead className="dark:text-gray-300">Tipo</TableHead>
                    <TableHead className="text-center dark:text-gray-300">Qtd</TableHead>
                    <TableHead className="text-right dark:text-gray-300">Valor Unit.</TableHead>
                    <TableHead className="text-right dark:text-gray-300">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.services.map((s: any, i: number) => (
                    <TableRow key={`s-${i}`} className="dark:border-slate-800">
                      <TableCell className="font-medium dark:text-gray-300">{s.description}</TableCell>
                      <TableCell className="text-xs text-gray-400">Serviço</TableCell>
                      <TableCell className="text-center dark:text-gray-300">1</TableCell>
                      <TableCell className="text-right dark:text-gray-300">R$ {s.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold dark:text-gray-300">R$ {s.value.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {order.parts.map((p: any, i: number) => (
                    <TableRow key={`p-${i}`} className="dark:border-slate-800">
                      <TableCell className="font-medium dark:text-gray-300">{p.description}</TableCell>
                      <TableCell className="text-xs text-gray-400">Peça</TableCell>
                      <TableCell className="text-center dark:text-gray-300">{p.qty}</TableCell>
                      <TableCell className="text-right dark:text-gray-300">R$ {p.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold dark:text-gray-300">R$ {(p.qty * p.value).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ShieldCheck size={16} className="text-green-600" />
                <span className="font-bold">Garantia:</span> {order.warranty}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User size={16} className="text-blue-600" />
                <span className="font-bold">Técnico:</span> {order.technician}
              </div>
              {order.observations && (
                <div className="text-xs text-gray-500 italic">
                  <span className="font-bold block not-italic text-gray-700 dark:text-gray-300">Observações:</span>
                  {order.observations}
                </div>
              )}
            </div>
            <div className="bg-blue-900 text-white p-6 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm opacity-70">
                <span>Total Mão de Obra:</span>
                <span>R$ {servicesTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-70">
                <span>Total Peças:</span>
                <span>R$ {partsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-70 pt-2 border-t border-blue-800/50">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {order.discountValue > 0 && (
                <div className="flex justify-between text-sm text-red-300">
                  <span className="flex items-center gap-1"><Percent size={12}/> Desconto ({order.discountPercent.toFixed(1)}%):</span>
                  <span>- R$ {order.discountValue.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-black pt-2 border-t border-blue-800">
                <span>TOTAL:</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceOrderDetails;