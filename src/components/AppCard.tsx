import type { MockApp } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface AppCardProps {
  app: MockApp;
  isSelected?: boolean;
  onToggleSelection?: (appId: string) => void;
  isFocusModeView?: boolean;
  disabled?: boolean;
}

export function AppCard({ app, isSelected, onToggleSelection, isFocusModeView = false, disabled = false }: AppCardProps) {
  const IconComponent = app.icon;

  const handleCardClick = () => {
    if (onToggleSelection && !disabled) {
      onToggleSelection(app.id);
    }
  };

  return (
    <Card 
      className={cn(
        "flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out",
        !disabled && "hover:shadow-lg",
        isSelected && !isFocusModeView && !disabled ? "ring-2 ring-primary border-primary" : "border-border",
        isFocusModeView || disabled ? "cursor-default" : "cursor-pointer",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
      onClick={!isFocusModeView && !disabled ? handleCardClick : undefined}
      data-ai-hint={`${app.name.toLowerCase()} icon`}
    >
      <CardHeader className="p-4 pb-2">
        <IconComponent className={cn(
          "w-10 h-10 mx-auto mb-2",
          isSelected && !isFocusModeView && !disabled ? "text-primary" : "text-foreground/80",
          disabled && "text-muted-foreground"
        )} />
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col items-center w-full">
        <CardTitle className={cn("text-sm font-medium truncate w-full", disabled && "text-muted-foreground")}>{app.name}</CardTitle>
        {!isFocusModeView && !app.isSystemApp && onToggleSelection && !disabled && (
          <div className="mt-3">
            <Checkbox
              id={`app-${app.id}-${Math.random()}`} // Ensure unique ID for dialogs
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(app.id)}
              aria-label={`Select ${app.name}`}
              disabled={disabled}
            />
          </div>
        )}
         {app.isSystemApp && !isFocusModeView && !disabled && onToggleSelection && (
           <div className="mt-3">
            <Checkbox
              id={`app-${app.id}-${Math.random()}`}
              checked={isSelected}
              onCheckedChange={() => onToggleSelection(app.id)}
              aria-label={`Select ${app.name}`}
              disabled={disabled}
            />
          </div>
        )}
         {app.isSystemApp && !isFocusModeView && disabled && (
          <p className="text-xs text-muted-foreground mt-1">(System App)</p>
        )}
      </CardContent>
    </Card>
  );
}
