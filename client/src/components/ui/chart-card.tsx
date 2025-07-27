import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  showPeriodSelect?: boolean;
  periods?: Array<{ value: string; label: string }>;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

export function ChartCard({
  title,
  children,
  className,
  showPeriodSelect = false,
  periods = [
    { value: 'month', label: 'Este mês' },
    { value: '3month', label: 'Últimos 3 meses' },
    { value: '6month', label: 'Últimos 6 meses' },
    { value: 'year', label: 'Este ano' },
  ],
  selectedPeriod = 'month',
  onPeriodChange
}: ChartCardProps) {
  return (
    <Card className={cn("financial-card", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {showPeriodSelect && (
            <Select value={selectedPeriod} onValueChange={onPeriodChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map(period => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
