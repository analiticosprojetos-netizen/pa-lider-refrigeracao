"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Minus, LogOut, PlusCircle, Search, Snowflake, Trash2, 
  BarChart3, AlertTriangle, Settings, Save, Globe, Image as ImageIcon,
  History, User, ArrowUpCircle, ArrowDownCircle, X, Clock, FileText, Mail, Download, Table as TableIcon, Play, Ban, Users, Eye, Edit2, ShieldCheck, ShieldAlert, Upload, Info, Calendar, MapPin, ChevronLeft, ChevronRight, RotateCcw, Percent, TrendingDown, ExternalLink, MessageCircle, Landmark
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
import AnalyticsTab from '@/components/AnalyticsTab';
import FinanceTab from '@/components/FinanceTab';
import { generateServiceOrderPDF, exportToExcel, getServiceOrderFile } from '@/utils/exportUtils';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  createdAt?: string;
}

interface Movement {
  id: string;
  partName: string;
  type: 'entrada' | 'saida' | 'correcao';
  quantity: number;
  user: string;
  date: string;
  note?: string;
}

interface Banner {
  id: string;
  url: string;
  zoom: number;
  rotate: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [parts, setParts] = React.useState<Part[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [movements, setMovements] = React.useState<Movement[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [usersCount, setUsersCount] = React.useState(0);
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [orderSearchTerm, setOrderSearchTerm] = React.useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = React.useState('');
  
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 7;

  const [currentMovementPage, setCurrentMovementPage] = React.useState(1);
  const MOVEMENTS_PER_PAGE = 10;

  const [newName, setNewName] = React.useState('');
  const [newQty, setNewQty] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = React.useState(false);
  
  const [editingPart, setEditingPart] = React.useState<Part | null>(null);
  const [isEditPartOpen, setIsEditPartOpen] = React.useState(false);

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
    latitude: '',
    longitude: '',
    googleMapsUrl: '',
    banners: [] as Banner[],
    carouselDelay: 6,
    aboutYears: '15+',
    aboutTitle: 'Excelência em Refrigeração de Transportes',
    aboutDescription: 'A Lider Refrigeração nasceu com o compromisso de oferecer soluções técnicas de alta precisão para o transporte de cargas refrigeradas.',
    aboutImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80',
    maxDiscountWarning: 10,
    maxDiscountDanger: 15
  });

  const formatToStandardCase = (str: string) => {
    if (!str) return str;
    return str.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
  };

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

  const handleWhatsAppClick = (phone: string, message?: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return;
    const url = `https://wa.me/55${cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = (order: any) => {
    if (!order.email) {
      showError('Cliente não possui e-mail cadastrado.');
      return;
    }
    const subject = `Orçamento #${order.id} - ${siteSettings.companyName}`;
    const body = `Olá ${order.clientName},\n\nSegue o detalhamento do seu orçamento #${order.id}.\n\nTotal: R$ ${order.total.toFixed(2)}`;
    window.location.href = `mailto:${order.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSendWhatsAppOrder = (order: any) => {
    if (!order.phone) {
      showError('Cliente não possui telefone cadastrado.');
      return;
    }
    const message = `Olá ${order.clientName}, aqui é da ${siteSettings.companyName}. Segue o seu orçamento #${order.id}.\n\nTotal: R$ ${order.total.toFixed(2)}`;
    handleWhatsAppClick(order.phone, message);
  };

