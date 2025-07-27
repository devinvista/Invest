import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/financial-utils';
import { LucideIcon } from 'lucide-react';

interface FinancialCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function FinancialCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary",
  className
}: FinancialCardProps) {
  const formattedValue = typeof value === 'number' ? formatCurrency(value) : value;

  return (
    <Card className={cn("financial-card", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="metric-label">{title}</CardTitle>
            <p className="metric-value">{formattedValue}</p>
            {change && (
              <p className={cn(
                "metric-change mt-1",
                change.positive !== false ? "positive" : "negative"
              )}>
                <span className="mr-1">
                  {change.positive !== false ? '↗' : '↘'}
                </span>
                {typeof change.value === 'number' ? `${change.value > 0 ? '+' : ''}${change.value.toFixed(1)}%` : change.value} {change.label}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-lg bg-opacity-10", iconColor.replace('text-', 'bg-'))}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
