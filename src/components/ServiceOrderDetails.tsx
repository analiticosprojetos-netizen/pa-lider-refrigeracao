"use client";

import React from 'react';
import { Download, Mail, User, Truck, AlertCircle, Package, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ServiceOrderDetailsProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (order: any) => void;
  onSendEmail: (order: any) => void;
}

const ServiceOrderDetails = ({ order, isOpen, onClose, onDownload, onSendEmail }: ServiceOrderDetailsProps) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl font-bold text-blue-900">
                Orçamento #{order.id}
              </DialogTitle>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Calendar size={12} /> Gerado em: {order.date}
              </p>
            </div>
            <div className="flex gap-2 mr-8">
              <Button size="sm" variant="outline" onClick={() => onDownload(order)}>
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => onSendEmail(order)}>
                <Mail className="mr-2 h-4 w-4" /> Email
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2 uppercase tracking-wider">
                <User size={16} /> Dados do Cliente
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1">
                <p className="text-sm font-bold">{order.clientName}</p>
                <p className="text-xs text-gray-500">Doc: {order.document || 'N/A'}</p>
                <p className="text-xs text-gray-500">Tel: {order.phone || 'N/A'}</p>
                <p className="text-xs text-gray-500">Email: {order.email || 'N/A'}</p>
              </div>
            </div>

            {/* Veículo */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2 uppercase tracking-wider">
                <Truck size={16} /> Veículo e Equipamento
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1">
                <p className="text-sm font-bold">{order.plate} - {order.vehicleModel}</p>
                <p className="text-xs text-gray-500">Baú: {order.boxType || 'N/A'}</p>
                <p className="text-xs text-gray-500">Equip: {order.equipBrand} {order.equipModel}</p>
                <p className="text-xs text-gray-500">Serviço: {order.serviceType}</p>
              </div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2 uppercase tracking-wider">
              <AlertCircle size={16} /> Diagnóstico Técnico
            </h3>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase">Problema Relatado</p>
                <p className="text-sm">{order.problem || 'Nenhum relato.'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase">Diagnóstico</p>
                <p className="text-sm">{order.diagnosis || 'Nenhum diagnóstico.'}</p>
              </div>
            </div>
          </div>

          {/* Itens */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-blue-600 flex items-center gap-2 uppercase tracking-wider">
              <Package size={16} /> Itens do Orçamento
            </h3>
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.services.map((s: any, i: number) => (
                    <TableRow key={`s-${i}`}>
                      <TableCell className="font-medium">{s.description}</TableCell>
                      <TableCell className="text-xs text-gray-400">Serviço</TableCell>
                      <TableCell className="text-center">1</TableCell>
                      <TableCell className="text-right">R$ {s.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold">R$ {s.value.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {order.parts.map((p: any, i: number) => (
                    <TableRow key={`p-${i}`}>
                      <TableCell className="font-medium">{p.description}</TableCell>
                      <TableCell className="text-xs text-gray-400">Peça</TableCell>
                      <TableCell className="text-center">{p.qty}</TableCell>
                      <TableCell className="text-right">R$ {p.value.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold">R$ {(p.qty * p.value).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Resumo e Rodapé */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck size={16} className="text-green-600" />
                <span className="font-bold">Garantia:</span> {order.warranty}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} className="text-blue-600" />
                <span className="font-bold">Técnico:</span> {order.technician}
              </div>
              {order.observations && (
                <div className="text-xs text-gray-500 italic">
                  <span className="font-bold block not-italic text-gray-700">Observações:</span>
                  {order.observations}
                </div>
              )}
            </div>
            <div className="bg-blue-900 text-white p-6 rounded-2xl space-y-2">
              <div className="flex justify-between text-sm opacity-70">
                <span>Mão de Obra:</span>
                <span>R$ {order.laborValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-70">
                <span>Deslocamento:</span>
                <span>R$ {order.travelValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm opacity-70">
                <span>Total Peças:</span>
                <span>R$ {order.partsValue.toFixed(2)}</span>
              </div>
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