  const handleShareOrder = async (order: any) => {
    const pdfFile = getServiceOrderFile(order, siteSettings);
    if (!pdfFile) return;

    const shareData = {
      title: `Orçamento #${order.id}`,
      text: `Olá ${order.clientName}, segue o orçamento da ${siteSettings.companyName}.`,
      files: [pdfFile]
    };

    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share(shareData);
        showSuccess('Orçamento compartilhado!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          showError('Erro ao compartilhar.');
        }
      }
    } else {
      showError('Seu navegador não suporta compartilhamento de arquivos.');
    }
  };

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUser = localStorage.getItem('currentUser');

    if (!isLoggedIn || !savedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(savedUser);
    setCurrentUser(user);

    const savedParts = localStorage.getItem('lider_inventory');
    if (savedParts) setParts(JSON.parse(savedParts));

    const savedCustomers = localStorage.getItem('lider_customers');
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

    const savedMovements = localStorage.getItem('lider_movements');
    if (savedMovements) setMovements(JSON.parse(savedMovements));

    const savedSettings = localStorage.getItem('lider_site_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSiteSettings({
        ...siteSettings,
        ...parsed
      });
    }

    const savedOrders = localStorage.getItem('lider_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedUsers = localStorage.getItem('lider_users');
    if (savedUsers) setUsersCount(JSON.parse(savedUsers).length);
  }, [navigate]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const hasPermission = (tab: keyof UserProfile['permissions'], action: 'view' | 'edit' | 'delete') => {
    if (!currentUser) return false;
    return currentUser.permissions[tab][action];
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('estoque', 'edit')) return;
    if (!newName || !newQty) return;
    const qty = parseInt(newQty);
    const formattedName = formatToStandardCase(newName);
    
    const newPart: Part = {
      id: Math.random().toString(36).substr(2, 9),
      name: formattedName,
      quantity: qty
    };
    
    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      partName: formattedName,
      type: 'entrada',
      quantity: qty,
      user: currentUser?.username || 'Sistema',
      date: new Date().toLocaleString(),
      note: 'Cadastro inicial'
    };

    const updatedParts = [...parts, newPart];
    const updatedMovements = [newMovement, ...movements];
    
    setParts(updatedParts);
    setMovements(updatedMovements);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    localStorage.setItem('lider_movements', JSON.stringify(updatedMovements));
    
    setNewName('');
    setNewQty('');
    showSuccess('Peça cadastrada!');
  };

  const handleEditPart = (part: Part) => {
    if (!hasPermission('estoque', 'edit')) return;
    setEditingPart({ ...part });
    setIsEditPartOpen(true);
  };

  const handleSavePartEdit = () => {
    if (!editingPart) return;
    const updatedParts = parts.map(p => p.id === editingPart.id ? editingPart : p);
    setParts(updatedParts);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    setIsEditPartOpen(false);
    showSuccess('Peça atualizada!');
  };

  const handleDeletePart = (id: string) => {
    if (!hasPermission('estoque', 'delete')) return;
    if (window.confirm('Excluir esta peça?')) {
      const updatedParts = parts.filter(p => p.id !== id);
      setParts(updatedParts);
      localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
      showSuccess('Peça removida.');
    }
  };

  const registerMovement = (partId: string, type: 'entrada' | 'saida', amount: number) => {
    if (!hasPermission('estoque', 'edit')) return;
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
          date: new Date().toLocaleString(),
          note: type === 'entrada' ? 'Entrada manual' : 'Saída manual'
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
    showSuccess('Movimentação registrada!');
  };

  const handleSaveOrder = (order: any, customerData?: Customer) => {
    if (!hasPermission('orcamentos', 'edit')) return;
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
        const updatedCustomers = [...customers, { ...customerData, createdAt: new Date().toLocaleDateString() }];
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
            date: new Date().toLocaleString(),
            note: `Baixa OS #${order.id}`
          };
          newMovements = [newMovement, ...newMovements];
          return { ...ip, quantity: ip.quantity - p.qty };
        }
        return ip;
      });
    });

    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: 'Executado', executedAt: new Date().toISOString() } : o
    );

    setParts(updatedParts);
    setMovements(newMovements);
    setOrders(updatedOrders);
    
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    localStorage.setItem('lider_movements', JSON.stringify(newMovements));
    localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));

    showSuccess('Orçamento executado!');
  };

  const handleRevertOrder = (orderId: string) => {
    if (!hasPermission('orcamentos', 'edit')) return;
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'Executado') return;

    if (!window.confirm('Deseja estornar este orçamento?')) return;

    const partsToReturn = order.parts.filter((p: any) => p.inventoryPartId);
    
    let updatedParts = [...parts];
    let newMovements = [...movements];

    partsToReturn.forEach((p: any) => {
      updatedParts = updatedParts.map(ip => {
        if (ip.id === p.inventoryPartId) {
          const newMovement: Movement = {
            id: Math.random().toString(36).substr(2, 9),
            partName: ip.name,
            type: 'entrada',
            quantity: p.qty,
            user: currentUser?.username || 'Sistema',
            date: new Date().toLocaleString(),
            note: `Estorno OS #${order.id}`
          };
          newMovements = [newMovement, ...newMovements];
          return { ...ip, quantity: ip.quantity + p.qty };
        }
        return ip;
      });
    });

    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: 'Pendente', executedAt: null } : o
    );

    setParts(updatedParts);
    setMovements(newMovements);
    setOrders(updatedOrders);
    
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    localStorage.setItem('lider_movements', JSON.stringify(newMovements));
    localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));

    showSuccess('Orçamento estornado!');
  };

  const handleCancelOrder = (orderId: string) => {
    if (!hasPermission('orcamentos', 'edit')) return;
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: 'Cancelado', cancelledAt: new Date().toISOString() } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));
    showSuccess('Orçamento cancelado.');
  };

  const handleDeleteOrder = (orderId: string) => {
    if (!hasPermission('orcamentos', 'delete')) return;
    if (window.confirm('Excluir este orçamento?')) {
      const updatedOrders = orders.filter(o => o.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));
      showSuccess('Orçamento excluído.');
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
    const updatedCustomers = customers.map(c => c.id === editingCustomer.id ? editingCustomer : c);
    setCustomers(updatedCustomers);
    localStorage.setItem('lider_customers', JSON.stringify(updatedCustomers));
    setIsEditCustomerOpen(false);
    showSuccess('Cliente atualizado!');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
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

  const filteredParts = parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const paginatedParts = filteredParts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredParts.length / ITEMS_PER_PAGE);

  const paginatedMovements = movements.slice((currentMovementPage - 1) * MOVEMENTS_PER_PAGE, currentMovementPage * MOVEMENTS_PER_PAGE);
  const totalMovementPages = Math.ceil(movements.length / MOVEMENTS_PER_PAGE);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    o.clientName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    o.plate.toLowerCase().includes(orderSearchTerm.toLowerCase())
  );
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.document.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );
  
  const lowStockCount = parts.filter(p => p.quantity < 5).length;
  const totalStockQuantity = parts.reduce((acc, p) => acc + p.quantity, 0);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg"><Snowflake className="h-5 w-5 text-white" /></div>
            <h1 className="text-xl font-bold text-blue-900 dark:text-white hidden md:block">Gestão Lider</h1>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-black text-blue-900 dark:text-blue-200 uppercase">{currentUser.username}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-100 dark:border-red-900/30">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="estoque" className="space-y-8">
          <TabsList className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-1 h-12 w-full justify-start overflow-x-auto flex-nowrap scrollbar-hide">
            {currentUser.permissions.estoque.view && <TabsTrigger value="estoque" className="px-6 flex-shrink-0">Estoque</TabsTrigger>}
            {currentUser.permissions.orcamentos.view && <TabsTrigger value="orcamentos" className="px-6 flex-shrink-0">Orçamentos</TabsTrigger>}
            {currentUser.permissions.clientes.view && <TabsTrigger value="clientes" className="px-6 flex-shrink-0">Clientes</TabsTrigger>}
            {currentUser.permissions.config.view && <TabsTrigger value="financeiro" className="px-6 flex-shrink-0">Financeiro</TabsTrigger>}
            {currentUser.permissions.config.view && <TabsTrigger value="analytics" className="px-6 flex-shrink-0">Analytics</TabsTrigger>}
            {currentUser.permissions.config.view && <TabsTrigger value="config" className="px-6 flex-shrink-0">Configurações</TabsTrigger>}
          </TabsList>

          <TabsContent value="estoque" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-blue-600 text-white shadow-xl border-none overflow-hidden">
                <CardContent className="pt-6 relative">
                  <div className="flex justify-between items-start mb-6">
                    <Package size={48} className="opacity-20" />
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Total em Estoque</p>
                      <p className="text-5xl font-black">{totalStockQuantity}</p>
                    </div>
                  </div>
                  {lowStockCount > 0 && (
                    <div className="flex items-center gap-3 bg-red-500/40 p-4 rounded-2xl border border-red-400/30 animate-pulse">
                      <AlertTriangle size={20} className="text-yellow-300 shrink-0" />
                      <span className="text-sm font-bold">{lowStockCount} itens baixos!</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                    <BarChart3 size={16} className="text-blue-600" /> Níveis de Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={parts.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                      <YAxis fontSize={10} tick={{fill: '#64748b'}} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                        cursor={{ fill: '#f8fafc', opacity: 0.1 }}
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
              <TabsList className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 mb-6 w-full justify-start">
                <TabsTrigger value="lista">Lista</TabsTrigger>
                {currentUser.permissions.historico.view && <TabsTrigger value="historico">Histórico</TabsTrigger>}
              </TabsList>

              <TabsContent value="lista" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {hasPermission('estoque', 'edit') && (
                    <Card className="h-fit shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900">
                      <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
                        <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-white"><PlusCircle className="text-blue-600" /> Nova Peça</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <form onSubmit={handleAddPart} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Nome</label>
                            <Input placeholder="Ex: Compressor" value={newName} onChange={(e) => setNewName(e.target.value)} required className="dark:bg-slate-950 dark:border-slate-800" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase">Qtd Inicial</label>
                            <Input type="number" placeholder="0" value={newQty} onChange={(e) => setNewQty(e.target.value)} required className="dark:bg-slate-950 dark:border-slate-800" />
                          </div>
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 font-bold">Cadastrar</Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  <Card className={`${hasPermission('estoque', 'edit') ? 'lg:col-span-2' : 'lg:col-span-3'} shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900`}>
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
                      <CardTitle className="text-lg text-blue-900 dark:text-white">Controle</CardTitle>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar..." className="pl-10 bg-white dark:bg-slate-950 dark:border-slate-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                            <TableHead className="font-bold">Peça</TableHead>
                            <TableHead className="text-center font-bold">Qtd</TableHead>
                            <TableHead className="text-right font-bold">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedParts.map((part) => (
                            <TableRow key={part.id}>
                              <TableCell className="font-medium dark:text-gray-300">{part.name}</TableCell>
                              <TableCell className="text-center">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-black ${part.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {part.quantity}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {hasPermission('estoque', 'edit') && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => registerMovement(part.id, 'entrada', 1)}><Plus size={16} /></Button>
                                      <Button size="sm" variant="outline" onClick={() => registerMovement(part.id, 'saida', 1)}><Minus size={16} /></Button>
                                      <Button size="sm" variant="ghost" onClick={() => handleEditPart(part)}><Edit2 size={16} /></Button>
                                    </>
                                  )}
                                  {hasPermission('estoque', 'delete') && (
                                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeletePart(part.id)}><Trash2 size={16} /></Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-4 border-t dark:border-slate-800">
                          <p className="text-xs text-gray-500">Página {currentPage} de {totalPages}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={16} /></Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={16} /></Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="historico">
                <Card className="shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white"><History className="text-blue-600" /> Histórico</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                          <TableHead className="font-bold">Data</TableHead>
                          <TableHead className="font-bold">Peça</TableHead>
                          <TableHead className="font-bold">Tipo</TableHead>
                          <TableHead className="text-center font-bold">Qtd</TableHead>
                          <TableHead className="font-bold">Operador</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedMovements.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="text-xs text-gray-500">{m.date}</TableCell>
                            <TableCell className="font-medium dark:text-gray-300">{m.partName}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${m.type === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {m.type}
                              </span>
                            </TableCell>
                            <TableCell className="text-center font-bold">{m.quantity}</TableCell>
                            <TableCell className="text-sm text-blue-600 font-bold">{m.user}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {totalMovementPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-4 border-t dark:border-slate-800">
                        <p className="text-xs text-gray-500">Página {currentMovementPage} de {totalMovementPages}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setCurrentMovementPage(prev => Math.max(prev - 1, 1))} disabled={currentMovementPage === 1}><ChevronLeft size={16} /></Button>
                          <Button variant="outline" size="sm" onClick={() => setCurrentMovementPage(prev => Math.min(prev + 1, totalMovementPages))} disabled={currentMovementPage === totalMovementPages}><ChevronRight size={16} /></Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="orcamentos" className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-white">Orçamentos</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input placeholder="Buscar..." className="pl-10 bg-white dark:bg-slate-950 dark:border-slate-800" value={orderSearchTerm} onChange={(e) => setOrderSearchTerm(e.target.value)} />
                </div>
                <Button variant="outline" onClick={() => exportToExcel(orders, 'orcamentos')}><TableIcon className="mr-2 h-4 w-4" /> Excel</Button>
              </div>
            </div>

            <Tabs value={activeOrcamentoTab} onValueChange={setActiveOrcamentoTab} className="w-full">
              <TabsList className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 mb-6 w-full justify-start">
                <TabsTrigger value="lista">Histórico</TabsTrigger>
                {hasPermission('orcamentos', 'edit') && <TabsTrigger value="novo">{orderToEdit ? 'Editando' : 'Novo'}</TabsTrigger>}
              </TabsList>

              <TabsContent value="lista">
                <Card className="shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                          <TableHead className="font-bold">ID</TableHead>
                          <TableHead className="font-bold">Cliente</TableHead>
                          <TableHead className="font-bold">Total</TableHead>
                          <TableHead className="font-bold">Status</TableHead>
                          <TableHead className="text-right font-bold">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="cursor-pointer hover:bg-blue-50/30" onClick={() => handleViewDetails(order)}>
                            <TableCell className="font-bold text-blue-600">#{order.id}</TableCell>
                            <TableCell className="dark:text-gray-300">{order.clientName}</TableCell>
                            <TableCell className="font-bold dark:text-gray-300">R$ {order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : order.status === 'Executado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                {order.status === 'Pendente' && hasPermission('orcamentos', 'edit') && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => handleExecuteOrder(order.id)}><Play size={16} /></Button>
                                    <Button size="sm" variant="outline" onClick={() => handleCancelOrder(order.id)}><Ban size={16} /></Button>
                                    <Button size="sm" variant="outline" onClick={() => handleEditOrder(order)}><Edit2 size={16} /></Button>
                                  </>
                                )}
                                {order.status === 'Executado' && hasPermission('orcamentos', 'edit') && (
                                  <Button size="sm" variant="outline" onClick={() => handleRevertOrder(order.id)}><RotateCcw size={16} /></Button>
                                )}
                                <Button size="sm" variant="ghost" onClick={() => handleViewDetails(order)}><Eye size={16}/></Button>
                                <Button size="sm" variant="ghost" onClick={() => generateServiceOrderPDF(order, siteSettings)}><Download size={16}/></Button>
                                {hasPermission('orcamentos', 'delete') && (
                                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteOrder(order.id)}><Trash2 size={16}/></Button>
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
                  maxDiscountWarning={siteSettings.maxDiscountWarning}
                  maxDiscountDanger={siteSettings.maxDiscountDanger}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-900 dark:text-white">Clientes</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar..." className="pl-10 bg-white dark:bg-slate-950 dark:border-slate-800" value={customerSearchTerm} onChange={(e) => setCustomerSearchTerm(e.target.value)} />
              </div>
            </div>
            <Card className="shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                      <TableHead className="font-bold">Nome</TableHead>
                      <TableHead className="font-bold">Documento</TableHead>
                      <TableHead className="font-bold">Telefone</TableHead>
                      <TableHead className="text-right font-bold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold dark:text-gray-300">{c.name}</TableCell>
                        <TableCell className="dark:text-gray-400">{c.document}</TableCell>
                        <TableCell className="dark:text-gray-400">{c.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {hasPermission('clientes', 'edit') && <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(c)}><Edit2 size={16}/></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro">
            <FinanceTab orders={orders} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab orders={orders} usersCount={usersCount} />
          </TabsContent>

          <TabsContent value="config" className="space-y-8">
            <Tabs defaultValue="site" className="w-full">
              <TabsList className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 mb-6 w-full justify-start">
                <TabsTrigger value="site">Site</TabsTrigger>
                <TabsTrigger value="regras">Regras</TabsTrigger>
                <TabsTrigger value="usuarios">Usuários</TabsTrigger>
              </TabsList>

              <TabsContent value="site">
                <Card className="border-blue-100 dark:border-slate-800 shadow-lg dark:bg-slate-900">
                  <CardHeader className="bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-800">
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white"><Globe className="text-blue-600" /> Identidade</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800">
                      <label className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider">Logo da Empresa</label>
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white dark:bg-slate-900 border-2 border-dashed border-blue-200 dark:border-slate-800 rounded-xl flex items-center justify-center overflow-hidden relative group">
                          {siteSettings.logo ? (
                            <img src={siteSettings.logo} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="text-blue-200 dark:text-slate-700 w-8 h-8" />
                          )}
                          <label className="absolute inset-0 bg-blue-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                            <Upload size={20} />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          </label>
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Upload da Logo</p>
                          <p className="text-xs text-gray-500">PNG ou JPG recomendado.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold dark:text-gray-400">Nome da Empresa</label>
                      <Input value={siteSettings.companyName} onChange={(e) => setSiteSettings({...siteSettings, companyName: e.target.value})} className="dark:bg-slate-950 dark:border-slate-800" />
                    </div>
                    <Button type="button" onClick={() => {localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings)); showSuccess('Salvo!');}} className="bg-blue-600 w-full">Salvar</Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="regras">
                <Card className="border-blue-100 dark:border-slate-800 shadow-lg dark:bg-slate-900">
                  <CardHeader className="bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-800">
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white"><TrendingDown className="text-blue-600" /> Regras</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Alerta de Desconto (%)</label>
                      <Slider value={[siteSettings.maxDiscountWarning]} min={1} max={50} onValueChange={([v]) => setSiteSettings({...siteSettings, maxDiscountWarning: v})} />
                    </div>
                    <Button onClick={() => {localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings)); showSuccess('Salvo!');}} className="w-full bg-blue-600">Salvar</Button>
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

      <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-white">Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Nome</label>
                <Input value={editingCustomer.name} onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})} className="dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Telefone</label>
                <Input value={editingCustomer.phone} onChange={(e) => setEditingCustomer({...editingCustomer, phone: formatPhone(e.target.value)})} className="dark:bg-slate-950 dark:border-slate-800" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="bg-blue-600" onClick={handleSaveCustomerEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPartOpen} onOpenChange={setIsEditPartOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-white">Editar Peça</DialogTitle>
          </DialogHeader>
          {editingPart && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Nome</label>
                <Input value={editingPart.name} onChange={(e) => setEditingPart({...editingPart, name: e.target.value})} className="dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Qtd</label>
                <Input type="number" value={editingPart.quantity} onChange={(e) => setEditingPart({...editingPart, quantity: Number(e.target.value)})} className="dark:bg-slate-950 dark:border-slate-800" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="bg-blue-600" onClick={handleSavePartEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ServiceOrderDetails 
        order={selectedOrder} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        onDownload={(order) => generateServiceOrderPDF(order, siteSettings)}
        onSendEmail={handleSendEmail}
        onSendWhatsApp={handleSendWhatsAppOrder}
        onShare={handleShareOrder}
      />
    </div>
  );
};

export default Dashboard;