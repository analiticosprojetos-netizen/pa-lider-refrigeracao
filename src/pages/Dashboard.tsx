"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Minus, LogOut, PlusCircle, Search, Snowflake, Trash2, 
  BarChart3, AlertTriangle, Settings, Save, Globe, Image as ImageIcon,
  History, User, ArrowUpCircle, ArrowDownCircle, X, Clock, FileText, Mail, Download, Table as TableIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from '@/utils/toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import ServiceOrderForm from '@/components/ServiceOrderForm';
import { generateServiceOrderPDF, exportToExcel } from '@/utils/exportUtils';

interface Part {
  id: string;
  name: string;
  quantity: number;
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [parts, setParts] = React.useState<Part[]>([]);
  const [movements, setMovements] = React.useState<Movement[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [currentUser, setCurrentUser] = React.useState('Administrador');
  const [newName, setNewName] = React.useState('');
  const [newQty, setNewQty] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [siteSettings, setSiteSettings] = React.useState({
    whatsapp: '11999999999',
    instagram: 'https://instagram.com/liderefrigeracao',
    facebook: 'https://facebook.com/liderefrigeracao',
    email: 'contato@liderefrigeracao.com.br',
    address: 'Av. Industrial, 1000 - Setor de Transportes',
    banners: [] as Banner[],
    carouselDelay: 6
  });

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const savedParts = localStorage.getItem('lider_inventory');
    if (savedParts) setParts(JSON.parse(savedParts));

    const savedMovements = localStorage.getItem('lider_movements');
    if (savedMovements) setMovements(JSON.parse(savedMovements));

    const savedSettings = localStorage.getItem('lider_site_settings');
    if (savedSettings) setSiteSettings(JSON.parse(savedSettings));

    const savedOrders = localStorage.getItem('lider_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, [navigate]);

  const saveInventory = (updatedParts: Part[], updatedMovements: Movement[]) => {
    setParts(updatedParts);
    setMovements(updatedMovements);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    localStorage.setItem('lider_movements', JSON.stringify(updatedMovements));
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
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
      user: currentUser,
      date: new Date().toLocaleString()
    };

    saveInventory([...parts, newPart], [newMovement, ...movements]);
    setNewName('');
    setNewQty('');
    showSuccess('Peça cadastrada com sucesso!');
  };

  const registerMovement = (partId: string, type: 'entrada' | 'saida', amount: number) => {
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
          user: currentUser,
          date: new Date().toLocaleString()
        };

        setMovements(prev => [newMovement, ...prev]);
        localStorage.setItem('lider_movements', JSON.stringify([newMovement, ...movements]));
        
        return { ...part, quantity: newTotal };
      }
      return part;
    });

    setParts(updatedParts);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
    showSuccess(`${type === 'entrada' ? 'Entrada' : 'Saída'} registrada!`);
  };

  const handleSaveOrder = (order: any) => {
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('lider_orders', JSON.stringify(updatedOrders));
  };

  const handleSendEmail = (order: any) => {
    showSuccess(`Orçamento #${order.id} enviado para ${order.email}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const filteredParts = parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const lowStockCount = parts.filter(p => p.quantity < 5).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg"><Snowflake className="h-5 w-5 text-white" /></div>
            <h1 className="text-xl font-bold text-blue-900 hidden md:block">Gestão Lider</h1>
            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block" />
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
              <User size={14} className="text-blue-600" />
              <input 
                className="bg-transparent text-xs font-bold text-blue-900 outline-none w-32"
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                placeholder="Nome do Operador"
              />
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
            <TabsTrigger value="estoque" className="px-6">Estoque</TabsTrigger>
            <TabsTrigger value="orcamentos" className="px-6">Orçamentos / OS</TabsTrigger>
            <TabsTrigger value="historico" className="px-6">Histórico Estoque</TabsTrigger>
            <TabsTrigger value="config" className="px-6">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="estoque" className="space-y-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

              <Card className="lg:col-span-2 shadow-lg border-blue-50">
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
                        <TableHead className="text-right font-bold text-blue-900">Movimentar</TableHead>
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
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50" onClick={() => registerMovement(part.id, 'entrada', 1)}><Plus size={16} /></Button>
                              <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => registerMovement(part.id, 'saida', 1)}><Minus size={16} /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orcamentos" className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">Gestão de Orçamentos</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportToExcel(orders, 'orcamentos_lider')}><TableIcon className="mr-2 h-4 w-4" /> Exportar Excel</Button>
              </div>
            </div>

            <Tabs defaultValue="lista" className="w-full">
              <TabsList className="bg-white border border-blue-100 mb-6">
                <TabsTrigger value="lista">Histórico de Orçamentos</TabsTrigger>
                <TabsTrigger value="novo">Novo Orçamento</TabsTrigger>
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
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-bold text-blue-600">#{order.id}</TableCell>
                            <TableCell>{order.clientName}</TableCell>
                            <TableCell>{order.plate} - {order.vehicleModel}</TableCell>
                            <TableCell className="font-bold">R$ {order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                {order.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => generateServiceOrderPDF(order)} title="Baixar PDF"><Download size={16}/></Button>
                                <Button size="sm" variant="ghost" onClick={() => handleSendEmail(order)} title="Enviar por Email"><Mail size={16}/></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {orders.length === 0 && (
                          <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-400 italic">Nenhum orçamento cadastrado.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="novo">
                <ServiceOrderForm onSave={handleSaveOrder} />
              </TabsContent>
            </Tabs>
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

          <TabsContent value="config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900"><Globe className="text-blue-600" /> Contatos e Redes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-xs font-bold">WhatsApp</label><Input value={siteSettings.whatsapp} onChange={(e) => setSiteSettings({...siteSettings, whatsapp: e.target.value})} /></div>
                      <div className="space-y-1"><label className="text-xs font-bold">E-mail</label><Input value={siteSettings.email} onChange={(e) => setSiteSettings({...siteSettings, email: e.target.value})} /></div>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">Instagram</label><Input value={siteSettings.instagram} onChange={(e) => setSiteSettings({...siteSettings, instagram: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">Facebook</label><Input value={siteSettings.facebook} onChange={(e) => setSiteSettings({...siteSettings, facebook: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">Endereço</label><Input value={siteSettings.address} onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})} /></div>
                    <Button type="button" onClick={() => {localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings)); showSuccess('Salvo!');}} className="w-full bg-blue-600 mt-4"><Save className="mr-2 h-4 w-4" /> Salvar Configurações</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-lg">
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
                          <div className="absolute inset-0 flex items-center px-4">
                            <div className="scale-[0.3] origin-left">
                              <h1 className="text-6xl font-black text-white italic leading-none">LÍDER</h1>
                              <h2 className="text-4xl font-black text-white italic leading-none">REFRIGERAÇÃO</h2>
                            </div>
                          </div>
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
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;