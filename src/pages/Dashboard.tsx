"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Minus, LogOut, PlusCircle, Search, Snowflake, Trash2, 
  BarChart3, AlertTriangle, Settings, Save, Globe, Image as ImageIcon,
  History, User, ArrowUpCircle, ArrowDownCircle, X, Clock, FileText, Mail, Download, Table as TableIcon, Play, Ban, Users, Eye, Edit2, ShieldCheck, ShieldAlert, Upload, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import ServiceOrderForm from '@/components/ServiceOrderForm';
import ServiceOrderDetails from '@/components/ServiceOrderDetails';
import UserAdminSettings, { UserProfile } from '@/components/UserAdminSettings';
import { generateServiceOrderPDF, exportToExcel } from '@/utils/exportUtils';

interface Part {
  id: string;
  name: string;
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
}

interface Movement {
  id: string;
  partName: string;
  type: 'entrada' | 'saida';
  quantity: number;
  user: string;
  date: string;
}

interface Banner {
  id: string;
  url: string;
  zoom: number;
  rotate: number;
}

const FULL_PERMISSIONS = {
  estoque: { view: true, edit: true, delete: true },
  orcamentos: { view: true, edit: true, delete: true },
  clientes: { view: true, edit: true, delete: true },
  historico: { view: true, edit: true, delete: true },
  config: { view: true, edit: true, delete: true },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [parts, setParts] = React.useState<Part[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [movements, setMovements] = React.useState<Movement[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [orderSearchTerm, setOrderSearchTerm] = React.useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = React.useState('');
  
  const [newName, setNewName] = React.useState('');
  const [newQty, setNewQty] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = React.useState(false);
  const [orderToEdit, setOrderToEdit] = React.useState<any>(null);
  const [activeOrcamentoTab, setActiveOrcamentoTab] = React.useState('lista');
  
  const [siteSettings, setSiteSettings] = React.useState({
    companyName: 'LIDER REFRIGERAÇÃO',
    logo: '',
    whatsapp: '11999999999',
    instagram: 'https://instagram.com/liderefrigeracao',
    facebook: 'https://facebook.com/liderefrigeracao',
    email: 'contato@liderefrigeracao.com.br',
    address: 'Av. Industrial, 1000 - Setor de Transportes',
    cnpj: '00.000.000/0001-00',
    banners: [] as Banner[],
    carouselDelay: 6,
    aboutYears: '15+',
    aboutTitle: 'Excelência em Refrigeração de Transportes',
    aboutDescription: 'A Lider Refrigeração nasceu com o compromisso de oferecer soluções técnicas de alta precisão para o transporte de cargas refrigeradas. Entendemos que cada minuto parado representa um prejuízo, por isso focamos em agilidade e qualidade extrema.',
    aboutImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80'
  });

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    let users = [];
    const savedUsers = localStorage.getItem('lider_users');
    
    if (savedUsers) {
      users = JSON.parse(savedUsers);
    } else {
      const defaultAdmin: UserProfile = {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
        permissions: FULL_PERMISSIONS
      };
      users = [defaultAdmin];
      localStorage.setItem('lider_users', JSON.stringify(users));
    }

    const loggedUser = users.find((u: any) => u.username === 'admin');
    setCurrentUser(loggedUser || users[0]);

    const savedParts = localStorage.getItem('lider_inventory');
    if (savedParts) setParts(JSON.parse(savedParts));

    const savedCustomers = localStorage.getItem('lider_customers');
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

    const savedMovements = localStorage.getItem('lider_movements');
    if (savedMovements) setMovements(JSON.parse(savedMovements));

    const savedSettings = localStorage.getItem('lider_site_settings');
    if (savedSettings) setSiteSettings(JSON.parse(savedSettings));

    const savedOrders = localStorage.getItem('lider_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, [navigate]);

  const hasPermission = (tab: keyof UserProfile['permissions'], action: 'view' | 'edit' | 'delete') => {
    if (!currentUser) return false;
    return currentUser.permissions[tab][action];
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('estoque', 'edit')) {
      showError('Você não tem permissão para adicionar itens.');
      return;
    }
    if (!newName || !newQty) return;
    const qty = parseInt(newQty);
    const newPart: Part = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      quantity: qty
    };
    
    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      partName: newName,
      type: 'entrada',
      quantity: qty,
      user: currentUser?.username || 'Sistema',
      date: new Date().toLocaleString()
    };

    const updatedParts = [...parts, newPart];
    const updatedMovements = [newMovement, ...movements];
    
    setParts(updatedParts);
    setMovements(updatedMovements);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    localStorage.setItem('lider_movements', JSON.stringify(updatedMovements));
    
    setNewName('');
    setNewQty('');
    showSuccess('Peça cadastrada com sucesso!');
  };

  const registerMovement = (partId: string, type: 'entrada' | 'saida', amount: number) => {
    if (!hasPermission('estoque', 'edit')) {
      showError('Sem permissão para movimentar estoque.');
      return;
    }
    const updatedParts = parts.map(part => {
      if (part.id === partId) {
        const newTotal = type === 'entrada' ? part.quantity + amount : part.quantity - amount;
        if (newTotal < 0) {
          showError('Estoque insuficiente!');
          return part;
        }

        const newMovement: Movement = {
          id: Math.random().toString(36).substr(2, 9),
          partName: part.name,
          type,
          quantity: amount,
          user: currentUser?.username || 'Sistema',
          date: new Date().toLocaleString()
        };

        const updatedMovements = [newMovement, ...movements];
        setMovements(updatedMovements);
        localStorage.setItem('lider_movements', JSON.stringify(updatedMovements));
        
        return { ...part, quantity: newTotal };
      }
      return part;
    });

    setParts(updatedParts);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    showSuccess(`${type === 'entrada' ? 'Entrada' : 'Saída'} registrada!`);
  };

  const handleSaveOrder = (order: any, customerData?: Customer) => {
    if (!hasPermission('orcamentos', 'edit')) {
      showError('Sem permissão para salvar orçamentos.');
      return;
    }
    let updatedOrders;
    const existingIndex = orders.findIndex(o => o.id === order.id);
    
    if (existingIndex >= 0) {
      updatedOrders = [...orders];
      updatedOrders[existingIndex] = order;
      setOrderToEdit(null);
      setActiveOrcamentoTab('lista');
    } else {
      updatedOrders = [order, ...orders];
    }
    
    setOrders(updatedOrders);
    localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));

    if (customerData) {
      const exists = customers.some(c => c.document === customerData.document);
      if (!exists && customerData.document) {
        const updatedCustomers = [...customers, customerData];
        setCustomers(updatedCustomers);
        localStorage.setItem('lider_customers', JSON.stringify(updatedCustomers));
      }
    }
  };

  const handleExecuteOrder = (orderId: string) => {
    if (!hasPermission('orcamentos', 'edit')) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const partsToDeduct = order.parts.filter((p: any) => p.inventoryPartId);
    let canExecute = true;
    
    partsToDeduct.forEach((p: any) => {
      const invPart = parts.find(ip => ip.id === p.inventoryPartId);
      if (!invPart || invPart.quantity < p.qty) {
        canExecute = false;
        showError(`Estoque insuficiente para: ${p.description}`);
      }
    });

    if (!canExecute) return;

    let updatedParts = [...parts];
    let newMovements = [...movements];

    partsToDeduct.forEach((p: any) => {
      updatedParts = updatedParts.map(ip => {
        if (ip.id === p.inventoryPartId) {
          const newMovement: Movement = {
            id: Math.random().toString(36).substr(2, 9),
            partName: ip.name,
            type: 'saida',
            quantity: p.qty,
            user: currentUser?.username || 'Sistema',
            date: new Date().toLocaleString()
          };
          newMovements = [newMovement, ...newMovements];
          return { ...ip, quantity: ip.quantity - p.qty };
        }
        return ip;
      });
    });

    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: 'Executado' } : o
    );

    setParts(updatedParts);
    setMovements(newMovements);
    setOrders(updatedOrders);
    
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    localStorage.setItem('lider_movements', JSON.stringify(newMovements));
    localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));

    showSuccess('Orçamento executado e estoque atualizado!');
  };

  const handleCancelOrder = (orderId: string) => {
    if (!hasPermission('orcamentos', 'edit')) return;
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: 'Cancelado' } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));
    showSuccess('Orçamento finalizado como cancelado.');
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!hasPermission('orcamentos', 'delete')) {
      showError('Sem permissão para excluir.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este orçamento permanentemente?')) {
      const updatedOrders = orders.filter(o => o.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));
      showSuccess('Orçamento excluído com sucesso.');
    }
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleEditOrder = (order: any) => {
    if (!hasPermission('orcamentos', 'edit')) return;
    setOrderToEdit(order);
    setActiveOrcamentoTab('novo');
  };

  const handleEditCustomer = (customer: Customer) => {
    if (!hasPermission('clientes', 'edit')) return;
    setEditingCustomer({ ...customer });
    setIsEditCustomerOpen(true);
  };

  const handleSaveCustomerEdit = () => {
    if (!editingCustomer) return;
    
    const updatedCustomers = customers.map(c => 
      c.id === editingCustomer.id ? editingCustomer : c
    );
    
    setCustomers(updatedCustomers);
    localStorage.setItem('lider_customers', JSON.stringify(updatedCustomers));
    setIsEditCustomerOpen(false);
    showSuccess('Dados do cliente atualizados!');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteSettings({ ...siteSettings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteSettings({ ...siteSettings, aboutImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredParts = parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    o.clientName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    o.plate.toLowerCase().includes(orderSearchTerm.toLowerCase())
  );
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.document.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );
  
  const lowStockCount = parts.filter(p => p.quantity < 5).length;

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center space-y-4">
        <Snowflake className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
        <p className="text-blue-900 font-bold">Carregando perfil de acesso...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg"><Snowflake className="h-5 w-5 text-white" /></div>
            <h1 className="text-xl font-bold text-blue-900 hidden md:block">Gestão Lider</h1>
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <ShieldCheck size={14} className="text-blue-600" />
              <span className="text-xs font-black text-blue-900 uppercase">{currentUser.username} ({currentUser.role})</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-100">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="estoque" className="space-y-8">
          <TabsList className="bg-white border border-blue-100 p-1 h-12 overflow-x-auto flex-nowrap">
            {currentUser.permissions.estoque.view && <TabsTrigger value="estoque" className="px-6">Estoque</TabsTrigger>}
            {currentUser.permissions.orcamentos.view && <TabsTrigger value="orcamentos" className="px-6">Orçamentos / OS</TabsTrigger>}
            {currentUser.permissions.clientes.view && <TabsTrigger value="clientes" className="px-6">Clientes</TabsTrigger>}
            {currentUser.permissions.config.view && <TabsTrigger value="config" className="px-6">Configurações</TabsTrigger>}
          </TabsList>

          {/* CONTEÚDO ESTOQUE */}
          <TabsContent value="estoque" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">Gestão de Estoque</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-blue-600 text-white shadow-xl border-none">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <Package size={40} className="opacity-40" />
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase opacity-70">Total de Itens</p>
                      <p className="text-4xl font-black">{parts.length}</p>
                    </div>
                  </div>
                  {lowStockCount > 0 && (
                    <div className="mt-4 flex items-center gap-2 bg-red-500/30 p-3 rounded-xl border border-red-400/30">
                      <AlertTriangle size={18} className="text-yellow-300" />
                      <span className="text-sm font-bold">{lowStockCount} itens com estoque baixo!</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-lg border-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                    <BarChart3 size={16} className="text-blue-600" /> Níveis de Estoque (Top 10)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={parts.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                      <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                        {parts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.quantity < 5 ? '#ef4444' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="lista" className="w-full">
              <TabsList className="bg-white border border-blue-100 mb-6">
                <TabsTrigger value="lista">Lista de Peças</TabsTrigger>
                {currentUser.permissions.historico.view && <TabsTrigger value="historico">Histórico de Movimentações</TabsTrigger>}
              </TabsList>

              <TabsContent value="lista" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {hasPermission('estoque', 'edit') && (
                    <Card className="h-fit shadow-lg border-blue-50">
                      <CardHeader className="bg-blue-50/50 border-b border-blue-50">
                        <CardTitle className="text-lg flex items-center gap-2 text-blue-900"><PlusCircle className="text-blue-600" /> Nova Peça</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <form onSubmit={handleAddPart} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Nome da Peça</label>
                            <Input placeholder="Ex: Compressor TM16" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Quantidade Inicial</label>
                            <Input type="number" placeholder="0" value={newQty} onChange={(e) => setNewQty(e.target.value)} required />
                          </div>
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 font-bold">Cadastrar no Sistema</Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  <Card className={`${hasPermission('estoque', 'edit') ? 'lg:col-span-2' : 'lg:col-span-3'} shadow-lg border-blue-50`}>
                    <CardHeader className="flex flex-row items-center justify-between bg-blue-50/50 border-b border-blue-50">
                      <CardTitle className="text-lg text-blue-900">Controle de Peças</CardTitle>
                      <div className="relative w-48 sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar peça..." className="pl-10 bg-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50">
                            <TableHead className="font-bold text-blue-900">Peça</TableHead>
                            <TableHead className="text-center font-bold text-blue-900">Qtd Atual</TableHead>
                            {hasPermission('estoque', 'edit') && <TableHead className="text-right font-bold text-blue-900">Movimentar</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredParts.map((part) => (
                            <TableRow key={part.id} className="hover:bg-blue-50/30 transition-colors">
                              <TableCell className="font-medium text-gray-700">{part.name}</TableCell>
                              <TableCell className="text-center">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black ${part.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {part.quantity}
                                </span>
                              </TableCell>
                              {hasPermission('estoque', 'edit') && (
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50" onClick={() => registerMovement(part.id, 'entrada', 1)}><Plus size={16} /></Button>
                                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => registerMovement(part.id, 'saida', 1)}><Minus size={16} /></Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="historico">
                <Card className="shadow-lg border-blue-50">
                  <CardHeader className="bg-blue-50/50 border-b border-blue-50">
                    <CardTitle className="flex items-center gap-2 text-blue-900"><History className="text-blue-600" /> Histórico de Movimentações</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="font-bold">Data/Hora</TableHead>
                          <TableHead className="font-bold">Peça</TableHead>
                          <TableHead className="font-bold">Tipo</TableHead>
                          <TableHead className="text-center font-bold">Qtd</TableHead>
                          <TableHead className="font-bold">Operador</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movements.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="text-xs text-gray-500">{m.date}</TableCell>
                            <TableCell className="font-medium">{m.partName}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase ${m.type === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {m.type === 'entrada' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                                {m.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-bold">{m.quantity}</TableCell>
                            <TableCell className="text-sm text-blue-600 font-bold">{m.user}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* CONTEÚDO ORÇAMENTOS */}
          <TabsContent value="orcamentos" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">Gestão de Orçamentos</h2>
              <div className="flex gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Buscar orçamento..." 
                    className="pl-10 bg-white" 
                    value={orderSearchTerm} 
                    onChange={(e) => setOrderSearchTerm(e.target.value)} 
                  />
                </div>
                <Button variant="outline" onClick={() => exportToExcel(orders, 'orcamentos_lider')}><TableIcon className="mr-2 h-4 w-4" /> Exportar Excel</Button>
              </div>
            </div>

            <Tabs value={activeOrcamentoTab} onValueChange={setActiveOrcamentoTab} className="w-full">
              <TabsList className="bg-white border border-blue-100 mb-6">
                <TabsTrigger value="lista">Histórico de Orçamentos</TabsTrigger>
                {hasPermission('orcamentos', 'edit') && <TabsTrigger value="novo">{orderToEdit ? 'Editando Orçamento' : 'Novo Orçamento'}</TabsTrigger>}
              </TabsList>

              <TabsContent value="lista">
                <Card className="shadow-lg border-blue-50">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50">
                          <TableHead className="font-bold">ID</TableHead>
                          <TableHead className="font-bold">Cliente</TableHead>
                          <TableHead className="font-bold">Veículo</TableHead>
                          <TableHead className="font-bold">Total</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="text-right font-bold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="cursor-pointer hover:bg-blue-50/30" onClick={() => handleViewDetails(order)}>
                            <TableCell className="font-bold text-blue-600">#{order.id}</TableCell>
                            <TableCell>{order.clientName}</TableCell>
                            <TableCell>{order.plate} - {order.vehicleModel}</TableCell>
                            <TableCell className="font-bold">R$ {order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 
                                order.status === 'Executado' ? 'bg-green-100 text-green-700' : 
                                'bg-red-100 text-red-700'
                              }`}>
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                {order.status === 'Pendente' && hasPermission('orcamentos', 'edit') && (
                                  <>
                                    <Button title="Executar (Baixa Estoque)" size="sm" variant="outline" className="border-green-200 text-green-600" onClick={() => handleExecuteOrder(order.id)}><Play size={16} /></Button>
                                    <Button title="Cancelar" size="sm" variant="outline" className="border-red-200 text-red-600" onClick={() => handleCancelOrder(order.id)}><Ban size={16} /></Button>
                                    <Button title="Editar" size="sm" variant="outline" className="border-blue-200 text-blue-600" onClick={() => handleEditOrder(order)}><Edit2 size={16} /></Button>
                                  </>
                                )}
                                <Button title="Visualizar" size="sm" variant="ghost" onClick={() => handleViewDetails(order)}><Eye size={16}/></Button>
                                <Button title="Baixar PDF" size="sm" variant="ghost" onClick={() => generateServiceOrderPDF(order, siteSettings)}><Download size={16}/></Button>
                                {hasPermission('orcamentos', 'delete') && (
                                  <Button title="Excluir Permanentemente" size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteOrder(order.id)}><Trash2 size={16}/></Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="novo">
                <ServiceOrderForm 
                  onSave={handleSaveOrder} 
                  technicianName={currentUser.username} 
                  inventoryParts={parts}
                  customers={customers}
                  previousOrders={orders}
                  initialData={orderToEdit}
                  onCancelEdit={() => {
                    setOrderToEdit(null);
                    setActiveOrcamentoTab('lista');
                  }}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* CONTEÚDO CLIENTES */}
          <TabsContent value="clientes" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">Gestão de Clientes</h2>
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar cliente..." 
                  className="pl-10 bg-white" 
                  value={customerSearchTerm} 
                  onChange={(e) => setCustomerSearchTerm(e.target.value)} 
                />
              </div>
            </div>

            <Card className="shadow-lg border-blue-50">
              <CardHeader className="bg-blue-50/50 border-b border-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-900"><Users className="text-blue-600" /> Clientes Cadastrados</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-bold">Nome / Empresa</TableHead>
                      <TableHead className="font-bold">CPF / CNPJ</TableHead>
                      <TableHead className="font-bold">Telefone</TableHead>
                      <TableHead className="font-bold">E-mail</TableHead>
                      <TableHead className="text-right font-bold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold">{c.name}</TableCell>
                        <TableCell>{c.document}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {hasPermission('clientes', 'edit') && <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleEditCustomer(c)}><Edit2 size={16}/></Button>}
                            {hasPermission('clientes', 'delete') && (
                              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => {
                                if (window.confirm('Excluir este cliente?')) {
                                  const updated = customers.filter(cust => cust.id !== c.id);
                                  setCustomers(updated);
                                  localStorage.setItem('lider_customers', JSON.stringify(updated));
                                }
                              }}><Trash2 size={16}/></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTEÚDO CONFIGURAÇÕES */}
          <TabsContent value="config" className="space-y-8">
            <Tabs defaultValue="site" className="w-full">
              <TabsList className="bg-white border border-blue-100 mb-6">
                <TabsTrigger value="site">Site e Institucional</TabsTrigger>
                <TabsTrigger value="banners">Banners</TabsTrigger>
                <TabsTrigger value="usuarios">Gestão de Usuários e Permissões</TabsTrigger>
              </TabsList>

              <TabsContent value="site">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* COLUNA 1: CONTATOS E IDENTIDADE */}
                  <Card className="border-blue-100 shadow-lg">
                    <CardHeader className="bg-blue-50 border-b border-blue-100">
                      <CardTitle className="flex items-center gap-2 text-blue-900"><Globe className="text-blue-600" /> Contatos e Identidade</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <form className="space-y-6">
                        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <label className="text-xs font-bold text-blue-900 uppercase tracking-wider">Logo da Empresa (Para o PDF)</label>
                          <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white border-2 border-dashed border-blue-200 rounded-xl flex items-center justify-center overflow-hidden relative group">
                              {siteSettings.logo ? (
                                <img src={siteSettings.logo} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                <ImageIcon className="text-blue-200 w-8 h-8" />
                              )}
                              <label className="absolute inset-0 bg-blue-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <Upload size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              </label>
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-bold text-gray-700">Upload da Logo</p>
                              <p className="text-xs text-gray-500">Recomendado: PNG ou JPG com fundo branco ou transparente.</p>
                              {siteSettings.logo && (
                                <Button variant="ghost" size="sm" className="text-red-500 h-8 px-2" onClick={() => setSiteSettings({...siteSettings, logo: ''})}>
                                  <Trash2 size={14} className="mr-1" /> Remover Logo
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold">Nome da Empresa (PDF)</label>
                          <Input value={siteSettings.companyName} onChange={(e) => setSiteSettings({...siteSettings, companyName: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1"><label className="text-xs font-bold">WhatsApp</label><Input value={siteSettings.whatsapp} onChange={(e) => setSiteSettings({...siteSettings, whatsapp: e.target.value})} /></div>
                          <div className="space-y-1"><label className="text-xs font-bold">E-mail</label><Input value={siteSettings.email} onChange={(e) => setSiteSettings({...siteSettings, email: e.target.value})} /></div>
                        </div>
                        <div className="space-y-1"><label className="text-xs font-bold">Instagram</label><Input value={siteSettings.instagram} onChange={(e) => setSiteSettings({...siteSettings, instagram: e.target.value})} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold">Facebook</label><Input value={siteSettings.facebook} onChange={(e) => setSiteSettings({...siteSettings, facebook: e.target.value})} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold">Endereço</label><Input value={siteSettings.address} onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})} /></div>
                        <div className="space-y-1"><label className="text-xs font-bold">CNPJ</label><Input value={siteSettings.cnpj} onChange={(e) => setSiteSettings({...siteSettings, cnpj: e.target.value})} /></div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* COLUNA 2: CONTEÚDO INSTITUCIONAL */}
                  <Card className="border-blue-100 shadow-lg">
                    <CardHeader className="bg-blue-50 border-b border-blue-100">
                      <CardTitle className="flex items-center gap-2 text-blue-900"><Info className="text-blue-600" /> Conteúdo Institucional (Sobre Nós)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <label className="text-xs font-bold text-blue-900 uppercase tracking-wider">Imagem da Seção Sobre</label>
                        <div className="flex items-center gap-6">
                          <div className="w-32 h-32 bg-white border-2 border-dashed border-blue-200 rounded-xl flex items-center justify-center overflow-hidden relative group">
                            <img src={siteSettings.aboutImage} alt="Sobre" className="w-full h-full object-cover" />
                            <label className="absolute inset-0 bg-blue-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                              <Upload size={20} />
                              <input type="file" className="hidden" accept="image/*" onChange={handleAboutImageUpload} />
                            </label>
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-bold text-gray-700">Alterar Foto</p>
                            <p className="text-xs text-gray-500">Esta imagem aparece ao lado do texto institucional na página inicial.</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold">Anos de Experiência</label>
                          <Input value={siteSettings.aboutYears} onChange={(e) => setSiteSettings({...siteSettings, aboutYears: e.target.value})} placeholder="Ex: 15+" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold">Título da Seção</label>
                          <Input value={siteSettings.aboutTitle} onChange={(e) => setSiteSettings({...siteSettings, aboutTitle: e.target.value})} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold">Descrição / História</label>
                        <Textarea 
                          className="min-h-[150px]" 
                          value={siteSettings.aboutDescription} 
                          onChange={(e) => setSiteSettings({...siteSettings, aboutDescription: e.target.value})} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button type="button" onClick={() => {localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings)); showSuccess('Configurações salvas!');}} className="bg-blue-600 px-12 py-6 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
                    <Save className="mr-2 h-5 w-5" /> SALVAR TODAS AS ALTERAÇÕES
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="banners">
                <Card className="border-blue-100 shadow-lg max-w-2xl">
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <CardTitle className="flex items-center gap-2 text-blue-900"><ImageIcon className="text-blue-600" /> Banners do Carrossel</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <PlusCircle className="w-8 h-8 text-blue-400 mb-2" />
                          <p className="text-sm text-blue-500 font-medium">Subir nova foto</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const newBanner: Banner = { id: Math.random().toString(36).substr(2, 9), url: reader.result as string, zoom: 100, rotate: 0 };
                              setSiteSettings({...siteSettings, banners: [...siteSettings.banners, newBanner]});
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                    <div className="space-y-6">
                      {siteSettings.banners.map((banner) => (
                        <div key={banner.id} className="space-y-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prévia do Banner</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:bg-red-50" onClick={() => setSiteSettings({...siteSettings, banners: siteSettings.banners.filter(b => b.id !== banner.id)})}><X size={14} /></Button>
                          </div>
                          <div className="relative aspect-[21/9] w-full rounded-xl overflow-hidden bg-blue-900 border border-blue-100">
                            <img src={banner.url} className="w-full h-full object-cover" style={{ transform: `scale(${banner.zoom / 100}) rotate(${banner.rotate}deg)` }} />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-900/40 to-transparent" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Zoom</label><Slider value={[banner.zoom]} min={50} max={200} onValueChange={([v]) => setSiteSettings({...siteSettings, banners: siteSettings.banners.map(b => b.id === banner.id ? {...b, zoom: v} : b)})} /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Rotação</label><Slider value={[banner.rotate]} min={-180} max={180} onValueChange={([v]) => setSiteSettings({...siteSettings, banners: siteSettings.banners.map(b => b.id === banner.id ? {...b, rotate: v} : b)})} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => {localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings)); showSuccess('Banners salvos!');}} className="w-full bg-blue-600"><Save className="mr-2 h-4 w-4" /> Salvar Banners</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usuarios">
                <UserAdminSettings />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      {/* Diálogo de Edição de Cliente */}
      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Nome / Empresa</label>
                <Input 
                  value={editingCustomer.name} 
                  onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">CPF / CNPJ</label>
                <Input 
                  value={editingCustomer.document} 
                  onChange={(e) => setEditingCustomer({...editingCustomer, document: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Telefone</label>
                <Input 
                  value={editingCustomer.phone} 
                  onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">E-mail</label>
                <Input 
                  value={editingCustomer.email} 
                  onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCustomerOpen(false)}>Cancelar</Button>
            <Button className="bg-blue-600" onClick={handleSaveCustomerEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ServiceOrderDetails 
        order={selectedOrder} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        onDownload={(order) => generateServiceOrderPDF(order, siteSettings)}
        onSendEmail={(order) => showSuccess(`Enviado para ${order.email}`)}
      />
    </div>
  );
};

export default Dashboard;