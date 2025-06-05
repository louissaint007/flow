'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AppCard } from '@/components/AppCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { USER_APPS_LIST, SYSTEM_APPS_LIST } from '@/lib/constants';
import type { MockApp } from '@/types';
import { ShieldCheck, ListChecks, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [isFocusMode, setIsFocusMode] = useState(false);
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
    ); // Or a proper skeleton loader
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pb-10 flex-grow max-w-4xl">
        <div className="flex flex-col items-center mb-8 p-6 bg-card rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <Label htmlFor="focus-mode-toggle" className="text-lg font-medium">
              {isFocusMode ? 'Focus Mode Active' : 'Activate Focus Mode'}
            </Label>
            <Switch
              id="focus-mode-toggle"
              checked={isFocusMode}
              onCheckedChange={setIsFocusMode}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
            />
            {isFocusMode ? <Eye className="w-6 h-6 text-primary" /> : <EyeOff className="w-6 h-6 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {isFocusMode
              ? 'Only whitelisted apps and essential system apps are accessible.'
              : 'Select applications to allow during Focus Mode.'}
          </p>
        </div>

        <div 
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            isFocusMode ? 'animate-fade-out opacity-0 hidden' : 'animate-fade-in opacity-100 block'
          )}
        >
          {!isFocusMode && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-1 flex items-center text-primary">
                  <ListChecks className="w-7 h-7 mr-2" />
                  Select Your Allowed Apps
                </h2>
                <p className="text-muted-foreground mb-4">Choose which apps you want to access when Focus Mode is on.</p>
                {categories.map(category => (
                  <div key={category} className="mb-6">
                    <h3 className="text-xl font-medium mb-3 text-foreground/90">{category}</h3>
                    {renderAppGrid(USER_APPS_LIST.filter(app => (app.category || "Other") === category), false)}
                  </div>
                ))}
              </div>
              <Separator className="my-8" />
               <div>
                <h2 className="text-2xl font-semibold mb-1 flex items-center text-primary">
                  <ShieldCheck className="w-7 h-7 mr-2" />
                  System Apps
                </h2>
                <p className="text-muted-foreground mb-4">These apps are always available and not affected by Focus Mode.</p>
                {renderAppGrid(SYSTEM_APPS_LIST, false)}
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
            <div className="mt-8 p-6 bg-card rounded-lg shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-1 flex items-center text-primary">
                  <ListChecks className="w-7 h-7 mr-2" />
                  Whitelisted Apps
                </h2>
                 <p className="text-muted-foreground mb-4">Your selected apps for focused work.</p>
                {whitelistedApps.length > 0 ? (
                  renderAppGrid(whitelistedApps, true)
                ) : (
                  <p className="text-muted-foreground text-center py-4">No apps whitelisted. Disable Focus Mode to select apps.</p>
                )}
              </div>
              <Separator className="my-6" />
              <div>
                <h2 className="text-2xl font-semibold mb-1 flex items-center text-primary">
                  <ShieldCheck className="w-7 h-7 mr-2" />
                  System Apps
                </h2>
                <p className="text-muted-foreground mb-4">Essential system apps remain accessible.</p>
                {renderAppGrid(SYSTEM_APPS_LIST, true)}
              </div>
            </div>
          )}
        </div>

      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
        FocusFlow &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
