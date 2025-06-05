
'use client';
import Link from 'next/link';
import { Zap, Palette, Smile, Timer, Users, BarChart3, Info, Brain, Settings2, SlidersHorizontal, Lightbulb, ShieldQuestion, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils'; 

interface HeaderProps {
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  isGrayscale: boolean;
  onToggleGrayscale: () => void;
  
  onOpenKidsModeManager: () => void;
  onOpenTimerManager: () => void;
  onOpenProfilesManager: () => void;
  onOpenInfoDialog: () => void;

  isTimerActive: boolean;
  focusTimeRemaining: number | null;
  isKidsModeActive: boolean; 
  activeProfileName?: string | null;
}

export function Header({
  isFocusMode,
  onToggleFocusMode,
  isGrayscale,
  onToggleGrayscale,
  onOpenKidsModeManager,
  onOpenTimerManager,
  onOpenProfilesManager,
  onOpenInfoDialog,
  isTimerActive,
  focusTimeRemaining,
  isKidsModeActive,
  activeProfileName,
}: HeaderProps) {

  const commonButtonClass = "h-10 w-10 md:h-12 md:w-12 data-[active=true]:bg-primary/10 data-[active=true]:text-primary";
  const commonIconClass = "h-5 w-5 md:h-6 md:w-6";

  let focusModeTitle = isFocusMode ? "Focus Mode Active" : "Activate Focus Mode";
  if (isFocusMode && activeProfileName) {
    focusModeTitle += ` (Profile: ${activeProfileName})`;
  } else if (isFocusMode && isTimerActive) {
    focusModeTitle += ` (Timer Active)`;
  }


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm print:hidden">
      <div className="container mx-auto flex h-16 items-center justify-between px-2 sm:px-4 max-w-7xl">
        <Link href="/" className="flex items-center gap-2 text-primary" aria-label="FocusFlow Home">
          <Zap className="h-7 w-7 sm:h-8 sm:w-8" />
          <span className="hidden sm:block text-xl sm:text-2xl font-bold font-headline">FocusFlow</span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFocusMode}
            disabled={isKidsModeActive}
            aria-label={focusModeTitle}
            data-active={isFocusMode}
            className={cn(commonButtonClass, isFocusMode && "ring-1 ring-primary")}
            title={focusModeTitle}
          >
            {isFocusMode ? <PowerOff className={commonIconClass} /> : <Power className={commonIconClass} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleGrayscale}
            disabled={isKidsModeActive}
            aria-label={isGrayscale ? "Deactivate Grayscale Mode" : "Activate Grayscale Mode"}
            data-active={isGrayscale}
            className={commonButtonClass}
            title="Grayscale Mode"
          >
            <Palette className={commonIconClass} />
          </Button>
          
          <Separator orientation="vertical" className="h-6 sm:h-8 mx-0.5 sm:mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenTimerManager}
            disabled={isKidsModeActive}
            aria-label="Focus Timer Settings"
            data-active={isTimerActive}
            className={cn(commonButtonClass, "relative")}
            title={`Focus Timer ${isTimerActive ? `(${formatTime(focusTimeRemaining)})` : ''}`}
          >
            <Timer className={commonIconClass} />
            {isTimerActive && focusTimeRemaining !== null && (
              <span className="absolute bottom-0 right-0 text-[0.6rem] sm:text-xs font-mono bg-primary text-primary-foreground px-0.5 sm:px-1 rounded-sm">
                {formatTime(focusTimeRemaining)}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenProfilesManager}
            disabled={isKidsModeActive || (isFocusMode && !isTimerActive) } 
            aria-label="Manage Custom Profiles"
            className={commonButtonClass}
            title="Custom Profiles"
          >
            <Users className={commonIconClass} />
          </Button>
          
          <Separator orientation="vertical" className="h-6 sm:h-8 mx-0.5 sm:mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenKidsModeManager}
            disabled={isFocusMode || isTimerActive}
            aria-label="Kid's Mode"
            data-active={isKidsModeActive}
            className={cn(commonButtonClass, isKidsModeActive && "ring-1 ring-pink-500 text-pink-500")}
            title="Kid's Mode"
          >
            <Smile className={commonIconClass} />
          </Button>

          <Separator orientation="vertical" className="h-6 sm:h-8 mx-0.5 sm:mx-1" />
          
          <Link href="/stats" legacyBehavior passHref>
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className={commonButtonClass}
              aria-label="View Statistics"
              title="Statistics"
            >
              <a><BarChart3 className={commonIconClass} /></a>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenInfoDialog}
            aria-label="Application Information"
            className={commonButtonClass}
            title="App Information"
          >
            <Info className={commonIconClass} />
          </Button>
        </div>
      </div>
    </header>
  );
}
