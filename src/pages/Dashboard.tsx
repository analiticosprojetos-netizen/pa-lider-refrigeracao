"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Plus, Minus, LogOut, PlusCircle, Search, Snowflake, Trash2, 
  BarChart3, AlertTriangle, Settings, Save, Globe, Image as ImageIcon,
  Maximize, RotateCw, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showError, showSuccess } from '@/utils/toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface Part {
  id: string;
  name: string;
  quantity: number;
  lastMovement: string;
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
  const [newName, setNewName] = React.useState('');
  const [newQty, setNewQty] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const [siteSettings, setSiteSettings] = React.useState({
    whatsapp: '11999999999',
    instagram: 'https://instagram.com/liderefrigeracao',
    facebook: 'https://facebook.com/liderefrigeracao',
    email: 'contato@liderefrigeracao.com.br',
    address: 'Av. Industrial, 1000 - Setor de Transportes',
    banners: [] as Banner[]
  });

  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const savedParts = localStorage.getItem('lider_inventory');
    if (savedParts) setParts(JSON.parse(savedParts));

    const savedSettings = localStorage.getItem('lider_site_settings');
    if (savedSettings) setSiteSettings(JSON.parse(savedSettings));
  }, [navigate]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lider_site_settings', JSON.stringify(siteSettings));
    showSuccess('Configurações do site salvas com sucesso!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (siteSettings.banners.length >= 5) {
      showError('Limite máximo de 5 banners atingido.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newBanner: Banner = {
        id: Math.random().toString(36).substr(2, 9),
        url: reader.result as string,
        zoom: 100,
        rotate: 0
      };
      setSiteSettings({
        ...siteSettings,
        banners: [...siteSettings.banners, newBanner]
      });
    };
    reader.readAsDataURL(file);
  };

  const removeBanner = (id: string) => {
    setSiteSettings({
      ...siteSettings,
      banners: siteSettings.banners.filter(b => b.id !== id)
    });
  };

  const updateBannerAdjust = (id: string, field: 'zoom' | 'rotate', value: number) => {
    setSiteSettings({
      ...siteSettings,
      banners: siteSettings.banners.map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const filteredParts = parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg"><Snowflake className="h-5 w-5 text-white" /></div>
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
            <TabsTrigger value="estoque" className="px-6">Estoque</TabsTrigger>
            <TabsTrigger value="config" className="px-6">Configurações do Site</TabsTrigger>
          </TabsList>

          <TabsContent value="estoque">
            {/* ... (Conteúdo de estoque mantido igual) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-3">
                <CardHeader><CardTitle>Controle de Estoque</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <Input placeholder="Buscar peça..." className="max-w-xs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Peça</TableHead><TableHead>Qtd</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {filteredParts.map(p => (
                        <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.quantity}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações de Contato */}
              <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900"><Globe className="text-blue-600" /> Contatos e Redes</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-xs font-bold">WhatsApp</label><Input value={siteSettings.whatsapp} onChange={(e) => setSiteSettings({...siteSettings, whatsapp: e.target.value})} /></div>
                      <div className="space-y-1"><label className="text-xs font-bold">E-mail</label><Input value={siteSettings.email} onChange={(e) => setSiteSettings({...siteSettings, email: e.target.value})} /></div>
                    </div>
                    <div className="space-y-1"><label className="text-xs font-bold">Instagram</label><Input value={siteSettings.instagram} onChange={(e) => setSiteSettings({...siteSettings, instagram: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">Facebook</label><Input value={siteSettings.facebook} onChange={(e) => setSiteSettings({...siteSettings, facebook: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-xs font-bold">Endereço</label><Input value={siteSettings.address} onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})} /></div>
                    <Button type="submit" className="w-full bg-blue-600"><Save className="mr-2 h-4 w-4" /> Salvar Contatos</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Gestão de Banners */}
              <Card className="border-blue-100 shadow-lg">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-900"><ImageIcon className="text-blue-600" /> Banners do Carrossel (Máx 5)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <PlusCircle className="w-8 h-8 text-blue-400 mb-2" />
                        <p className="text-sm text-blue-500 font-medium">Clique para subir nova foto</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>

                  <div className="space-y-4">
                    {siteSettings.banners.map((banner, index) => (
                      <div key={banner.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          <img 
                            src={banner.url} 
                            alt={`Banner ${index + 1}`} 
                            className="w-full h-full object-cover"
                            style={{ transform: `scale(${banner.zoom / 100}) rotate(${banner.rotate}deg)` }}
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase">Banner {index + 1}</span>
                            <Button variant="ghost" size="sm" className="text-red-500 h-6 w-6 p-0" onClick={() => removeBanner(banner.id)}><X size={14} /></Button>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-500"><span>ZOOM</span><span>{banner.zoom}%</span></div>
                            <Slider value={[banner.zoom]} min={50} max={200} step={1} onValueChange={([v]) => updateBannerAdjust(banner.id, 'zoom', v)} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-gray-500"><span>ROTAÇÃO</span><span>{banner.rotate}°</span></div>
                            <Slider value={[banner.rotate]} min={-180} max={180} step={1} onValueChange={([v]) => updateBannerAdjust(banner.id, 'rotate', v)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveSettings} className="w-full bg-blue-600"><Save className="mr-2 h-4 w-4" /> Salvar Banners</Button>
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