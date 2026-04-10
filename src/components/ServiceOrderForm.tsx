"use client";

import React from 'react';
import { Plus, Trash2, User, Truck, AlertCircle, Clock, Percent, ShieldCheck, X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from '@/utils/toast';
import { differenceInDays, parseISO, format } from 'date-fns';

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
  maxDiscountWarning?: number;
  maxDiscountDanger?: number;
}

const ServiceOrderForm = ({ 
  onSave, 
  technicianName, 
  inventoryParts, 
  customers, 
  previousOrders,
  initialData,
  onCancelEdit,
  maxDiscountWarning = 10,
  maxDiscountDanger = 15
}: ServiceOrderFormProps) => {
  const [formData, setFormData] = React.useState({
    clientName: '', document: '', phone: '', email: '',
    plate: '', vehicleModel: '', equipBrand: '', equipModel: '',
    serviceType: 'Corretiva', problem: '', diagnosis: '',
    startTime: '', endTime: '',
    travelValue: 0,
    discountPercent: 0,
    discountValue: 0,
    warranty: '90 dias', technician: technicianName, observations: ''
  });

  const [services, setServices] = React.useState<Item[]>([]);
  const [parts, setParts] = React.useState<Item[]>([]);

  const formatToStandardCase = (str: string) => {
    if (!str) return str;
    return str.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  };

  const clientPlates = React.useMemo(() => {
    if (!formData.clientName) return [];
    const plates = previousOrders
      .filter(o => o.clientName.toLowerCase() === formData.clientName.toLowerCase())
      .map(o => o.plate.toUpperCase());
    return Array.from(new Set(plates));
  }, [formData.clientName, previousOrders]);

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
      startTime: '', endTime: '',
      travelValue: 0,
      discountPercent: 0,
      discountValue: 0,
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
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        travelValue: initialData.travelValue || 0,
        discountPercent: initialData.discountPercent || 0,
        discountValue: initialData.discountValue || 0,
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
    
    if (!initialData) {
      const pastOrder = previousOrders.find(o => 
        o.plate.toUpperCase() === upperPlate && 
        (formData.clientName ? o.clientName.toLowerCase() === formData.clientName.toLowerCase() : true)
      );

      if (pastOrder) {
        setFormData(prev => ({
          ...prev,
          vehicleModel: pastOrder.vehicleModel,
          equipBrand: pastOrder.equipBrand,
          equipModel: pastOrder.equipModel,
          clientName: prev.clientName || pastOrder.clientName,
          document: prev.document || pastOrder.document,
          phone: prev.phone || pastOrder.phone,
          email: prev.email || pastOrder.email
        }));
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
  const subtotal = partsTotal + servicesTotal + Number(formData.travelValue);
  
  const handleDiscountPercentChange = (percent: number) => {
    const value = (subtotal * percent) / 100;
    setFormData({ ...formData, discountPercent: percent, discountValue: value });
  };

  const handleDiscountValueChange = (value: number) => {
    const percent = subtotal > 0 ? (value / subtotal) * 100 : 0;
    setFormData({ ...formData, discountValue: value, discountPercent: percent });
  };

  const total = subtotal - formData.discountValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let newId = initialData?.id;
    if (!newId) {
      const now = new Date();
      const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const todayOrders = previousOrders.filter(o => o.id.startsWith(datePrefix));
      let nextNum = 1;
      if (todayOrders.length > 0) {
        const nums = todayOrders.map(o => {
          const parts = o.id.split(' - ');
          return parts.length > 1 ? parseInt(parts[1]) : 0;
        }).filter(n => !isNaN(n));
        nextNum = Math.max(0, ...nums) + 1;
      }
      newId = `${datePrefix} - ${nextNum}`;
    }

    const order = {
      ...formData,
      id: newId,
      date: initialData ? initialData.date : new Date().toLocaleString(),
      status: initialData ? initialData.status : 'Pendente',
      services: services.map(s => ({ ...s, description: formatToStandardCase(s.description) })),
      parts: parts.map(p => ({ ...p, description: formatToStandardCase(p.description) })),
      partsValue: partsTotal,
      servicesValue: servicesTotal,
      subtotal,
      total
    };

    const customerData: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: formatToStandardCase(formData.clientName),
      document: formData.document,
      phone: formData.phone,
      email: formData.email
    };

    onSave(order, customerData);
    showSuccess(initialData ? 'Orçamento atualizado!' : 'Orçamento gerado com sucesso!');
    if (!initialData) resetForm();
  };

  const modelSuggestions = formData.equipBrand ? (EQUIPMENT_DATABASE[formData.equipBrand] || []) : [];

  // Cálculo da duração para o gráfico Gantt
  const durationDays = (formData.startTime && formData.endTime) 
    ? differenceInDays(parseISO(formData.endTime), parseISO(formData.startTime)) + 1
    : 0;

  // Filtra os primeiros 4 serviços para a linha do tempo
  const timelineServices = services.filter(s => s.description).slice(0, 4);

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
                <Input 
                  list="customers-list"
                  value={formData.clientName} 
                  onChange={e => handleCustomerSearch(e.target.value)} 
                  onBlur={e => setFormData({...formData, clientName: formatToStandardCase(e.target.value)})}
                  required 
                  placeholder="Digite o nome..." 
                />
                <datalist id="customers-list">
                  {customers.map(c => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
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
                <Input 
                  list="client-plates-list"
                  value={formData.plate} 
                  onChange={e => handlePlateChange(e.target.value)} 
                  placeholder="ABC1234" 
                />
                <datalist id="client-plates-list">
                  {clientPlates.map(plate => (
                    <option key={plate} value={plate} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Modelo Veículo</label>
                <Input 
                  value={formData.vehicleModel} 
                  onChange={e => setFormData({...formData, vehicleModel: e.target.value})} 
                  onBlur={e => setFormData({...formData, vehicleModel: formatToStandardCase(e.target.value)})}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Marca Equipamento</label>
                <Input 
                  list="brands-list"
                  value={formData.equipBrand} 
                  onChange={e => setFormData({...formData, equipBrand: e.target.value, equipModel: ''})} 
                  onBlur={e => setFormData({...formData, equipBrand: formatToStandardCase(e.target.value)})}
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
                  onBlur={e => setFormData({...formData, equipModel: formatToStandardCase(e.target.value)})}
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
                  onBlur={e => setFormData({...formData, serviceType: formatToStandardCase(e.target.value)})}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/50 border-b border-blue-50">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900"><Clock size={16}/> CRONOGRAMA DE EXECUÇÃO</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Início do Serviço</label>
                  <Input 
                    type="date" 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Fim do Serviço</label>
                  <Input 
                    type="date" 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})} 
                  />
                </div>
              </div>

              {/* Visualização Estilo Gantt com Serviços */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Linha do Tempo do Projeto</span>
                  {durationDays > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {durationDays} {durationDays === 1 ? 'dia' : 'dias'} de duração
                    </span>
                  )}
                </div>
                
                <div className="relative min-h-[80px] bg-gray-50 rounded-xl border border-dashed border-gray-200 flex flex-col justify-center px-4 py-4 overflow-hidden">
                  {formData.startTime && formData.endTime ? (
                    durationDays > 0 ? (
                      <div className="w-full flex flex-col gap-3">
                        {/* Datas no topo */}
                        <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase">
                          <span>{format(parseISO(formData.startTime), 'dd/MM')}</span>
                          <span>{format(parseISO(formData.endTime), 'dd/MM')}</span>
                        </div>
                        
                        {/* Barra com Marcadores */}
                        <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)] animate-in slide-in-from-left duration-500"
                            style={{ width: '100%' }}
                          />
                          {/* Marcadores de Divisão */}
                          {timelineServices.length > 1 && timelineServices.map((_, idx) => (
                            idx > 0 && (
                              <div 
                                key={`marker-${idx}`}
                                className="absolute top-0 bottom-0 w-0.5 bg-white/30"
                                style={{ left: `${(idx / timelineServices.length) * 100}%` }}
                              />
                            )
                          ))}
                        </div>

                        {/* Nomes dos Serviços abaixo da barra */}
                        <div className="flex w-full">
                          {timelineServices.length > 0 ? (
                            timelineServices.map((s, idx) => (
                              <div 
                                key={`label-${idx}`}
                                className="text-[8px] font-bold text-blue-900/70 uppercase truncate px-1 text-center"
                                style={{ width: `${100 / timelineServices.length}%` }}
                              >
                                {s.description}
                              </div>
                            ))
                          ) : (
                            <div className="w-full text-center text-[8px] text-gray-400 italic">
                              Adicione serviços para visualizar no cronograma
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full text-center flex items-center justify-center gap-2 text-red-400 text-[10px] font-bold">
                        <AlertCircle size={14} /> Data de fim deve ser após o início
                      </div>
                    )
                  ) : (
                    <div className="w-full text-center text-gray-300 text-[10px] font-medium italic">
                      Selecione as datas para visualizar o cronograma gráfico
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <Input 
                      value={s.description} 
                      onChange={e => updateItem(s.id, 'service', 'description', e.target.value)} 
                      onBlur={e => updateItem(s.id, 'service', 'description', formatToStandardCase(e.target.value))}
                      placeholder="Descrição" 
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Valor</label>
                    <Input type="number" value={s.value === 0 ? '' : s.value} onChange={e => updateItem(s.id, 'service', 'value', Number(e.target.value))} />
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
                      <Input 
                        value={p.description} 
                        onChange={e => updateItem(p.id, 'part', 'description', e.target.value)} 
                        onBlur={e => updateItem(p.id, 'part', 'description', formatToStandardCase(e.target.value))}
                        placeholder="Descrição" 
                      />
                    </div>
                    <div className="w-16 space-y-1">
                      <label className="text-[8px] font-bold text-gray-400 uppercase">Qtd</label>
                      <Input type="number" value={p.qty === 0 ? '' : p.qty} onChange={e => updateItem(p.id, 'part', 'qty', Number(e.target.value))} />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-[8px] font-bold text-gray-400 uppercase">Unit.</label>
                      <Input type="number" value={p.value === 0 ? '' : p.value} onChange={e => updateItem(p.id, 'part', 'value', Number(e.target.value))} />
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
                  <Input type="number" className="bg-blue-800 border-blue-700 text-white" value={formData.travelValue === 0 ? '' : formData.travelValue} onChange={e => setFormData({...formData, travelValue: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold opacity-50 uppercase h-4 flex items-center gap-1"><ShieldCheck size={10}/> Garantia</label>
                  <Input className="bg-blue-800 border-blue-700 text-white" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} placeholder="Ex: 90 dias" />
                </div>
              </div>

              <div className="pt-4 border-t border-blue-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold opacity-50 uppercase flex items-center gap-1"><Percent size={10}/> Desconto (%)</label>
                    <Input 
                      type="number" 
                      className="bg-blue-800 border-blue-700 text-white" 
                      value={formData.discountPercent === 0 ? '' : formData.discountPercent} 
                      onChange={e => handleDiscountPercentChange(Number(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold opacity-50 uppercase flex items-center gap-1">Desconto (R$)</label>
                    <Input 
                      type="number" 
                      className="bg-blue-800 border-blue-700 text-white" 
                      value={formData.discountValue === 0 ? '' : formData.discountValue} 
                      onChange={e => handleDiscountValueChange(Number(e.target.value))} 
                    />
                  </div>
                </div>

                {formData.discountPercent > 0 && (
                  <div className={`p-3 rounded-lg text-[10px] font-bold flex items-center gap-2 ${
                    formData.discountPercent >= maxDiscountDanger ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 
                    formData.discountPercent >= maxDiscountWarning ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 
                    'bg-green-500/20 text-green-300 border border-green-500/30'
                  }`}>
                    <AlertCircle size={14} />
                    {formData.discountPercent >= maxDiscountDanger ? `ALERTA CRÍTICO: Desconto de ${formData.discountPercent.toFixed(1)}% atinge o limite máximo configurado!` : 
                     formData.discountPercent >= maxDiscountWarning ? `ATENÇÃO: Desconto de ${formData.discountPercent.toFixed(1)}% acima do limite de segurança.` : 
                     'Desconto dentro da margem aceitável.'}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-blue-800 space-y-2">
                <div className="flex justify-between text-sm opacity-70"><span>Subtotal:</span><span>R$ {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-red-400"><span>Desconto:</span><span>- R$ {formData.discountValue.toFixed(2)}</span></div>
                <div className="flex justify-between text-2xl font-black pt-2 border-t border-blue-800"><span>TOTAL:</span><span>R$ {total.toFixed(2)}</span></div>
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