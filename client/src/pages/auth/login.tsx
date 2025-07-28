import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ChartLine, Eye, EyeOff, Loader2 } from 'lucide-react';

// Utility functions for phone formatting
const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numeric = value.replace(/\D/g, '');
  
  // Apply Brazilian phone format
  if (numeric.length <= 2) {
    return `(${numeric}`;
  } else if (numeric.length <= 7) {
    return `(${numeric.slice(0, 2)}) ${numeric.slice(2)}`;
  } else if (numeric.length <= 11) {
    return `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7)}`;
  } else {
    return `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7, 11)}`;
  }
};

const isPhoneNumber = (value: string): boolean => {
  const numeric = value.replace(/\D/g, '');
  return numeric.length >= 10 && numeric.length <= 11;
};

const formatLoginInput = (value: string): string => {
  // If it looks like a phone number, format it
  if (/^\d/.test(value) && value.replace(/\D/g, '').length >= 2) {
    return formatPhoneNumber(value);
  }
  return value;
};

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário, email ou telefone é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string()
    .min(1, 'Telefone é obrigatório')
    .refine((phone) => {
      const numeric = phone.replace(/\D/g, '');
      return numeric.length >= 10 && numeric.length <= 11;
    }, 'Telefone deve ter entre 10 e 11 dígitos'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function Login() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Clean phone number if it's a phone number before sending to backend
      const cleanIdentifier = isPhoneNumber(data.username) 
        ? data.username.replace(/\D/g, '') 
        : data.username;
      await login(cleanIdentifier, data.password);
      toast({
        title: 'Sucesso',
        description: 'Login realizado com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: error.message || 'Credenciais inválidas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Clean phone number before sending to backend
      const cleanPhone = data.phone.replace(/\D/g, '');
      await register(data.username, data.password, data.name, data.email, cleanPhone);
      toast({
        title: 'Sucesso',
        description: 'Conta criada com sucesso!',
      });
      setActiveTab('login');
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Erro ao criar conta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChartLine className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-foreground">OrçaFácil</h1>
          </div>
          <p className="text-muted-foreground">
            Gestão financeira inteligente e descomplicada
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">
              {activeTab === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' 
                ? 'Digite suas credenciais para acessar o sistema'
                : 'Preencha os dados para criar sua conta'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário, Email ou Telefone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite seu usuário, email ou telefone"
                              autoComplete="username"
                              {...field}
                              onChange={(e) => {
                                const formatted = formatLoginInput(e.target.value);
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite sua senha"
                                autoComplete="current-password"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite seu nome completo"
                              autoComplete="name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="Digite seu email"
                              autoComplete="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel"
                              placeholder="(11) 99999-9999"
                              autoComplete="tel"
                              {...field}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de usuário</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Escolha um nome de usuário"
                              autoComplete="username"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Crie uma senha"
                                autoComplete="new-password"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar senha</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirme sua senha"
                                autoComplete="new-password"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar conta'
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2024 OrçaFácil. Todos os direitos reservados.</p>
          <p className="mt-1">
            Gerencie suas finanças com inteligência e simplicidade.
          </p>
        </div>
      </div>
    </div>
  );
}
