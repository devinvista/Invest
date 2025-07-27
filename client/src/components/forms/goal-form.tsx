import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const goalFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  targetAmount: z.string().min(1, 'Valor meta é obrigatório'),
  targetDate: z.string().min(1, 'Data meta é obrigatória'),
  monthlyContribution: z.string().min(1, 'Contribuição mensal é obrigatória'),
  description: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  onSuccess?: () => void;
}

export function GoalForm({ onSuccess }: GoalFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      targetAmount: '',
      targetDate: '',
      monthlyContribution: '',
      description: '',
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      const payload = {
        ...data,
        targetAmount: parseFloat(data.targetAmount),
        monthlyContribution: parseFloat(data.monthlyContribution),
      };
      
      const response = await apiRequest('POST', '/api/goals', payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Meta criada com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: GoalFormData) => {
    createGoalMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Meta</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reserva de Emergência" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Meta</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Meta</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="monthlyContribution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contribuição Mensal</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  {...field} 
                />
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
                <Textarea placeholder="Descreva sua meta..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createGoalMutation.isPending}>
            {createGoalMutation.isPending ? 'Salvando...' : 'Criar Meta'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
