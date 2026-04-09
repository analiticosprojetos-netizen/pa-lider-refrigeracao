"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Minus, 
  LogOut, 
  PlusCircle, 
  Search,
  History,
  Snowflake,
  Trash2,
  BarChart3,
  AlertTriangle,
  Settings,
  Save,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showError, showSuccess } from '@/utils/toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Part {
  id: string;
  name: string;
  quantity: number;
  lastMovement: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [parts, setParts] = React.useState<Part[]>([]);
  const [newName, setNewName] = React.useState('');
  const [newQty, setNewQty] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Configurações do Site
  const [siteSettings, setSiteSettings] = React.useState({
    whatsapp: '11999999999',
    instagram: 'https://instagram.com/liderefrigeracao',
    facebook: 'https://facebook.com/liderefrigeracao',
    email: 'contato@liderefrigeracao.com.br',
    address: 'Av. Industrial, 1000 - Setor de Transportes'
  });

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Carregar Estoque
    const savedParts = localStorage.getItem('lider_inventory');
    if (savedParts) {
      setParts(JSON.parse(savedParts));
    } else {
      const initial = [
        { id: '1', name: 'Compressor TM16', quantity: 5, lastMovement: new Date().toLocaleString() },
        { id: '2', name: 'Filtro Secador', quantity: 12, lastMovement: new Date().toLocaleString() },
      ];
      setParts(initial);
      localStorage.setItem('lider_inventory', JSON.stringify(initial));
    }

    // Carregar Configurações
    const savedSettings = localStorage.getItem('lider_site_settings');
    if (savedSettings) {
      setSiteSettings(JSON.parse(savedSettings));
    }
  }, [navigate]);

  const saveToStorage = (updatedParts: Part[]) => {
    setParts(updatedParts);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings));
    showSuccess('Configurações do site salvas com sucesso!');
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newQty) return;
    const newPart: Part = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      quantity: parseInt(newQty),
      lastMovement: new Date().toLocaleString()
    };
    saveToStorage([...parts, newPart]);
    setNewName('');
    setNewQty('');
    showSuccess('Peça adicionada ao estoque!');
  };

  const updateQuantity = (id: string, amount: number) => {
    const updated = parts.map(part => {
      if (part.id === id) {
        const newTotal = part.quantity + amount;
        if (newTotal < 0) {
          showError('Estoque insuficiente!');
          return part;
        }
        return { ...part, quantity: newTotal, lastMovement: new Date().toLocaleString() };
      }
      return part;
    });
    saveToStorage(updated);
  };

  const deletePart = (id: string) => {
    if (window.confirm('Excluir esta peça?')) {
      saveToStorage(parts.filter(p => p.id !== id));
      showSuccess('Peça removida.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const filteredParts = parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const lowStockCount = parts.filter(p => p.quantity < 3).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Snowflake className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-blue-900">Gestão Lider</h1>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-100">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="estoque" className="space-y-8">
          <TabsList className="bg-white border border-blue-100 p-1 h-12">
            <TabsTrigger value="estoque" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">
              <Package className="mr-2 h-4 w-4" /> Estoque
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">
              <Settings className="mr-2 h-4 w-4" /> Configurações do Site
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estoque" className="space-y-8">
            {/* Resumo e Gráfico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="bg-blue-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Package size={32} className="opacity-50" />
                    <span className="text-xs font-bold uppercase opacity-70">Total de Itens</span>
                  </div>
                  <p className="text-4xl font-bold">{parts.length}</p>
                  <div className="mt-6 flex items-center gap-2 bg-blue-500/50 p-3 rounded-xl">
                    <AlertTriangle size={20} className={lowStockCount > 0 ? "text-yellow-300" : "text-blue-200"} />
                    <span className="text-sm">{lowStockCount > 0 ? `${lowStockCount} itens baixos!` : "Estoque OK"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <BarChart3 size={16} /> Níveis de Estoque
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={parts.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} />
                      <YAxis fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                        {parts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.quantity < 3 ? '#ef4444' : '#2563eb'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="h-fit">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PlusCircle className="text-blue-600" /> Nova Peça</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPart} className="space-y-4">
                    <Input placeholder="Nome da Peça" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                    <Input type="number" placeholder="Qtd Inicial" value={newQty} onChange={(e) => setNewQty(e.target.value)} required />
                    <Button type="submit" className="w-full bg-blue-600">Cadastrar</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Controle de Estoque</CardTitle>
                  <div className="relative w-48 sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Peça</TableHead><TableHead className="text-center">Qtd</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredParts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell className="font-medium">{part.name}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${part.quantity < 3 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {part.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(part.id, 1)}><Plus size={16} /></Button>
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(part.id, -1)}><Minus size={16} /></Button>
                              <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600" onClick={() => deletePart(part.id)}><Trash2 size={16} /></Button>
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

          <TabsContent value="config">
            <Card className="max-w-2xl mx-auto border-blue-100 shadow-lg">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Globe className="text-blue-600" /> Informações do Site
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">WhatsApp (Apenas números)</label>
                      <Input 
                        placeholder="Ex: 11999999999" 
                        value={siteSettings.whatsapp}
                        onChange={(e) => setSiteSettings({...siteSettings, whatsapp: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">E-mail de Contato</label>
                      <Input 
                        placeholder="contato@empresa.com" 
                        value={siteSettings.email}
                        onChange={(e) => setSiteSettings({...siteSettings, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Link Instagram</label>
                    <Input 
                      placeholder="https://instagram.com/..." 
                      value={siteSettings.instagram}
                      onChange={(e) => setSiteSettings({...siteSettings, instagram: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Link Facebook</label>
                    <Input 
                      placeholder="https://facebook.com/..." 
                      value={siteSettings.facebook}
                      onChange={(e) => setSiteSettings({...siteSettings, facebook: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Endereço Completo</label>
                    <Input 
                      placeholder="Rua, Número, Bairro, Cidade" 
                      value={siteSettings.address}
                      onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                    <Save className="mr-2" /> Salvar Alterações
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;