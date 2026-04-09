"use client";

import React from 'react';
import { Plus, Trash2, Save, User, Truck, AlertCircle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';

interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
}

interface InventoryPart {
  id: string;
  name: string;
  quantity: number;
}

interface Item {
  id: string;
  description: string;
  qty: number;
  value: number;
  inventoryPartId?: string;
}

interface ServiceOrderFormProps {
  onSave: (order: any, customerData?: Customer) => void;
  technicianName: string;
  inventoryParts: InventoryPart[];
  customers: Customer[];
  previousOrders: any[];
  initialData?: any;
  onCancelEdit?: () => void;
}

const ServiceOrderForm = ({ 
  onSave, 
  technicianName, 
  inventoryParts, 
  customers, 
  previousOrders,
  initialData,
  onCancelEdit
}: ServiceOrderFormProps) => {
  const [formData, setFormData] = React.useState({
    clientName: '', document: '', phone: '', email: '',
    plate: '', vehicleModel: '', boxType: '', equipBrand: '', equipModel: '',
    serviceType: 'Corretiva', problem: '', diagnosis: '',
    travelValue: 0,
    warranty: '90 dias', technician: technicianName, observations: ''
  });

  const [services, setServices] = React.useState<Item[]>([]);
  const [parts, setParts] = React.useState<Item[]>([]);

  // Carrega dados iniciais se estiver em modo de edição
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName || '',
        document: initialData.document || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        plate: initialData.plate || '',
        vehicleModel: initialData.vehicleModel || '',
        boxType: initialData.boxType || '',
        equipBrand: initialData.equipBrand || '',
        equipModel: initialData.equipModel || '',
        serviceType: initialData.serviceType || 'Corretiva',
        problem: initialData.problem || '',
        diagnosis: initialData.diagnosis || '',
        travelValue: initialData.travelValue || 0,
        warranty: initialData.warranty || '90 dias',
        technician: initialData.technician || technicianName,
        observations: initialData.observations || ''
      });
      setServices(initialData.services || []);
      setParts(initialData.parts || []);
    } else {
      setFormData(prev => ({ ...prev, technician: technicianName }));
    }
  }, [initialData, technicianName]);

  const handlePlateChange = (plate: string) => {
    const upperPlate = plate.toUpperCase();
    setFormData(prev => ({ ...prev, plate: upperPlate }));
    
    // Só busca histórico se não estiver editando um orçamento já existente
    if (!initialData && upperPlate.length >= 7) {
      const pastOrder = previousOrders.find(o => o.plate.toUpperCase() === upperPlate);
      if (pastOrder) {
        setFormData(prev => ({
          ...prev,
          vehicleModel: pastOrder.vehicleModel,
          boxType: pastOrder.boxType,
          equipBrand: pastOrder.equipBrand,
          equipModel: pastOrder.equipModel,
          clientName: pastOrder.clientName,
          document: pastOrder.document,
          phone: pastOrder.phone,
          email: pastOrder.email
        }));
        showSuccess('Dados do veículo e cliente recuperados do histórico!');
      }
    }
  };

  const handleCustomerSearch = (val: string) => {
    setFormData(prev => ({ ...prev, clientName: val }));
    if (!initialData) {
      const customer = customers.find(c => 
        c.name.toLowerCase().includes(val.toLowerCase()) || 
        c.document.includes(val)
      );
      if (customer && val.length > 3) {
        setFormData(prev => ({
          ...prev,
          clientName: customer.name,
          document: customer.document,
          phone: customer.phone,
          email: customer.email
        }));
      }
    }
  };

  const addItem = (type: 'service' | 'part') => {
    const newItem = { id: Math.random().toString(36).substr(2, 9), description: '', qty: 1, value: 0 };
    if (type === 'service') setServices([...services, newItem]);
    else setParts([...parts, newItem]);
  };

  const handleSelectInventoryPart = (itemId: string, partId: string) => {
    const selectedPart = inventoryParts.find(p => p.id === partId);
    if (selectedPart) {
      setParts(parts.map(p => p.id === itemId ? { 
        ...p, 
        description: selectedPart.name, 
        inventoryPartId: selectedPart.id 
      } : p));
    }
  };

  const removeItem = (id: string, type: 'service' | 'part') => {
    if (type === 'service') setServices(services.filter(i => i.id !== id));
    else setParts(parts.filter(i => i.id !== id));
  };

  const updateItem = (id: string, type: 'service' | 'part', field: string, value: any) => {
    const setter = type === 'service' ? setServices : setParts;
    const list = type === 'service' ? services : parts;
    setter(list.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const partsTotal = parts.reduce((acc, p) => acc + (p.qty * p.value), 0);
  const servicesTotal = services.reduce((acc, s) => acc + s.value, 0);
  const total = partsTotal + servicesTotal + Number(formData.travelValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const order = {
      ...formData,
      id: initialData ? initialData.id : Math.random().toString(36).substr(2, 5).toUpperCase(),
      date: initialData ? initialData.date : new Date().toLocaleString(),
      status: initialData ? initialData.status : 'Pendente',
      services,
      parts,
      partsValue: partsTotal,
      servicesValue: servicesTotal,
      total
    };

    const customerData: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.clientName,
      document: formData.document,
      phone: formData.phone,
      email: formData.email
    };

    onSave(order, customerData);
    showSuccess(initialData ? 'Orçamento atualizado!' : 'Orçamento gerado com sucesso!');
    
    if (!initialData) {
      setServices([]);
      setParts([]);
      setFormData({
        clientName: '', document: '', phone: '', email: '',
        plate: '', vehicleModel: '', boxType: '', equipBrand: '', equipModel: '',
        serviceType: 'Corretiva', problem: '', diagnosis: '',
        travelValue: 0,
        warranty: '90 dias', technician: technicianName, observations: ''
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {initialData && (
        <div className="bg-blue-600 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle />
            <div>
              <p className="font-bold">Editando Orçamento #{initialData.id}</p>
              <p className="text-xs opacity-80">As alterações serão salvas sobre o registro original.</p>
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={onCancelEdit} className="text-white hover:bg-blue-700">
            <X className="mr-2 h-4 w-4" /> Cancelar Edição
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="bg-blue-50/50 border-b border-blue-50">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900"><User size={16}/> DADOS DO CLIENTE</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Nome / Empresa</label>
              <Input value={formData.clientName} onChange={e => handleCustomerSearch(e.target.value)} required placeholder="Digite o nome..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">CPF / CNPJ</label>
              <Input value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Telefone</label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</label>
              <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="bg-blue-50/50 border-b border-blue-50">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900"><Truck size={16}/> VEÍCULO E EQUIPAMENTO</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Placa</label>
              <Input value={formData.plate} onChange={e => handlePlateChange(e.target.value)} placeholder="ABC1234" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Modelo Veículo</label>
              <Input value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Marca Equipamento</label>
              <Input value={formData.equipBrand} onChange={e => setFormData({...formData, equipBrand: e.target.value})} placeholder="Ex: Thermo King" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Modelo Equipamento</label>
              <Input value={formData.equipModel} onChange={e => setFormData({...formData, equipModel: e.target.value})} />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Serviço</label>
              <Select value={formData.serviceType} onValueChange={v => setFormData({...formData, serviceType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventiva">Preventiva</SelectItem>
                  <SelectItem value="Corretiva">Corretiva</SelectItem>
                  <SelectItem value="Emergencial">Emergencial</SelectItem>
                  <SelectItem value="Instalação">Instalação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="bg-blue-50/50 border-b border-blue-50">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900"><AlertCircle size={16}/> DIAGNÓSTICO TÉCNICO</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Problema Relatado</label>
            <Textarea value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Diagnóstico Técnico</label>
            <Textarea value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-blue-50/50 border-b border-blue-50">
            <CardTitle className="text-sm font-bold text-blue-900">SERVIÇOS E PEÇAS</CardTitle>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => addItem('service')}>+ Serviço</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => addItem('part')}>+ Peça</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {services.map(s => (
              <div key={s.id} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Serviço</label>
                  <Input value={s.description} onChange={e => updateItem(s.id, 'service', 'description', e.target.value)} placeholder="Descrição" />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Valor</label>
                  <Input type="number" value={s.value} onChange={e => updateItem(s.id, 'service', 'value', Number(e.target.value))} />
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(s.id, 'service')}><Trash2 size={16}/></Button>
              </div>
            ))}
            {parts.map(p => (
              <div key={p.id} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Vincular ao Estoque (Opcional)</label>
                    <Select onValueChange={(v) => handleSelectInventoryPart(p.id, v)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Selecione uma peça do estoque..." />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryParts.map(ip => (
                          <SelectItem key={ip.id} value={ip.id}>
                            {ip.name} (Disp: {ip.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(p.id, 'part')}><Trash2 size={16}/></Button>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Descrição da Peça</label>
                    <Input value={p.description} onChange={e => updateItem(p.id, 'part', 'description', e.target.value)} placeholder="Descrição" />
                  </div>
                  <div className="w-16 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Qtd</label>
                    <Input type="number" value={p.qty} onChange={e => updateItem(p.id, 'part', 'qty', Number(e.target.value))} />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Unit.</label>
                    <Input type="number" value={p.value} onChange={e => updateItem(p.id, 'part', 'value', Number(e.target.value))} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm bg-blue-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-70">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold opacity-50 uppercase">Deslocamento</label>
                <Input type="number" className="bg-blue-800 border-blue-700 text-white" value={formData.travelValue} onChange={e => setFormData({...formData, travelValue: Number(e.target.value)})} />
              </div>
            </div>
            <div className="pt-4 border-t border-blue-800 space-y-2">
              <div className="flex justify-between text-sm opacity-70"><span>Total Peças:</span><span>R$ {partsTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm opacity-70"><span>Total Serviços:</span><span>R$ {servicesTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-2xl font-black pt-2"><span>TOTAL:</span><span>R$ {total.toFixed(2)}</span></div>
            </div>
            <div className="pt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold opacity-50 uppercase">Técnico Responsável</label>
                <Input 
                  className="bg-blue-800 border-blue-700 text-white" 
                  value={formData.technician} 
                  onChange={e => setFormData({...formData, technician: e.target.value})} 
                />
              </div>
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 py-6 text-lg font-bold">
                <Save className="mr-2"/> {initialData ? 'SALVAR ALTERAÇÕES' : 'GERAR ORÇAMENTO'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default ServiceOrderForm;