import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ModernCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  gradient?: boolean;
  className?: string;
  children?: ReactNode;
}

export function ModernCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  trend,
  gradient = false,
  className,
  children,
}: ModernCardProps) {
  return (
    <Card className={cn(
      'responsive-card pharos-card group cursor-pointer overflow-hidden relative transition-all duration-200 hover:shadow-lg',
      gradient && 'pharos-gradient text-white border-0',
      className
    )}>
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-chart-2 opacity-90" />
      )}
      
      <CardHeader className="relative pb-2 sm:pb-3 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            'text-xs sm:text-sm font-medium truncate',
            gradient ? 'text-white/90' : 'text-muted-foreground'
          )}>
            {title}
          </CardTitle>
          {Icon && (
            <div className={cn(
              'p-1 sm:p-1.5 lg:p-2 rounded-lg transition-colors shrink-0 ml-2',
              gradient ? 'bg-white/10' : 'bg-accent',
              iconColor
            )}>
              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative pt-0 p-3 sm:p-4 lg:p-6">
        <div className="space-y-1 sm:space-y-2 lg:space-y-3">
          <div className={cn(
            'text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold truncate',
            gradient ? 'text-white' : 'text-foreground'
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {description && (
            <p className={cn(
              'text-xs sm:text-sm',
              gradient ? 'text-white/75' : 'text-muted-foreground'
            )}>
              {description}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center space-x-1">
              <span className={cn(
                'text-xs sm:text-sm font-medium',
                gradient ? 'text-white' : trend.positive ? 'text-success' : 'text-expense'
              )}>
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className={cn(
                'text-xs',
                gradient ? 'text-white/75' : 'text-muted-foreground'
              )}>
                {trend.label}
              </span>
            </div>
          )}
          
          {children}
        </div>
      </CardContent>
    </Card>
  );
}