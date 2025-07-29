import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

interface Asset {
  id: string;
  symbol: string;
  type: string;
}

interface QuoteUpdaterProps {
  assets: Asset[];
}

export function QuoteUpdater({ assets }: QuoteUpdaterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateQuotes = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/assets/quotes/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          assets: assets.map(asset => ({
            symbol: asset.symbol,
            type: asset.type
          }))
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao atualizar cotações");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const updatedCount = Object.values(data).filter(quote => quote !== null).length;
      toast({
        title: "Cotações atualizadas",
        description: `${updatedCount} de ${assets.length} cotações foram atualizadas com sucesso.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/assets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar cotações",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  if (assets.length === 0) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => updateQuotes.mutate()}
      disabled={updateQuotes.isPending}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${updateQuotes.isPending ? 'animate-spin' : ''}`} />
      {updateQuotes.isPending ? 'Atualizando...' : 'Atualizar Cotações'}
    </Button>
  );
}