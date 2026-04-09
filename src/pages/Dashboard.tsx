"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Minus, LogOut, PlusCircle, Search, Snowflake, Trash2, 
  BarChart3, AlertTriangle, Settings, Save, Globe, Image as ImageIcon,
  History, User, ArrowUpCircle, ArrowDownCircle, X, Clock, FileText, Mail, Download, Table as TableIcon, Play, Ban, Users, Eye, Edit2, ShieldCheck, ShieldAlert, Upload, Info, Calendar, MapPin, ChevronLeft, ChevronRight, RotateCcw, Percent, TrendingDown
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
import { generateServiceOrderPDF, exportToExcel } from '@/utils/exportUtils';
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
  
  // Paginação Estoque
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 7;

  // Paginação Histórico
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
    banners: [] as Banner[],
    carouselDelay: 6,
    aboutYears: '15+',
    aboutTitle: 'Excelência em Refrigeração de Transportes',
    aboutDescription: 'A Lider Refrigeração nasceu com o compromisso de oferecer soluções técnicas de alta precisão para o transporte de cargas refrigeradas. Entendemos que cada minuto parado representa um prejuízo, por isso focamos em agilidade e qualidade extrema.',
    aboutImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80',
    maxDiscountWarning: 10,
    maxDiscountDanger: 15
  });

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
        ...parsed,
        maxDiscountWarning: parsed.maxDiscountWarning ?? 10,
        maxDiscountDanger: parsed.maxDiscountDanger ?? 15
      });
    }

    const savedOrders = localStorage.getItem('lider_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    const savedUsers = localStorage.getItem('lider_users');
    if (savedUsers) setUsersCount(JSON.parse(savedUsers).length);
  }, [navigate]);

  // Resetar página ao buscar
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
    showSuccess('Peça cadastrada com sucesso!');
  };

  const handleEditPart = (part: Part) => {
    if (!hasPermission('estoque', 'edit')) return;
    setEditingPart({ ...part });
    setIsEditPartOpen(true);
  };

  const handleSavePartEdit = () => {
    if (!editingPart) return;
    
    const oldPart = parts.find(p => p.id === editingPart.id);
    if (!oldPart) return;

    const updatedParts = parts.map(p => p.id === editingPart.id ? editingPart : p);
    
    if (oldPart.quantity !== editingPart.quantity) {
      const diff = editingPart.quantity - oldPart.quantity;
      const newMovement: Movement = {
        id: Math.random().toString(36).substr(2, 9),
        partName: editingPart.name,
        type: 'correcao',
        quantity: Math.abs(diff),
        user: currentUser?.username || 'Sistema',
        date: new Date().toLocaleString(),
        note: 'Correção manual de estoque'
      };
      const updatedMovements = [newMovement, ...movements];
      setMovements(updatedMovements);
      localStorage.setItem('lider_movements', JSON.stringify(updatedMovements));
    }

    setParts(updatedParts);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    setIsEditPartOpen(false);
    showSuccess('Peça atualizada com sucesso!');
  };

  const handleDeletePart = (id: string) => {
    if (!hasPermission('estoque', 'delete')) {
      showError('Sem permissão para excluir.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir esta peça permanentemente do estoque?')) {
      const updatedParts = parts.filter(p => p.id !== id);
      setParts(updatedParts);
      localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
      showSuccess('Peça removida do estoque.');
    }
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
      o.id === orderId ? { ...o, status: 'Executado', executedAt: new Date().toLocaleString() } : o
    );

    setParts(updatedParts);
    setMovements(newMovements);
    setOrders(updatedOrders);
    
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    localStorage.setItem('lider_movements', JSON.stringify(newMovements));
    localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));

    showSuccess('Orçamento executado e estoque atualizado!');
  };

  const handleRevertOrder = (orderId: string) => {
    if (!hasPermission('orcamentos', 'edit')) return;
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'Executado') return;

    if (!window.confirm('Deseja estornar este orçamento? As peças retornarão ao estoque e o status voltará para Pendente.')) return;

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

    showSuccess('Orçamento estornado! Peças devolvidas ao estoque.');
  };

  const handleCancelOrder = (orderId: string) => {
    if (!hasPermission('orcamentos', 'edit')) return;
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: 'Cancelado', cancelledAt: new Date().toLocaleString() } : o
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
  
  // Lógica de Paginação Estoque
  const totalPages = Math.ceil(filteredParts.length / ITEMS_PER_PAGE);
  const paginatedParts = filteredParts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Lógica de Paginação Histórico
  const totalMovementPages = Math.ceil(movements.length / MOVEMENTS_PER_PAGE);
  const paginatedMovements = movements.slice(
    (currentMovementPage - 1) * MOVEMENTS_PER_PAGE,
    currentMovementPage * MOVEMENTS_PER_PAGE
  );

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

  const totalStockQuantity = parts.reduce((acc, p) => acc + p.quantity, 0);
  const totalEntradas = movements.filter(m => m.type === 'entrada').reduce((acc, m) => acc + m.quantity, 0);
  const totalSaidas = movements.filter(m => m.type === 'saida').reduce((acc, m) => acc + m.quantity, 0);

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <Snowflake className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
        <p className="text-blue-900 dark:text-blue-400 font-bold">Carregando perfil de acesso...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Snowflake className="h-4 w-4 text-white" /></div>
            <h1 className="text-lg font-bold text-blue-900 dark:text-white hidden sm:block">Gestão Lider</h1>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800">
              <ShieldCheck size={12} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-black text-blue-900 dark:text-blue-200 uppercase truncate max-w-[80px] sm:max-w-none">{currentUser.username}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-100 dark:border-red-900/30 dark:hover:bg-red-900/20 h-9 px-3">
              <LogOut className="sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Tabs defaultValue="estoque" className="space-y-6 sm:space-y-8">
          <div className="relative">
            <TabsList className="w-full bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-1 h-12 overflow-x-auto flex-nowrap justify-start scrollbar-hide">
              {currentUser.permissions.estoque.view && <TabsTrigger value="estoque" className="px-5 sm:px-8 flex-shrink-0">Estoque</TabsTrigger>}
              {currentUser.permissions.orcamentos.view && <TabsTrigger value="orcamentos" className="px-5 sm:px-8 flex-shrink-0">Orçamentos / OS</TabsTrigger>}
              {currentUser.permissions.clientes.view && <TabsTrigger value="clientes" className="px-5 sm:px-8 flex-shrink-0">Clientes</TabsTrigger>}
              {currentUser.permissions.config.view && <TabsTrigger value="analytics" className="px-5 sm:px-8 flex-shrink-0">Analytics</TabsTrigger>}
              {currentUser.permissions.config.view && <TabsTrigger value="config" className="px-5 sm:px-8 flex-shrink-0">Configurações</TabsTrigger>}
            </TabsList>
          </div>

          {/* CONTEÚDO ESTOQUE */}
          <TabsContent value="estoque" className="space-y-6 sm:space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-white">Gestão de Estoque</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              <Card className="bg-blue-600 text-white shadow-xl border-none overflow-hidden">
                <CardContent className="pt-6 relative">
                  <div className="flex justify-between items-start mb-6">
                    <Package size={40} className="opacity-20" />
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase opacity-70 tracking-widest">Total em Estoque</p>
                      <p className="text-4xl sm:text-5xl font-black">{totalStockQuantity}</p>
                      <p className="text-[9px] opacity-50 mt-1">{parts.length} tipos de itens</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 text-green-300 mb-1">
                        <ArrowUpCircle size={12} />
                        <span className="text-[9px] font-black uppercase">Entradas</span>
                      </div>
                      <p className="text-lg font-bold">{totalEntradas}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-2 text-red-300 mb-1">
                        <ArrowDownCircle size={12} />
                        <span className="text-[9px] font-black uppercase">Saídas</span>
                      </div>
                      <p className="text-lg font-bold">{totalSaidas}</p>
                    </div>
                  </div>

                  {lowStockCount > 0 && (
                    <div className="flex items-center gap-3 bg-red-500/40 p-3 rounded-xl border border-red-400/30 animate-pulse">
                      <AlertTriangle size={18} className="text-yellow-300 shrink-0" />
                      <span className="text-xs font-bold">{lowStockCount} itens com estoque baixo!</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                    <BarChart3 size={14} className="text-blue-600" /> Níveis de Estoque (Top 10)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[180px] sm:h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={parts.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" fontSize={9} tick={{fill: '#64748b'}} axisLine={false} />
                      <YAxis fontSize={9} tick={{fill: '#64748b'}} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#1e293b', color: '#fff', fontSize: '10px' }}
                        cursor={{ fill: '#f8fafc', opacity: 0.1 }}
                      />
                      <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
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
              <TabsList className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 mb-6 w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
                <TabsTrigger value="lista" className="flex-shrink-0">Lista de Peças</TabsTrigger>
                {currentUser.permissions.historico.view && <TabsTrigger value="historico" className="flex-shrink-0">Histórico</TabsTrigger>}
              </TabsList>

              <TabsContent value="lista" className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  {hasPermission('estoque', 'edit') && (
                    <Card className="h-fit shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900">
                      <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
                        <CardTitle className="text-base flex items-center gap-2 text-blue-900 dark:text-white"><PlusCircle className="text-blue-600" size={18} /> Nova Peça</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <form onSubmit={handleAddPart} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Nome da Peça</label>
                            <Input placeholder="Ex: Compressor TM16" value={newName} onChange={(e) => setNewName(e.target.value)} required className="dark:bg-slate-950 dark:border-slate-800" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase">Quantidade Inicial</label>
                            <Input type="number" placeholder="0" value={newQty} onChange={(e) => setNewQty(e.target.value)} required className="dark:bg-slate-950 dark:border-slate-800" />
                          </div>
                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-5 font-bold text-sm">Cadastrar</Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  <Card className={`${hasPermission('estoque', 'edit') ? 'lg:col-span-2' : 'lg:col-span-3'} shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900 overflow-hidden`}>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800 gap-3">
                      <CardTitle className="text-base text-blue-900 dark:text-white">Controle de Peças</CardTitle>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar peça..." className="pl-10 bg-white dark:bg-slate-950 dark:border-slate-800 h-9 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                              <TableHead className="font-bold text-blue-900 dark:text-blue-400 text-xs">Peça</TableHead>
                              <TableHead className="text-center font-bold text-blue-900 dark:text-blue-400 text-xs">Qtd</TableHead>
                              <TableHead className="text-right font-bold text-blue-900 dark:text-blue-400 text-xs">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedParts.map((part) => (
                              <TableRow key={part.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                <TableCell className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{part.name}</TableCell>
                                <TableCell className="text-center">
                                  <span className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-xs font-black ${part.quantity < 5 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {part.quantity}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1 sm:gap-2">
                                    {hasPermission('estoque', 'edit') && (
                                      <>
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-green-200 text-green-600 dark:border-green-900/30 dark:text-green-400" onClick={() => registerMovement(part.id, 'entrada', 1)}><Plus size={14} /></Button>
                                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-200 text-red-600 dark:border-red-900/30 dark:text-red-400" onClick={() => registerMovement(part.id, 'saida', 1)}><Minus size={14} /></Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400" onClick={() => handleEditPart(part)}><Edit2 size={14} /></Button>
                                      </>
                                    )}
                                    {hasPermission('estoque', 'delete') && (
                                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 dark:text-red-400" onClick={() => handleDeletePart(part.id)}><Trash2 size={14} /></Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* Controles de Paginação Estoque */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-blue-50 dark:border-slate-800">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            Pág {currentPage}/{totalPages}
                          </p>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="h-7 w-7 p-0"
                            >
                              <ChevronLeft size={14} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="h-7 w-7 p-0"
                            >
                              <ChevronRight size={14} />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="historico">
                <Card className="shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-50 dark:border-slate-800">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-900 dark:text-white"><History className="text-blue-600" size={18} /> Histórico</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                            <TableHead className="font-bold text-xs">Data</TableHead>
                            <TableHead className="font-bold text-xs">Peça</TableHead>
                            <TableHead className="font-bold text-xs">Tipo</TableHead>
                            <TableHead className="text-center font-bold text-xs">Qtd</TableHead>
                            <TableHead className="font-bold text-xs">Operador</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedMovements.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{m.date.split(',')[0]}</TableCell>
                              <TableCell className="font-medium dark:text-gray-300 text-xs">{m.partName}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  m.type === 'entrada' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                  m.type === 'saida' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {m.type}
                                </span>
                              </TableCell>
                              <TableCell className="text-center font-bold dark:text-gray-300 text-xs">{m.quantity}</TableCell>
                              <TableCell className="text-[10px] text-blue-600 dark:text-blue-400 font-bold truncate max-w-[60px]">{m.user}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Controles de Paginação Histórico */}
                    {totalMovementPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-blue-50 dark:border-slate-800">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Pág {currentMovementPage}/{totalMovementPages}
                        </p>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentMovementPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentMovementPage === 1}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronLeft size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentMovementPage(prev => Math.min(prev + 1, totalMovementPages))}
                            disabled={currentMovementPage === totalMovementPages}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronRight size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* CONTEÚDO ORÇAMENTOS */}
          <TabsContent value="orcamentos" className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-white">Orçamentos</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Buscar..." 
                    className="pl-10 bg-white dark:bg-slate-950 dark:border-slate-800 h-9 text-sm" 
                    value={orderSearchTerm} 
                    onChange={(e) => setOrderSearchTerm(e.target.value)} 
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => exportToExcel(orders, 'orcamentos_lider')} className="dark:border-slate-800 h-9"><TableIcon size={16} /></Button>
              </div>
            </div>

            <Tabs value={activeOrcamentoTab} onValueChange={setActiveOrcamentoTab} className="w-full">
              <TabsList className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 mb-6 w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
                <TabsTrigger value="lista" className="flex-shrink-0">Histórico</TabsTrigger>
                {hasPermission('orcamentos', 'edit') && <TabsTrigger value="novo" className="flex-shrink-0">{orderToEdit ? 'Editando' : 'Novo'}</TabsTrigger>}
              </TabsList>

              <TabsContent value="lista">
                <Card className="shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                            <TableHead className="font-bold text-xs">ID</TableHead>
                            <TableHead className="font-bold text-xs">Cliente</TableHead>
                            <TableHead className="font-bold text-xs">Total</TableHead>
                            <TableHead className="font-bold text-xs">Status</TableHead>
                            <TableHead className="text-right font-bold text-xs">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order) => (
                            <TableRow key={order.id} className="cursor-pointer hover:bg-blue-50/30 dark:hover:bg-slate-800/30" onClick={() => handleViewDetails(order)}>
                              <TableCell className="font-bold text-blue-600 dark:text-blue-400 text-xs">#{order.id.split(' - ')[1] || order.id}</TableCell>
                              <TableCell className="dark:text-gray-300 text-xs truncate max-w-[100px]">{order.clientName}</TableCell>
                              <TableCell className="font-bold dark:text-gray-300 text-xs whitespace-nowrap">R$ {order.total.toFixed(0)}</TableCell>
                              <TableCell>
                                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                                  order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                                  order.status === 'Executado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {order.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-end gap-1">
                                  {order.status === 'Pendente' && hasPermission('orcamentos', 'edit') && (
                                    <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-green-200 text-green-600" onClick={() => handleExecuteOrder(order.id)}><Play size={12} /></Button>
                                  )}
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleViewDetails(order)}><Eye size={12}/></Button>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => generateServiceOrderPDF(order, siteSettings)}><Download size={12}/></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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

          {/* CONTEÚDO CLIENTES */}
          <TabsContent value="clientes" className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-white">Clientes</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar cliente..." 
                  className="pl-10 bg-white dark:bg-slate-950 dark:border-slate-800 h-9 text-sm" 
                  value={customerSearchTerm} 
                  onChange={(e) => setCustomerSearchTerm(e.target.value)} 
                />
              </div>
            </div>

            <Card className="shadow-lg border-blue-50 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 dark:bg-slate-800/30">
                        <TableHead className="font-bold text-xs">Nome</TableHead>
                        <TableHead className="font-bold text-xs">Documento</TableHead>
                        <TableHead className="font-bold text-xs">Telefone</TableHead>
                        <TableHead className="text-right font-bold text-xs">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-bold dark:text-gray-300 text-xs truncate max-w-[120px]">{c.name}</TableCell>
                          <TableCell className="dark:text-gray-400 text-[10px] whitespace-nowrap">{c.document}</TableCell>
                          <TableCell className="dark:text-gray-400 text-[10px] whitespace-nowrap">{c.phone}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {hasPermission('clientes', 'edit') && <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-blue-600" onClick={() => handleEditCustomer(c)}><Edit2 size={12}/></Button>}
                              {hasPermission('clientes', 'delete') && (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => {
                                  if (window.confirm('Excluir este cliente?')) {
                                    const updated = customers.filter(cust => cust.id !== c.id);
                                    setCustomers(updated);
                                    localStorage.setItem('lider_customers', JSON.stringify(updated));
                                  }
                                }}><Trash2 size={12}/></Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTEÚDO ANALYTICS */}
          <TabsContent value="analytics">
            <AnalyticsTab orders={orders} usersCount={usersCount} />
          </TabsContent>

          {/* CONTEÚDO CONFIGURAÇÕES */}
          <TabsContent value="config" className="space-y-6 sm:space-y-8">
            <Tabs defaultValue="site" className="w-full">
              <TabsList className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 mb-6 w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
                <TabsTrigger value="site" className="flex-shrink-0">Site</TabsTrigger>
                <TabsTrigger value="banners" className="flex-shrink-0">Banners</TabsTrigger>
                <TabsTrigger value="regras" className="flex-shrink-0">Regras</TabsTrigger>
                <TabsTrigger value="usuarios" className="flex-shrink-0">Usuários</TabsTrigger>
              </TabsList>

              <TabsContent value="site">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* COLUNA 1: CONTATOS E IDENTIDADE */}
                  <Card className="border-blue-100 dark:border-slate-800 shadow-lg dark:bg-slate-900">
                    <CardHeader className="bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-800">
                      <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white text-base"><Globe className="text-blue-600" size={18} /> Identidade</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <form className="space-y-6">
                        <div className="space-y-4 p-3 sm:p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800">
                          <label className="text-[10px] font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider">Logo da Empresa</label>
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-900 border-2 border-dashed border-blue-200 dark:border-slate-800 rounded-xl flex items-center justify-center overflow-hidden relative group">
                              {siteSettings.logo ? (
                                <img src={siteSettings.logo} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                <ImageIcon className="text-blue-200 dark:text-slate-700 w-6 h-6 sm:w-8 sm:h-8" />
                              )}
                              <label className="absolute inset-0 bg-blue-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <Upload size={18} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              </label>
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Upload da Logo</p>
                              <p className="text-[10px] text-gray-500">PNG ou JPG.</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold dark:text-gray-400 uppercase">Nome da Empresa</label>
                          <Input value={siteSettings.companyName} onChange={(e) => setSiteSettings({...siteSettings, companyName: e.target.value})} className="dark:bg-slate-950 dark:border-slate-800 h-9 text-sm" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1"><label className="text-[10px] font-bold dark:text-gray-400 uppercase">WhatsApp</label><Input value={siteSettings.whatsapp} onChange={(e) => setSiteSettings({...siteSettings, whatsapp: e.target.value})} className="dark:bg-slate-950 dark:border-slate-800 h-9 text-sm" /></div>
                          <div className="space-y-1"><label className="text-[10px] font-bold dark:text-gray-400 uppercase">E-mail</label><Input value={siteSettings.email} onChange={(e) => setSiteSettings({...siteSettings, email: e.target.value})} className="dark:bg-slate-950 dark:border-slate-800 h-9 text-sm" /></div>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-bold dark:text-gray-400 uppercase">Endereço</label><Input value={siteSettings.address} onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})} className="dark:bg-slate-950 dark:border-slate-800 h-9 text-sm" /></div>
                      </form>
                    </CardContent>
                  </Card>

                  {/* COLUNA 2: CONTEÚDO INSTITUCIONAL */}
                  <Card className="border-blue-100 dark:border-slate-800 shadow-lg dark:bg-slate-900">
                    <CardHeader className="bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-800">
                      <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white text-base"><Info className="text-blue-600" size={18} /> Institucional</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold dark:text-gray-400 uppercase">Título da Seção</label>
                        <Input value={siteSettings.aboutTitle} onChange={(e) => setSiteSettings({...siteSettings, aboutTitle: e.target.value})} className="dark:bg-slate-950 dark:border-slate-800 h-9 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold dark:text-gray-400 uppercase">Descrição / História</label>
                        <Textarea 
                          className="min-h-[120px] dark:bg-slate-950 dark:border-slate-800 text-sm" 
                          value={siteSettings.aboutDescription} 
                          onChange={(e) => setSiteSettings({...siteSettings, aboutDescription: e.target.value})} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8 flex justify-center">
                  <Button type="button" onClick={() => {localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings)); showSuccess('Configurações salvas!');}} className="bg-blue-600 w-full sm:w-auto sm:px-12 py-6 text-base font-bold shadow-xl">
                    <Save className="mr-2 h-5 w-5" /> SALVAR ALTERAÇÕES
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="banners">
                <Card className="border-blue-100 dark:border-slate-800 shadow-lg max-w-2xl dark:bg-slate-900">
                  <CardHeader className="bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-800">
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white text-base"><ImageIcon className="text-blue-600" size={18} /> Banners</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <PlusCircle className="w-6 h-6 text-blue-400 mb-1" />
                          <p className="text-xs text-blue-500 font-medium">Subir nova foto</p>
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
                    <div className="space-y-4">
                      {siteSettings.banners.map((banner) => (
                        <div key={banner.id} className="space-y-3 p-3 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Prévia</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => setSiteSettings({...siteSettings, banners: siteSettings.banners.filter(b => b.id !== banner.id)})}><X size={14} /></Button>
                          </div>
                          <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden bg-blue-900">
                            <img src={banner.url} className="w-full h-full object-cover" style={{ transform: `scale(${banner.zoom / 100}) rotate(${banner.rotate}deg)` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="regras">
                <Card className="border-blue-100 dark:border-slate-800 shadow-lg max-w-2xl dark:bg-slate-900">
                  <CardHeader className="bg-blue-50 dark:bg-slate-800/50 border-b border-blue-100 dark:border-slate-800">
                    <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-white text-base"><TrendingDown className="text-blue-600" size={18} /> Regras de Negócio</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                      <div className="flex items-center gap-2">
                        <Percent size={16} className="text-blue-600" />
                        <h3 className="text-xs font-bold text-blue-900 dark:text-blue-400 uppercase tracking-wider">Limites de Desconto</h3>
                      </div>
                      
                      <div className="space-y-6 pt-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 flex justify-between uppercase">
                            Atenção (Amarelo)
                            <span className="text-blue-600">{siteSettings.maxDiscountWarning}%</span>
                          </label>
                          <Slider 
                            value={[siteSettings.maxDiscountWarning]} 
                            min={1} 
                            max={50} 
                            step={1}
                            onValueChange={([v]) => setSiteSettings({...siteSettings, maxDiscountWarning: v})} 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 flex justify-between uppercase">
                            Crítico (Vermelho)
                            <span className="text-red-600">{siteSettings.maxDiscountDanger}%</span>
                          </label>
                          <Slider 
                            value={[siteSettings.maxDiscountDanger]} 
                            min={1} 
                            max={50} 
                            step={1}
                            onValueChange={([v]) => setSiteSettings({...siteSettings, maxDiscountDanger: v})} 
                          />
                        </div>
                      </div>
                    </div>
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
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-white">Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Nome / Empresa</label>
                <Input 
                  value={editingCustomer.name} 
                  onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">CPF / CNPJ</label>
                <Input 
                  value={editingCustomer.document} 
                  onChange={(e) => setEditingCustomer({...editingCustomer, document: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Telefone</label>
                <Input 
                  value={editingCustomer.phone} 
                  onChange={(e) => setEditingCustomer({...editingCustomer, phone: formatPhone(e.target.value)})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                  maxLength={15}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">E-mail</label>
                <Input 
                  value={editingCustomer.email} 
                  onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCustomerOpen(false)} className="dark:border-slate-800">Cancelar</Button>
            <Button className="bg-blue-600" onClick={handleSaveCustomerEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Edição de Peça (Estoque) */}
      <Dialog open={isEditPartOpen} onOpenChange={setIsEditPartOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-blue-900 dark:text-white">Corrigir Peça</DialogTitle>
          </DialogHeader>
          {editingPart && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Nome da Peça</label>
                <Input 
                  value={editingPart.name} 
                  onChange={(e) => setEditingPart({...editingPart, name: e.target.value})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Quantidade Atual</label>
                <Input 
                  type="number"
                  value={editingPart.quantity} 
                  onChange={(e) => setEditingPart({...editingPart, quantity: Number(e.target.value)})} 
                  className="dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPartOpen(false)} className="dark:border-slate-800">Cancelar</Button>
            <Button className="bg-blue-600" onClick={handleSavePartEdit}>Salvar Correção</Button>
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