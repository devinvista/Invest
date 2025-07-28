import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Home,
  Car,
  Utensils,
  ShoppingBag,
  Heart,
  Gamepad2,
  Briefcase,
  GraduationCap,
  Coffee,
  Plane,
  Gift,
  PiggyBank,
  CreditCard,
  Building,
  Smartphone,
  Dumbbell,
  Music,
  Camera,
  Book,
  CircleDollarSign,
  Wallet,
  Target
} from 'lucide-react';

// Icon mapping for categories
const iconMap = {
  // Income icons
  CircleDollarSign,
  Briefcase,
  DollarSign,
  Building,
  GraduationCap,
  Gift,
  
  // Expense icons - Necessities
  Home,
  Car,
  Utensils,
  Heart,
  Smartphone,
  
  // Expense icons - Wants
  ShoppingBag,
  Gamepad2,
  Coffee,
  Plane,
  Music,
  Camera,
  Book,
  Dumbbell,
  
  // Savings icons
  PiggyBank,
  Target,
  Wallet,
  CreditCard
};

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['necessities', 'wants', 'savings', 'income']),
  transactionType: z.enum(['income', 'expense', 'transfer']),
  color: z.string().default('#1565C0'),
  icon: z.string().default('Circle'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export function Categories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedTransactionType, setSelectedTransactionType] = useState<'income' | 'expense' | 'all'>('all');

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      type: 'necessities',
      transactionType: 'expense',
      color: '#1565C0',
      icon: 'Circle',
      description: '',
      isDefault: false,
    },
  });

  const { data: categories = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: CategoryFormData) => {
      const response = await apiRequest('POST', '/api/categories', categoryData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Categoria criada com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: CategoryFormData & { id: string }) => {
      const response = await apiRequest('PUT', `/api/categories/${id}`, categoryData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Categoria atualizada com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await apiRequest('DELETE', `/api/categories/${categoryId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      type: category.type,
      transactionType: category.transactionType,
      color: category.color,
      icon: category.icon,
      description: category.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  // Filter categories by transaction type
  const filteredCategories = categories.filter(category => {
    if (selectedTransactionType === 'all') return true;
    return category.transactionType === selectedTransactionType;
  });

  // Group categories by type
  const groupedCategories = filteredCategories.reduce((acc: Record<string, any[]>, category: any) => {
    const key = category.transactionType === 'income' ? 'income' : category.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(category);
    return acc;
  }, {} as Record<string, any[]>);

  const typeLabels = {
    income: 'Receitas',
    necessities: 'Necessidades',
    wants: 'Desejos',
    savings: 'Poupança',
  };

  const typeColors = {
    income: 'bg-green-100 text-green-800',
    necessities: 'bg-blue-100 text-blue-800',
    wants: 'bg-purple-100 text-purple-800',
    savings: 'bg-orange-100 text-orange-800',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
            <p className="mt-1 text-muted-foreground">Organize suas receitas e despesas</p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <Select value={selectedTransactionType} onValueChange={(value: any) => setSelectedTransactionType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Alimentação" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transactionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Transação</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('transactionType') === 'expense' && (
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria (Método 50/30/20)</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="necessities">Necessidades (50%)</SelectItem>
                                <SelectItem value="wants">Desejos (30%)</SelectItem>
                                <SelectItem value="savings">Poupança (20%)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ícone</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um ícone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(iconMap).map(([iconName, IconComponent]) => (
                                <SelectItem key={iconName} value={iconName}>
                                  <div className="flex items-center space-x-2">
                                    <IconComponent className="w-4 h-4" />
                                    <span>{iconName}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descrição da categoria" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                        {editingCategory ? 'Atualizar' : 'Criar'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories Grid */}
        {Object.entries(groupedCategories).map(([type, typeCategories]: [string, any[]]) => (
          <div key={type}>
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-lg font-semibold text-foreground">{typeLabels[type as keyof typeof typeLabels]}</h2>
              <Badge className={typeColors[type as keyof typeof typeColors]}>
                {typeCategories.length} {typeCategories.length === 1 ? 'categoria' : 'categorias'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {typeCategories.map((category: any) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap] || iconMap.CircleDollarSign;
                
                return (
                  <Card key={category.id} className="financial-card hover:shadow-lg transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            <IconComponent 
                              className="w-5 h-5" 
                              style={{ color: category.color }}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{category.name}</h3>
                            {category.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {category.description}
                              </p>
                            )}
                            {category.transactionType === 'income' ? (
                              <Badge variant="outline" className="mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Receita
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="mt-1">
                                <TrendingDown className="w-3 h-3 mr-1" />
                                Despesa
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          {!category.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <Card className="financial-card">
            <CardContent className="pt-6 text-center">
              <div className="mb-4">
                {selectedTransactionType === 'income' ? (
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                ) : selectedTransactionType === 'expense' ? (
                  <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto" />
                ) : (
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto" />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground mb-6">
                {selectedTransactionType === 'all' 
                  ? 'Crie sua primeira categoria para organizar suas transações'
                  : `Nenhuma categoria de ${selectedTransactionType === 'income' ? 'receita' : 'despesa'} encontrada`
                }
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Categoria
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}