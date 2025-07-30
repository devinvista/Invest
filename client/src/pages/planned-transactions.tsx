import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Repeat, CalendarClock } from "lucide-react";
import PendingTransactions from "@/components/pending-transactions";
import RecurrenceForm from "@/components/recurrence-form";
import RecurrencesList from "@/components/recurrences-list";

export default function PlannedTransactionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-50 to-blue-50/30 dark:from-background dark:via-slate-900 dark:to-blue-950/30">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Lançamentos Planejados</h1>
            <p className="text-muted-foreground">
              Gerencie transações pendentes e configure recorrências automáticas
            </p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes
            </TabsTrigger>
            <TabsTrigger value="recurrences" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Recorrências
            </TabsTrigger>
            <TabsTrigger value="new-recurrence" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Nova Recorrência
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Transações Pendentes
                </CardTitle>
                <CardDescription>
                  Confirme ou gerencie lançamentos que estão aguardando sua aprovação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PendingTransactions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recurrences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-5 w-5" />
                  Suas Recorrências
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie todas as suas transações recorrentes configuradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecurrencesList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new-recurrence" className="space-y-6">
            <RecurrenceForm 
              onSuccess={() => {
                // Switch to recurrences tab after successful creation
                const tab = document.querySelector('[value="recurrences"]') as HTMLElement;
                tab?.click();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}