import { useState, useEffect } from 'react';
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth, setupAuthInterceptor } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Dashboard } from "@/components/dashboard";
import { Budget } from "@/components/budget";
import { Accounts } from "@/components/accounts";
import { Cards } from "@/components/cards";
import { Investments } from "@/components/investments";
import { Goals } from "@/components/goals";
import { Reports } from "@/components/reports";
import { Education } from "@/components/education";
import { Settings } from "@/components/settings";
import { Login } from "@/pages/auth/login";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-16">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath={location}
          onNavigate={navigate}
        />
        <main className="flex-1 lg:ml-0 min-h-screen">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/budget" component={Budget} />
            <Route path="/accounts" component={Accounts} />
            <Route path="/cards" component={Cards} />
            <Route path="/investments" component={Investments} />
            <Route path="/goals" component={Goals} />
            <Route path="/settings" component={Settings} />
            <Route path="/reports" component={Reports} />
            <Route path="/education" component={Education} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
