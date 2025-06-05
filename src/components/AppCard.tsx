
import type { MockApp } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface AppCardProps {
  app: MockApp;
  isSelected?: boolean;
  onToggleSelection?: (appId: string) => void;
  isFocusModeView?: boolean; // True if in Focus Mode OR Kid's Mode active view
  disabled?: boolean;
  isKidsModeCard?: boolean; // Special styling for kid's mode app cards
}

export function AppCard({ 
  app, 
  isSelected, 
  onToggleSelection, 
  isFocusModeView = false, 
  disabled = false,
  isKidsModeCard = false
}: AppCardProps) {
  const IconComponent = app.icon;

  const handleCardClick = () => {
    if (onToggleSelection && !disabled && !isFocusModeView) { // Selection only if not in focus/kids view and enabled
      onToggleSelection(app.id);
    }
  };

  return (
    <Card 
      className={cn(
        "flex flex-col items-center justify-center text-center transition-all duration-200 ease-in-out",
        isKidsModeCard ? "bg-white/30 hover:bg-white/40 shadow-lg border-none" : "hover:shadow-lg border-border",
        isSelected && !isFocusModeView && !disabled && !isKidsModeCard ? "ring-2 ring-primary border-primary" : "",
        isFocusModeView || disabled ? "cursor-default" : "cursor-pointer",
        disabled && !isKidsModeCard ? "opacity-50 cursor-not-allowed" : "",
        isKidsModeCard && "p-3 rounded-xl" // Specific padding for kid's mode cards
      )}
      onClick={!isFocusModeView && !disabled ? handleCardClick : undefined}
      data-ai-hint={`${app.name.toLowerCase()} icon`}
    >
      <CardHeader className={cn("p-4 pb-2", isKidsModeCard && "p-2 pb-1")}>
        <IconComponent className={cn(
          "w-10 h-10 mx-auto mb-2",
           isKidsModeCard ? "text-yellow-300 w-12 h-12" : (isSelected && !isFocusModeView && !disabled ? "text-primary" : "text-foreground/80"),
          disabled && !isKidsModeCard && "text-muted-foreground"
        )} />
      </CardHeader>
      <CardContent className={cn("p-4 pt-0 flex flex-col items-center w-full", isKidsModeCard && "p-2 pt-0")}>
        <CardTitle className={cn(
            "text-sm font-medium truncate w-full",
            isKidsModeCard ? "text-white text-base" : (disabled && "text-muted-foreground")
        )}>
            {app.name}
        </CardTitle>
        {!isFocusModeView && !app.isSystemApp && onToggleSelection && !disabled && !isKidsModeCard && (
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
         {app.isSystemApp && !isFocusModeView && !disabled && onToggleSelection && !isKidsModeCard && (
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
         {app.isSystemApp && !isFocusModeView && disabled && !isKidsModeCard && (
          <p className="text-xs text-muted-foreground mt-1">(System App)</p>
        )}
      </CardContent>
    </Card>
  );
}
