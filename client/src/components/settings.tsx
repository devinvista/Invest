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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings as SettingsIcon,
  User,
  Tag,
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
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
  CircleDollarSign, Briefcase, DollarSign: CircleDollarSign, Building, GraduationCap, Gift,
  Home, Car, Utensils, Heart, Smartphone, ShoppingBag, Gamepad2, Coffee, Plane, Music,
  Camera, Book, Dumbbell, PiggyBank, Target, Wallet, CreditCard
};

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['necessities', 'wants', 'savings']),
  transactionType: z.enum(['income', 'expense', 'transfer']),
  color: z.string().default('#1565C0'),
  icon: z.string().default('CircleDollarSign'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

const profileFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;
type ProfileFormData = z.infer<typeof profileFormSchema>;

export function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedTransactionType, setSelectedTransactionType] = useState<'income' | 'expense' | 'all'>('all');

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      type: 'necessities',
      transactionType: 'expense',
      color: '#1565C0',
      icon: 'CircleDollarSign',
      description: '',
      isDefault: false,
    },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
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
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
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
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
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

  const handleCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ ...data, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      type: category.type,
      transactionType: category.transactionType,
      color: category.color,
      icon: category.icon,
      description: category.description || '',
      isDefault: category.isDefault,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    categoryForm.reset();
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
    income: '💰 Receitas',
    necessities: '🏠 Necessidades (50%)',
    wants: '🎯 Desejos (30%)',
    savings: '💼 Poupança (20%)',
  };

  const typeColors = {
    income: 'bg-green-100 text-green-800',
    necessities: 'bg-blue-100 text-blue-800',
    wants: 'bg-purple-100 text-purple-800',
    savings: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Categorias</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...profileForm}>
                  <form className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="flex justify-end">
                      <Button type="submit">
                        Salvar Alterações
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="financial-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciar Categorias</CardTitle>
                  <div className="flex items-center space-x-4">
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

                    <Dialog open={isCategoryDialogOpen} onOpenChange={handleCloseCategoryDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setIsCategoryDialogOpen(true)}>
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
                        
                        <Form {...categoryForm}>
                          <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
                            <FormField
                              control={categoryForm.control}
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
                              control={categoryForm.control}
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

                            {categoryForm.watch('transactionType') === 'expense' && (
                              <FormField
                                control={categoryForm.control}
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

                            {categoryForm.watch('transactionType') === 'income' && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-800">
                                  <strong>Receitas:</strong> Todas as fontes de renda são agrupadas como receitas.
                                </p>
                              </div>
                            )}

                            <FormField
                              control={categoryForm.control}
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
                              control={categoryForm.control}
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
                              control={categoryForm.control}
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
                              <Button type="button" variant="outline" onClick={handleCloseCategoryDialog}>
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
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedCategories).map(([type, typeCategories]: [string, any[]]) => (
                      <div key={type}>
                        <div className="flex items-center space-x-2 mb-4">
                          <h3 className="text-lg font-semibold text-foreground">{typeLabels[type as keyof typeof typeLabels]}</h3>
                          <Badge className={typeColors[type as keyof typeof typeColors]}>
                            {typeCategories.length} {typeCategories.length === 1 ? 'categoria' : 'categorias'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {typeCategories.map((category: any) => {
                            const IconComponent = iconMap[category.icon as keyof typeof iconMap] || CircleDollarSign;
                            
                            return (
                              <Card key={category.id} className="border hover:shadow-md transition-shadow">
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
                                        <h4 className="font-medium text-foreground">{category.name}</h4>
                                        {category.description && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {category.description}
                                          </p>
                                        )}
                                        <div className="flex items-center space-x-2 mt-1">
                                          {category.transactionType === 'income' ? (
                                            <Badge variant="outline" className="text-xs">
                                              <TrendingUp className="w-3 h-3 mr-1" />
                                              Receita
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="text-xs">
                                              <TrendingDown className="w-3 h-3 mr-1" />
                                              Despesa
                                            </Badge>
                                          )}
                                          {category.isDefault && (
                                            <Badge variant="secondary" className="text-xs">
                                              Padrão
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditCategory(category)}
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </Button>
                                      {!category.isDefault && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteCategory(category.id)}
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
                      <div className="text-center py-8">
                        <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
                        <p className="text-muted-foreground mb-6">
                          {selectedTransactionType === 'all' 
                            ? 'Crie sua primeira categoria para organizar suas transações'
                            : `Nenhuma categoria de ${selectedTransactionType === 'income' ? 'receita' : 'despesa'} encontrada`
                          }
                        </p>
                        <Button onClick={() => setIsCategoryDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar Categoria
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}