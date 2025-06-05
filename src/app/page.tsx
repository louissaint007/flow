
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AppCard } from '@/components/AppCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { USER_APPS_LIST, SYSTEM_APPS_LIST } from '@/lib/constants';
import type { MockApp } from '@/types';
import { ShieldCheck, ListChecks, Eye, EyeOff, Info, Zap, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isGrayscaleMode, setIsGrayscaleMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleAppSelection = (appId: string) => {
    setSelectedAppIds((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(appId)) {
        newSelected.delete(appId);
      } else {
        newSelected.add(appId);
      }
      return newSelected;
    });
  };

  const whitelistedApps = useMemo(() => {
    return USER_APPS_LIST.filter((app) => selectedAppIds.has(app.id));
  }, [selectedAppIds]);

  const renderAppGrid = (apps: MockApp[], isFocusView: boolean) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          isSelected={selectedAppIds.has(app.id)}
          onToggleSelection={!isFocusView ? toggleAppSelection : undefined}
          isFocusModeView={isFocusView}
        />
      ))}
    </div>
  );
  
  const categories = useMemo(() => {
    const cats = new Set(USER_APPS_LIST.map(app => app.category || "Other"));
    return Array.from(cats);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-background",
      isGrayscaleMode && "filter grayscale"
    )}>
      <Header />
      <main className="container mx-auto px-4 pb-12 flex-grow max-w-5xl">
        <div className="flex flex-col items-center mb-10 p-8 bg-card rounded-xl shadow-lg border border-border">
          <Zap className="w-10 h-10 text-primary mb-4" />
          <div className="flex items-center space-x-4 mb-5">
            <Label htmlFor="focus-mode-toggle" className="text-xl font-semibold text-foreground">
              {isFocusMode ? 'Focus Mode Active' : 'Activate Focus Mode'}
            </Label>
            <Switch
              id="focus-mode-toggle"
              checked={isFocusMode}
              onCheckedChange={setIsFocusMode}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
            />
            {isFocusMode ? <Eye className="w-7 h-7 text-primary" /> : <EyeOff className="w-7 h-7 text-muted-foreground" />}
          </div>
          <p className="text-base text-muted-foreground text-center max-w-lg mb-6">
            {isFocusMode
              ? 'Only whitelisted apps and essential system services are accessible. Enjoy your focused session!'
              : 'Toggle the switch to enter Focus Mode. Select applications below to allow them during your session.'}
          </p>
          <div className="flex items-center space-x-4 mb-3">
            <Label htmlFor="grayscale-mode-toggle" className="text-lg font-medium text-foreground">
              Grayscale Mode
            </Label>
            <Switch
              id="grayscale-mode-toggle"
              checked={isGrayscaleMode}
              onCheckedChange={setIsGrayscaleMode}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted"
            />
            <Palette className={cn("w-6 h-6", isGrayscaleMode ? "text-primary" : "text-muted-foreground")} />
          </div>
           <p className="text-sm text-muted-foreground text-center max-w-md">
            {isGrayscaleMode
              ? 'Visuals are now in black and white.'
              : 'Enable to simulate a grayscale display for reduced distraction.'}
          </p>
        </div>

        <Alert className="mb-10 bg-accent/10 border-accent/30">
          <Info className="h-5 w-5 text-accent" />
          <AlertTitle className="text-accent-foreground/90 font-semibold">Note on Full Functionality</AlertTitle>
          <AlertDescription className="text-accent-foreground/80">
            For features like automatically scanning installed apps, enforcing device-level access restrictions, or system-wide grayscale, a native mobile application with system permissions is typically required. This web prototype demonstrates the core concepts.
          </AlertDescription>
        </Alert>

        <div 
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            isFocusMode ? 'animate-fade-out opacity-0 hidden' : 'animate-fade-in opacity-100 block'
          )}
        >
          {!isFocusMode && (
            <>
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-2 flex items-center text-primary">
                  <ListChecks className="w-8 h-8 mr-3" />
                  Select Your Allowed Apps
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">Choose which apps you want to access when Focus Mode is on.</p>
                {categories.map(category => (
                  <div key={category} className="mb-8 p-6 bg-card rounded-lg shadow-sm border">
                    <h3 className="text-2xl font-semibold mb-5 text-foreground">{category}</h3>
                    {renderAppGrid(USER_APPS_LIST.filter(app => (app.category || "Other") === category), false)}
                  </div>
                ))}
              </div>
              <Separator className="my-12" />
               <div className="mb-12">
                <h2 className="text-3xl font-bold mb-2 flex items-center text-primary">
                  <ShieldCheck className="w-8 h-8 mr-3" />
                  System Apps
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">These apps are always available and not affected by Focus Mode.</p>
                 <div className="p-6 bg-card rounded-lg shadow-sm border">
                    {renderAppGrid(SYSTEM_APPS_LIST, false)}
                 </div>
              </div>
            </>
          )}
        </div>
        
        <div
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            isFocusMode ? 'animate-fade-in opacity-100 block' : 'animate-fade-out opacity-0 hidden'
          )}
        >
          {isFocusMode && (
            <div className="mt-8 p-8 bg-card rounded-xl shadow-lg border">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 flex items-center text-primary">
                  <ListChecks className="w-8 h-8 mr-3" />
                  Whitelisted Apps
                </h2>
                 <p className="text-muted-foreground mb-6 text-lg">Your selected apps for focused work.</p>
                {whitelistedApps.length > 0 ? (
                  renderAppGrid(whitelistedApps, true)
                ) : (
                  <p className="text-muted-foreground text-center py-6 text-lg">No apps whitelisted. Disable Focus Mode to select apps.</p>
                )}
              </div>
              <Separator className="my-8" />
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center text-primary">
                  <ShieldCheck className="w-8 h-8 mr-3" />
                  System Apps
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">Essential system apps remain accessible.</p>
                {renderAppGrid(SYSTEM_APPS_LIST, true)}
              </div>
            </div>
          )}
        </div>

      </main>
      <footer className="text-center py-6 text-base text-muted-foreground border-t">
        FocusFlow &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
