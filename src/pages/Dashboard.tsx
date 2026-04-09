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
  Snowflake
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
import { showError, showSuccess } from '@/utils/toast';

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

  // Carregar dados do localStorage
  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const savedParts = localStorage.getItem('lider_inventory');
    if (savedParts) {
      setParts(JSON.parse(savedParts));
    } else {
      // Dados iniciais de exemplo
      const initial = [
        { id: '1', name: 'Compressor TM16', quantity: 5, lastMovement: new Date().toLocaleString() },
        { id: '2', name: 'Filtro Secador', quantity: 12, lastMovement: new Date().toLocaleString() },
        { id: '3', name: 'Válvula Expansão', quantity: 8, lastMovement: new Date().toLocaleString() },
      ];
      setParts(initial);
      localStorage.setItem('lider_inventory', JSON.stringify(initial));
    }
  }, [navigate]);

  // Salvar sempre que mudar
  const saveToStorage = (updatedParts: Part[]) => {
    setParts(updatedParts);
    localStorage.setItem('lider_inventory', JSON.stringify(updatedParts));
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
          showError('Estoque insuficiente para esta saída!');
          return part;
        }
        return { 
          ...part, 
          quantity: newTotal, 
          lastMovement: new Date().toLocaleString() 
        };
      }
      return part;
    });
    saveToStorage(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Dashboard */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Snowflake className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-blue-900 hidden sm:block">Painel de Gestão</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-100 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulário de Cadastro */}
          <Card className="lg:col-span-1 border-blue-100 shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PlusCircle className="text-blue-600" /> Nova Peça
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPart} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome da Peça</label>
                  <Input 
                    placeholder="Ex: Correia Thermo King" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantidade Inicial</label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Cadastrar no Estoque
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tabela de Estoque */}
          <Card className="lg:col-span-2 border-blue-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="text-blue-600" /> Controle de Estoque
              </CardTitle>
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar peça..." 
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-bold">Peça</TableHead>
                      <TableHead className="text-center font-bold">Qtd</TableHead>
                      <TableHead className="hidden md:table-cell font-bold">Última Movimentação</TableHead>
                      <TableHead className="text-right font-bold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          Nenhuma peça encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredParts.map((part) => (
                        <TableRow key={part.id} className="hover:bg-blue-50/30 transition-colors">
                          <TableCell className="font-medium text-blue-900">{part.name}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${part.quantity < 3 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {part.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <History size={12} /> {part.lastMovement}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0 border-green-200 text-green-600 hover:bg-green-50"
                                onClick={() => updateQuantity(part.id, 1)}
                                title="Entrada"
                              >
                                <Plus size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 w-8 p-0 border-orange-200 text-orange-600 hover:bg-orange-50"
                                onClick={() => updateQuantity(part.id, -1)}
                                title="Saída"
                              >
                                <Minus size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;