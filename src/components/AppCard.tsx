import type { MockApp } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface AppCardProps {
  app: MockApp;
  isSelected?: boolean;
  onToggleSelection?: (appId: string) => void;
  isFocusModeView?: boolean;
}

export function AppCard({ app, isSelected, onToggleSelection, isFocusModeView = false }: AppCardProps) {
  const IconComponent = app.icon;

  const handleCardClick = () => {
    if (onToggleSelection && !app.isSystemApp) {
      onToggleSelection(app.id);
    }
  };

  return (
    <Card 
      className={cn(
        "flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out hover:shadow-lg",
        isSelected && !isFocusModeView ? "ring-2 ring-primary border-primary" : "border-border",
        isFocusModeView ? "cursor-default" : "cursor-pointer",
        app.isSystemApp && !isFocusModeView ? "opacity-70 cursor-not-allowed" : ""
      )}
      onClick={!isFocusModeView ? handleCardClick : undefined}
      data-ai-hint={`${app.name.toLowerCase()} icon`}
    >
      <CardHeader className="p-4 pb-2">
        <IconComponent className={cn(
          "w-10 h-10 mx-auto mb-2",
          isSelected && !isFocusModeView ? "text-primary" : "text-foreground/80"
        )} />
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col items-center w-full">
        <CardTitle className="text-sm font-medium truncate w-full">{app.name}</CardTitle>
        {!isFocusModeView && !app.isSystemApp && onToggleSelection && (
          <div className="mt-3">
            <Checkbox
              id={`app-${app.id}`}
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(app.id)}
              aria-label={`Select ${app.name}`}
            />
          </div>
        )}
         {app.isSystemApp && !isFocusModeView && (
          <p className="text-xs text-muted-foreground mt-1">(System App)</p>
        )}
      </CardContent>
    </Card>
  );
}
