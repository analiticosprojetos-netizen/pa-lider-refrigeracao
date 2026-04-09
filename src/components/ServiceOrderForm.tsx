"use client";

import React from 'react';
import { Plus, Trash2, Save, User, Truck, AlertCircle, Search, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';

// Base de dados de equipamentos comuns no mercado brasileiro
const EQUIPMENT_DATABASE: Record<string, string[]> = {
  "Thermo King": [
    "SLXi 100", "SLXi 200", "SLXi 300", "SLXi 400", "SLXi Spectrum", 
    "SLX 100", "SLX 200", "SLX 300", "SL 200", "SL 400", 
    "T-600R", "T-800R", "T-1000R", "T-1200R",
    "MD 200", "MD 300", "MD 400", 
    "RD-II 30", "RD-II 50", "RD-II 100", "RD-II 110",
    "V-200", "V-300", "V-500", "B-100", "B-200",
    "SB 190", "SB 210", "SB 230", "SB 250", "SB 310", "SB Spectrum",
    "Advancer Spectrum", "Advancer A-400", "Advancer A-500", "Advancer A-600", "Advancer A-Vector"
  ],
  "Carrier": [
    "Xarios 150", "Xarios 200", "Xarios 300", "Xarios 350", "Xarios 400",
    "Supra 450", "Supra 550", "Supra 650", "Supra 750", "Supra 850", "Supra 950",
    "Vector 1350", "Vector 1550", "Vector 1800", "Vector 1950", "Vector HE 17", "Vector HE 19",
    "Neos 100", "Neos 200", "Neos 300",
    "Vector 1950 MT", "Supra 850 MT"
  ],
  "Thermo Star": [
    "TS 200", "TS 300", "TS 400", "TS 500",
    "TS 700", "TS 900",
    "TS Light 150", "TS Light 250"
  ],
  "Frigo King": [
    "FK 200", "FK 300", "FK 400", "FK 500",
    "FK Light 100", "FK Light 200",
    "FK Slim", "FK Plus", "FK Max"
  ],
  "Rodofrio": ["RF-10", "RF-20", "RF-30", "RF-40", "RF-50"],
  "Macc": ["M-10", "M-20", "M-30"],
  "Eurofrigo": ["EF-200", "EF-300", "EF-400"]
};

const SERVICE_TYPES = [
  "Preventiva",
  "Corretiva",
  "Reforma de Baú",
  "Troca de Óleo/Filtros",
  "Carga de Gás",
  "Reparo Elétrico",
  "Instalação de Equipamento",
  "Higienização",
  "Socorro Mecânico",
  "Vistoria Técnica"
];

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
    plate: '', vehicleModel: '', equipBrand: '', equipModel: '',
    serviceType: 'Corretiva', problem: '', diagnosis: '',
    travelValue: 0,
    warranty: '90 dias', technician: technicianName, observations: ''
  });

  const [services, setServices] = React.useState<Item[]>([]);
  const [parts, setParts] = React.useState<Item[]>([]);

  const formatPhone = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 3) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  const resetForm = () => {
    setFormData({
      clientName: '', document: '', phone: '', email: '',
      plate: '', vehicleModel: '', equipBrand: '', equipModel: '',
      serviceType: 'Corretiva', problem: '', diagnosis: '',
      travelValue: 0,
      warranty: '90 dias', technician: technicianName, observations: ''
    });
    setServices([]);
    setParts([]);
  };

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        clientName: initialData.clientName || '',
        document: initialData.document || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        plate: initialData.plate || '',
        vehicleModel: initialData.vehicleModel || '',
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
      resetForm();
    }
  }, [initialData, technicianName]);

  const handlePlateChange = (plate: string) => {
    const upperPlate = plate.toUpperCase();
    setFormData(prev => ({ ...prev, plate: upperPlate }));
    
    if (!initialData && upperPlate.length >= 7) {
      const pastOrder = previousOrders.find(o => o.plate.toUpperCase() === upperPlate);
      if (pastOrder) {
        setFormData(prev => ({
          ...prev,
          vehicleModel: pastOrder.vehicleModel,
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
      resetForm();
    }
  };

  // Sugestões de modelos baseadas na marca selecionada
  const modelSuggestions = formData.equipBrand ? (EQUIPMENT_DATABASE[formData.equipBrand] || []) : [];

  return (
    <div className="space-y-8">
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

      <form onSubmit={handleSubmit} className="space-y-8">
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
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} 
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
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
                <Input 
                  list="brands-list"
                  value={formData.equipBrand} 
                  onChange={e => setFormData({...formData, equipBrand: e.target.value, equipModel: ''})} 
                  placeholder="Ex: Thermo King" 
                />
                <datalist id="brands-list">
                  {Object.keys(EQUIPMENT_DATABASE).map(brand => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Modelo Equipamento</label>
                <Input 
                  list="models-list"
                  value={formData.equipModel} 
                  onChange={e => setFormData({...formData, equipModel: e.target.value})} 
                  placeholder="Selecione ou digite..."
                />
                <datalist id="models-list">
                  {modelSuggestions.map(model => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Serviço</label>
                <Input 
                  list="service-types"
                  value={formData.serviceType} 
                  onChange={e => setFormData({...formData, serviceType: e.target.value})} 
                  placeholder="Selecione ou digite o tipo..."
                />
                <datalist id="service-types">
                  {SERVICE_TYPES.map(type => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold opacity-50 uppercase h-4 flex items-center">Deslocamento</label>
                  <Input type="number" className="bg-blue-800 border-blue-700 text-white" value={formData.travelValue} onChange={e => setFormData({...formData, travelValue: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold opacity-50 uppercase h-4 flex items-center gap-1"><ShieldCheck size={10}/> Garantia</label>
                  <Input className="bg-blue-800 border-blue-700 text-white" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} placeholder="Ex: 90 dias" />
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
                  <Plus className="mr-2"/> {initialData ? 'SALVAR ALTERAÇÕES' : 'GERAR ORÇAMENTO'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default ServiceOrderForm;