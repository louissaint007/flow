
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { AppCard } from '@/components/AppCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { USER_APPS_LIST, SYSTEM_APPS_LIST, getKidsModeApps, KidsModeIcon } from '@/lib/constants';
import type { MockApp, CustomProfile, FocusSessionData } from '@/types';
import { ShieldCheck, ListChecks, Eye, EyeOff, Info, Zap, Palette, Users, PlusCircle, Edit3, Trash2, PlayCircle, Save, XCircle, Timer as TimerIconLucide, Lock, Unlock, ShieldAlert, StopCircle, PartyPopper, BarChart3, Brain, UsersIcon } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { formatISO, parseISO, startOfDay } from 'date-fns';

const FOCUS_SESSIONS_STORAGE_KEY = 'focusFlowSessionsLog';

export default function HomePage() {
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isGrayscaleMode, setIsGrayscaleMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [customProfiles, setCustomProfiles] = useState<CustomProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false); // For create/edit form
  const [editingProfile, setEditingProfile] = useState<CustomProfile | null>(null);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileSelectedAppIds, setProfileSelectedAppIds] = useState<Set<string>>(new Set());
  const [profileToDelete, setProfileToDelete] = useState<CustomProfile | null>(null);

  const [isKidsModeActive, setIsKidsModeActive] = useState(false);
  const [kidsModePassword, setKidsModePassword] = useState('');
  const [isKidsModePasswordSet, setIsKidsModePasswordSet] = useState(false);
  const [showKidsModeSetupDialog, setShowKidsModeSetupDialog] = useState(false);
  const [showKidsModeExitDialog, setShowKidsModeExitDialog] = useState(false);
  const [kidsModeTimerDuration, setKidsModeTimerDuration] = useState(30); 
  const [kidsModeTimeRemaining, setKidsModeTimeRemaining] = useState<number | null>(null); 
  const [kidsModePasswordInput, setKidsModePasswordInput] = useState(''); 
  const [tempKidsModePassword, setTempKidsModePassword] = useState(''); 
  const [tempKidsModeTimerDuration, setTempKidsModeTimerDuration] = useState(30); 
  const kidsModeAllowedApps = useMemo(() => getKidsModeApps(), []);

  const [focusTimerDurationInput, setFocusTimerDurationInput] = useState(25);
  const [focusTimeRemaining, setFocusTimeRemaining] = useState<number | null>(null);
  const [isFocusTimerActive, setIsFocusTimerActive] = useState(false);
  const [showFocusCongratsDialog, setShowFocusCongratsDialog] = useState(false);
  const [wasFocusModeActiveBeforeTimer, setWasFocusModeActiveBeforeTimer] = useState(false);
  const [completedFocusTimerDuration, setCompletedFocusTimerDuration] = useState<number | null>(null);

  // Dialog states for toolbar actions
  const [showTimerManagerDialog, setShowTimerManagerDialog] = useState(false);
  const [showProfilesManagerDialog, setShowProfilesManagerDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);


  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const storedProfiles = localStorage.getItem('focusFlowCustomProfiles');
    if (storedProfiles) {
      setCustomProfiles(JSON.parse(storedProfiles));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('focusFlowCustomProfiles', JSON.stringify(customProfiles));
    }
  }, [customProfiles, mounted]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isKidsModeActive && kidsModeTimeRemaining !== null && kidsModeTimeRemaining > 0) {
      intervalId = setInterval(() => {
        setKidsModeTimeRemaining((prevTime) => (prevTime ? Math.max(0, prevTime - 1) : 0));
      }, 1000);
    } else if (isKidsModeActive && kidsModeTimeRemaining === 0) {
      toast({ title: "Time's Up!", description: "Kid's Mode time has finished. Enter password to exit.", variant: "default", duration: 5000 });
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isKidsModeActive, kidsModeTimeRemaining, toast]);

  const saveFocusSession = useCallback((durationMinutes: number) => {
    try {
      const storedSessionsRaw = localStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);
      const sessions: FocusSessionData[] = storedSessionsRaw ? JSON.parse(storedSessionsRaw) : [];
      const newSession: FocusSessionData = {
        date: formatISO(startOfDay(new Date())),
        duration: durationMinutes,
      };
      sessions.push(newSession);
      localStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save focus session:", error);
      toast({ title: "Error", description: "Could not save focus session data.", variant: "destructive"});
    }
  }, [toast]);

  const handleStartFocusTimer = useCallback(() => {
    if (isKidsModeActive) {
      toast({ title: "Action Disabled", description: "Kid's Mode is active. Disable it to start the Focus Timer.", variant: "default" });
      return;
    }
    if (focusTimerDurationInput <= 0) {
      toast({ title: "Invalid Duration", description: "Timer duration must be greater than 0 minutes.", variant: "destructive" });
      return;
    }
    setWasFocusModeActiveBeforeTimer(isFocusMode);
    if (!isFocusMode) setIsFocusMode(true);
    setIsFocusTimerActive(true);
    setFocusTimeRemaining(focusTimerDurationInput * 60);
    setCompletedFocusTimerDuration(focusTimerDurationInput);
    toast({ title: "Focus Timer Started", description: `Focus session for ${focusTimerDurationInput} minutes has begun.` });
    setShowTimerManagerDialog(false); // Close dialog on start
  }, [isKidsModeActive, focusTimerDurationInput, isFocusMode, toast, setIsFocusMode]);

  const handleStopFocusTimer = useCallback((showSuccessToast = true) => {
    setIsFocusTimerActive(false);
    setFocusTimeRemaining(null);
    setCompletedFocusTimerDuration(null);
    if (!wasFocusModeActiveBeforeTimer) {
      setIsFocusMode(false);
    }
    if (showSuccessToast) {
      toast({ title: "Focus Timer Stopped" });
    }
  }, [wasFocusModeActiveBeforeTimer, setIsFocusMode, toast]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isFocusTimerActive && focusTimeRemaining !== null && focusTimeRemaining > 0) {
      intervalId = setInterval(() => {
        setFocusTimeRemaining((prevTime) => (prevTime ? Math.max(0, prevTime - 1) : 0));
      }, 1000);
    } else if (isFocusTimerActive && focusTimeRemaining === 0) {
      if (!wasFocusModeActiveBeforeTimer) {
        setIsFocusMode(false);
      }
      setIsFocusTimerActive(false);
      if (completedFocusTimerDuration && completedFocusTimerDuration > 0) {
        saveFocusSession(completedFocusTimerDuration);
      }
      setCompletedFocusTimerDuration(null);
      setShowFocusCongratsDialog(true);
      toast({ title: "Focus Session Complete!", description: "Great work! Time for a break.", duration: 7000 });
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isFocusTimerActive, focusTimeRemaining, wasFocusModeActiveBeforeTimer, setIsFocusMode, toast, completedFocusTimerDuration, saveFocusSession]);

  useEffect(() => {
    if (isFocusTimerActive) {
      if (isKidsModeActive) { 
        setIsKidsModeActive(false); 
        toast({ title: "Kid's Mode Deactivated", description: "Focus Timer is active." });
      }
    }
  }, [isFocusTimerActive, isKidsModeActive, toast]);

  useEffect(() => {
    if (isKidsModeActive) {
      if (isFocusTimerActive) { 
         handleStopFocusTimer(false);
         toast({ title: "Focus Timer Stopped", description: "Kid's Mode activated." });
      }
       if (isFocusMode) setIsFocusMode(false); 
    }
  }, [isKidsModeActive, isFocusTimerActive, isFocusMode, handleStopFocusTimer, toast]);
  
  useEffect(() => {
    if (isFocusTimerActive && !isFocusMode && !wasFocusModeActiveBeforeTimer) {
        handleStopFocusTimer(false);
        toast({ title: "Focus Timer Ended", description: "Focus Mode was deactivated." });
    }
  }, [isFocusMode, isFocusTimerActive, wasFocusModeActiveBeforeTimer, handleStopFocusTimer, toast]);

  const handleToggleAppSelectionForPage = useCallback((appId: string) => {
    setActiveProfileId(null); 
    setSelectedAppIds((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(appId)) newSelected.delete(appId);
      else newSelected.add(appId);
      return newSelected;
    });
  }, []);

  const handleToggleAppSelectionForDialog = useCallback((appId: string) => {
    setProfileSelectedAppIds((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(appId)) newSelected.delete(appId);
      else newSelected.add(appId);
      return newSelected;
    });
  }, []);
  
  const whitelistedApps = useMemo(() => {
    return USER_APPS_LIST.filter((app) => selectedAppIds.has(app.id));
  }, [selectedAppIds]);

  const renderAppGrid = useCallback((
    apps: MockApp[],
    isFocusView: boolean, 
    currentSelection: Set<string>,
    onToggle?: (appId: string) => void, 
    selectableSystemApps: boolean = false,
    isKidsModeGrid: boolean = false
  ) => (
    <div className={`grid grid-cols-2 sm:grid-cols-3 ${isKidsModeGrid ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-4 lg:grid-cols-5'} gap-4`}>
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          isSelected={currentSelection.has(app.id)}
          onToggleSelection={!isFocusView && onToggle && (selectableSystemApps || !app.isSystemApp) ? onToggle : undefined}
          isFocusModeView={isFocusView} 
          disabled={(!selectableSystemApps && app.isSystemApp && !isFocusView && !onToggle) || (isFocusView)} 
          isKidsModeCard={isKidsModeGrid}
        />
      ))}
    </div>
  ), []);
  
  const categories = useMemo(() => {
    const cats = new Set(USER_APPS_LIST.map(app => app.category || "Other"));
    return Array.from(cats);
  }, []);

  const handleOpenCreateProfileForm = () => {
    setEditingProfile(null);
    setProfileNameInput('');
    setProfileSelectedAppIds(new Set());
    setIsProfileFormOpen(true);
  };

  const handleOpenEditProfileForm = (profile: CustomProfile) => {
    setEditingProfile(profile);
    setProfileNameInput(profile.name);
    setProfileSelectedAppIds(new Set(profile.appIds));
    setIsProfileFormOpen(true);
  };

  const handleSaveProfileForm = () => {
    if (!profileNameInput.trim()) {
      toast({ title: "Error", description: "Profile name cannot be empty.", variant: "destructive" });
      return;
    }
    if (editingProfile) {
      setCustomProfiles(customProfiles.map(p => 
        p.id === editingProfile.id ? { ...p, name: profileNameInput.trim(), appIds: Array.from(profileSelectedAppIds) } : p
      ));
      toast({ title: "Profile Updated", description: `Profile "${profileNameInput.trim()}" has been updated.` });
    } else {
      const newProfile: CustomProfile = {
        id: Date.now().toString(),
        name: profileNameInput.trim(),
        appIds: Array.from(profileSelectedAppIds),
      };
      setCustomProfiles([...customProfiles, newProfile]);
      toast({ title: "Profile Created", description: `Profile "${newProfile.name}" has been created.` });
    }
    setIsProfileFormOpen(false);
    setEditingProfile(null);
  };

  const activateProfile = (profile: CustomProfile) => {
    setSelectedAppIds(new Set(profile.appIds));
    setActiveProfileId(profile.id);
    if (isFocusTimerActive) handleStopFocusTimer(false); 
    // setIsFocusMode(false); // Let user toggle focus mode after activating profile
    setIsFocusMode(true); // Automatically turn on focus mode when a profile is activated
    toast({ title: "Profile Activated", description: `Profile "${profile.name}" is now active and Focus Mode enabled.` });
    setShowProfilesManagerDialog(false);
  };

  const deactivateCurrentProfile = () => {
    setActiveProfileId(null);
    // Clear selected apps if a profile is cleared, unless user wants to keep them for manual mode
    setSelectedAppIds(new Set()); 
    if (isFocusMode && !isFocusTimerActive) { // If focus mode was on due to profile, turn it off
        setIsFocusMode(false);
    }
    toast({ title: "Profile Deactivated" });
  }

  const handleDeleteProfile = () => {
    if (!profileToDelete) return;
    setCustomProfiles(customProfiles.filter(p => p.id !== profileToDelete.id));
    if (activeProfileId === profileToDelete.id) {
      setActiveProfileId(null);
      setSelectedAppIds(new Set());
       if (isFocusMode && !isFocusTimerActive) setIsFocusMode(false);
    }
    toast({ title: "Profile Deleted", description: `Profile "${profileToDelete.name}" has been deleted.`, variant: "destructive" });
    setProfileToDelete(null);
  };

  const handleOpenKidsModeSetup = () => {
    if (isFocusMode || isFocusTimerActive) {
      toast({ title: "Action Disabled", description: "Disable Focus Mode/Timer to activate Kid's Mode.", variant: "default" });
      return;
    }
    setTempKidsModePassword('');
    setTempKidsModeTimerDuration(kidsModeTimerDuration);
    setShowKidsModeSetupDialog(true);
  };
  
  const handleOpenKidsModeManager = () => {
    if (isKidsModePasswordSet) {
        startKidsMode(kidsModeTimerDuration);
    } else {
        handleOpenKidsModeSetup();
    }
  }

  const handleSaveKidsModeSetup = () => {
    if (!tempKidsModePassword) {
      toast({ title: "Error", description: "Password cannot be empty.", variant: "destructive" });
      return;
    }
    if (tempKidsModeTimerDuration <= 0) {
       toast({ title: "Error", description: "Timer duration must be greater than 0 minutes.", variant: "destructive" });
      return;
    }
    setKidsModePassword(tempKidsModePassword);
    setKidsModeTimerDuration(tempKidsModeTimerDuration);
    setIsKidsModePasswordSet(true);
    setShowKidsModeSetupDialog(false);
    startKidsMode(tempKidsModeTimerDuration);
    toast({ title: "Kid's Mode Setup Complete", description: "Kid's Mode is now active!" });
  };
  
  const startKidsMode = (durationMinutes: number) => {
    if (isFocusTimerActive) handleStopFocusTimer(false);
    setIsKidsModeActive(true);
    setKidsModeTimeRemaining(durationMinutes * 60);
    setIsFocusMode(false); 
    setSelectedAppIds(new Set()); 
    setActiveProfileId(null); 
    toast({ title: "Kid's Mode Activated", description: "Enjoy a safe and focused experience!" });
  };

  const handleAttemptExitKidsMode = () => {
    setKidsModePasswordInput('');
    setShowKidsModeExitDialog(true);
  };

  const handleConfirmExitKidsMode = () => {
    if (kidsModePasswordInput === kidsModePassword) {
      setIsKidsModeActive(false);
      setKidsModeTimeRemaining(null);
      setShowKidsModeExitDialog(false);
      setKidsModePasswordInput('');
      toast({ title: "Kid's Mode Deactivated", description: "Welcome back!" });
    } else {
      toast({ title: "Incorrect Password", description: "Please try again.", variant: "destructive" });
      setKidsModePasswordInput('');
    }
  };

  const handleToggleFocusMode = () => {
    if (isKidsModeActive) {
      toast({ title: "Action Disabled", description: "Kid's Mode is active.", variant: "default" });
      return;
    }
    
    const newFocusModeState = !isFocusMode;
    setIsFocusMode(newFocusModeState);

    if (newFocusModeState) { // Turning Focus Mode ON
        if (activeProfileId) {
             toast({ title: "Focus Mode Active", description: `Using profile "${customProfiles.find(p => p.id === activeProfileId)?.name}".` });
        } else if (isFocusTimerActive) {
            // Timer already handles its toast
        } else if (selectedAppIds.size > 0) {
            toast({ title: "Focus Mode Active", description: "Using manually selected apps." });
        } else {
            toast({ title: "Focus Mode Active", description: "No apps selected. Only system apps might be available if chosen." });
        }
    } else { // Turning Focus Mode OFF
        if (isFocusTimerActive) { // If timer is running, it shouldn't be turned off this way easily.
             // This case is handled by useEffect for isFocusMode changes during timer.
        } else if (activeProfileId) {
            // Optionally deactivate profile when focus mode is turned off
            // setActiveProfileId(null); 
            // setSelectedAppIds(new Set());
            toast({ title: "Focus Mode Deactivated" });
        } else {
             toast({ title: "Focus Mode Deactivated" });
        }
    }
  };

  const activeProfile = customProfiles.find(p => p.id === activeProfileId);


  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isKidsModeActive) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-400 flex flex-col items-center justify-center p-4 text-white transition-all duration-500 ease-in-out">
        <Header
            isFocusMode={isFocusMode}
            onToggleFocusMode={handleToggleFocusMode}
            isGrayscale={isGrayscaleMode}
            onToggleGrayscale={() => setIsGrayscaleMode(!isGrayscaleMode)}
            onOpenKidsModeManager={handleOpenKidsModeManager}
            onOpenTimerManager={() => setShowTimerManagerDialog(true)}
            onOpenProfilesManager={() => setShowProfilesManagerDialog(true)}
            onOpenInfoDialog={() => setShowInfoDialog(true)}
            isTimerActive={isFocusTimerActive}
            focusTimeRemaining={focusTimeRemaining}
            isKidsModeActive={isKidsModeActive}
            activeProfileName={activeProfile?.name}
        />
        <div className="absolute top-20 right-6 print:hidden">
          <Button onClick={handleAttemptExitKidsMode} variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white">
            <Unlock className="mr-2 h-5 w-5" /> Exit Kid's Mode
          </Button>
        </div>
        <main className="flex flex-col items-center justify-center flex-grow w-full pt-16"> {/* Added pt-16 for header spacing */}
            <KidsModeIcon className="w-24 h-24 text-yellow-300 mb-6" />
            <h1 className="text-5xl font-bold mb-4">Kid's Mode</h1>
            {kidsModeTimeRemaining !== null && kidsModeTimeRemaining > 0 && (
            <div className="mb-8 p-4 bg-white/20 rounded-lg shadow-xl">
                <TimerIconLucide className="w-10 h-10 text-yellow-300 mb-2 mx-auto" />
                <p className="text-4xl font-bold text-center">{formatTime(kidsModeTimeRemaining)}</p>
                <p className="text-center text-sm">Time Remaining</p>
            </div>
            )}
            {kidsModeTimeRemaining === 0 && (
            <div className="mb-8 p-6 bg-red-500/80 rounded-lg shadow-xl flex flex-col items-center">
                <ShieldAlert className="w-12 h-12 text-white mb-3" />
                <p className="text-3xl font-bold text-center text-white">Time's Up!</p>
                <p className="text-white/90 text-center mt-1">Please ask a grown-up to exit.</p>
            </div>
            )}
            <div className="w-full max-w-2xl p-6 bg-white/10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">Allowed Apps</h2>
            {kidsModeAllowedApps.length > 0 ? (
                renderAppGrid(kidsModeAllowedApps, true, new Set(kidsModeAllowedApps.map(a => a.id)), undefined, false, true)
            ) : (
                <p className="text-center py-4">No apps configured for Kid's Mode.</p>
            )}
            </div>
        </main>
         <Dialog open={showKidsModeExitDialog} onOpenChange={setShowKidsModeExitDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Enter Password to Exit Kid's Mode</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <Label htmlFor="kidsModeExitPassword">Password</Label>
              <Input 
                id="kidsModeExitPassword" 
                type="password" 
                value={kidsModePasswordInput}
                onChange={(e) => setKidsModePasswordInput(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                placeholder="Enter password" 
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowKidsModeExitDialog(false)} className="text-slate-300 border-slate-600 hover:bg-slate-700">Cancel</Button>
              <Button onClick={handleConfirmExitKidsMode} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                <Unlock className="mr-2 h-4 w-4" /> Confirm Exit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-background",
      isGrayscaleMode && "filter grayscale"
    )}>
      <Header
        isFocusMode={isFocusMode}
        onToggleFocusMode={handleToggleFocusMode}
        isGrayscale={isGrayscaleMode}
        onToggleGrayscale={() => setIsGrayscaleMode(!isGrayscaleMode)}
        onOpenKidsModeManager={handleOpenKidsModeManager}
        onOpenTimerManager={() => setShowTimerManagerDialog(true)}
        onOpenProfilesManager={() => setShowProfilesManagerDialog(true)}
        onOpenInfoDialog={() => setShowInfoDialog(true)}
        isTimerActive={isFocusTimerActive}
        focusTimeRemaining={focusTimeRemaining}
        isKidsModeActive={isKidsModeActive}
        activeProfileName={activeProfile?.name}
      />
      <main className="container mx-auto px-2 sm:px-4 pb-12 flex-grow max-w-5xl mt-6">
        <div 
          className={cn(
            "transition-opacity duration-300 ease-in-out",
            (isFocusMode || isKidsModeActive ) ? 'opacity-0 h-0 overflow-hidden p-0 m-0' : 'opacity-100' 
            // Hiding if any focus mode is on, timer is handled by isFocusMode too
          )}
        >
          {!isFocusMode && !isKidsModeActive && ( // Content for when NO mode is active
            <>
              <div className="mb-12 p-4 sm:p-6 bg-card rounded-xl shadow-md border border-border">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold flex items-center text-primary mb-2 sm:mb-0">
                    <ListChecks className="w-7 h-7 sm:w-8 sm:h-8 mr-3" />
                    Select Your Allowed Apps
                    </h2>
                    {activeProfileId && (
                        <Button variant="outline" size="sm" onClick={deactivateCurrentProfile}>
                            Clear Profile Selection
                        </Button>
                    )}
                </div>
                <p className="text-muted-foreground mb-6 text-md sm:text-lg">
                  {activeProfileId ? `Using "${customProfiles.find(p=>p.id === activeProfileId)?.name}" profile. Customize below or toggle Focus Mode.` : 'Choose which apps to access when Focus Mode is on. Or, select a profile.'}
                </p>
                {categories.map(category => (
                  <div key={category} className="mb-8 p-4 sm:p-6 bg-card rounded-lg shadow-sm border">
                    <h3 className="text-xl sm:text-2xl font-semibold mb-5 text-foreground">{category}</h3>
                    {renderAppGrid(USER_APPS_LIST.filter(app => (app.category || "Other") === category), false, selectedAppIds, handleToggleAppSelectionForPage)}
                  </div>
                ))}
              </div>
              <Separator className="my-12" />
               <div className="mb-12 p-4 sm:p-6 bg-card rounded-xl shadow-md border border-border">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center text-primary">
                  <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 mr-3" />
                  System Apps
                </h2>
                <p className="text-muted-foreground mb-6 text-md sm:text-lg">Optionally include essential system apps in your focus sessions.</p>
                 <div className="p-4 sm:p-6 bg-card rounded-lg shadow-sm border">
                    {renderAppGrid(SYSTEM_APPS_LIST, false, selectedAppIds, handleToggleAppSelectionForPage, true)}
                 </div>
              </div>
            </>
          )}
        </div>
        
        <div
          className={cn(
            "transition-opacity duration-300 ease-in-out",
            isFocusMode && !isKidsModeActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden p-0 m-0'
          )}
        >
          {isFocusMode && !isKidsModeActive && ( // Content for when Focus Mode IS active
            <div className="mt-0 sm:mt-8 p-4 sm:p-8 bg-card rounded-xl shadow-lg border">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center text-primary">
                  <ListChecks className="w-7 h-7 sm:w-8 sm:h-8 mr-3" />
                  Whitelisted Apps 
                  {isFocusTimerActive && ` (Timer: ${formatTime(focusTimeRemaining)})`}
                  {activeProfile && !isFocusTimerActive && ` (Profile: ${activeProfile.name})`}
                </h2>
                 <p className="text-muted-foreground mb-6 text-md sm:text-lg">
                    {isFocusTimerActive ? "Currently in a timed focus session." : (activeProfile ? "Focusing with your selected profile." : "Focusing with manually selected apps.")}
                 </p>
                {whitelistedApps.length > 0 ? (
                  renderAppGrid(whitelistedApps, true, selectedAppIds)
                ) : (
                   SYSTEM_APPS_LIST.filter(app => selectedAppIds.has(app.id)).length > 0 ? null :
                  <p className="text-muted-foreground text-center py-6 text-lg">No user apps whitelisted. Only selected system apps (if any) are available.</p>
                )}
              </div>
              <Separator className="my-8" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center text-primary">
                  <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 mr-3" />
                  System Apps
                </h2>
                <p className="text-muted-foreground mb-6 text-md sm:text-lg">Selected system apps remain accessible.</p>
                 {SYSTEM_APPS_LIST.filter(app => selectedAppIds.has(app.id)).length > 0 ?
                    renderAppGrid(SYSTEM_APPS_LIST.filter(app => selectedAppIds.has(app.id)), true, selectedAppIds, undefined, true)
                    : <p className="text-muted-foreground text-center py-6 text-lg">No system apps selected for this focus session.</p>
                }
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Timer Manager Dialog */}
      <Dialog open={showTimerManagerDialog} onOpenChange={setShowTimerManagerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center"><TimerIconLucide className="w-7 h-7 mr-3 text-primary" /> Focus Timer</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6">
            {isFocusTimerActive && focusTimeRemaining !== null && (
              <div className="text-center">
                <p className="text-6xl font-bold text-primary">{formatTime(focusTimeRemaining)}</p>
                <p className="text-muted-foreground mt-1">Time Remaining</p>
              </div>
            )}
            <div>
              <Label htmlFor="focus-timer-duration-dialog" className="text-base">
                Set Duration (minutes)
              </Label>
              <Input
                id="focus-timer-duration-dialog"
                type="number"
                value={focusTimerDurationInput}
                onChange={(e) => setFocusTimerDurationInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
                className="mt-2 text-lg"
                disabled={isFocusTimerActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimerManagerDialog(false)}>Cancel</Button>
            <Button
              onClick={isFocusTimerActive ? () => handleStopFocusTimer(true) : handleStartFocusTimer}
              variant={isFocusTimerActive ? "destructive" : "default"}
              size="lg"
              className="min-w-[120px]"
            >
              {isFocusTimerActive ? <StopCircle className="mr-2 h-5 w-5" /> : <PlayCircle className="mr-2 h-5 w-5" />}
              {isFocusTimerActive ? 'Stop' : 'Start'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profiles Management Dialog */}
      <Dialog open={showProfilesManagerDialog} onOpenChange={setShowProfilesManagerDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              <UsersIcon className="w-7 h-7 mr-3 text-primary" /> Custom Profiles
            </DialogTitle>
            <DialogDescription>Manage your focus profiles or create a new one.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto pr-2 space-y-1">
            {customProfiles.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No custom profiles. Create one to get started!</p>
            ) : (
              <div className="space-y-3">
                {customProfiles.map(profile => (
                  <div key={profile.id} className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                    activeProfileId === profile.id ? "bg-primary/10 border-primary shadow-sm" : "bg-muted/20 hover:bg-muted/50"
                  )}>
                    <span className={cn(
                      "font-medium text-md",
                      activeProfileId === profile.id ? "text-primary" : "text-foreground"
                    )}>{profile.name}</span>
                    <div className="flex items-center space-x-1.5">
                      <Button 
                        variant={activeProfileId === profile.id ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => activeProfileId === profile.id ? deactivateCurrentProfile() : activateProfile(profile)}
                        className="w-24 text-xs"
                        disabled={isFocusMode && activeProfileId !== profile.id} // Can't switch profile if focus mode is ON unless deactivating current
                      >
                        {activeProfileId === profile.id ? <XCircle className="mr-1.5 h-3.5 w-3.5" /> : <PlayCircle className="mr-1.5 h-3.5 w-3.5" />}
                        {activeProfileId === profile.id ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditProfileForm(profile)} aria-label="Edit profile" disabled={isFocusMode && activeProfileId === profile.id}>
                        <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setProfileToDelete(profile)} aria-label="Delete profile" disabled={isFocusMode && activeProfileId === profile.id}>
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowProfilesManagerDialog(false)}>Close</Button>
            <Button onClick={handleOpenCreateProfileForm} disabled={isFocusMode}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Creation/Editing Form Dialog (reused) */}
      <Dialog open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProfile ? `Edit Profile: ${editingProfile.name}` : 'Create New Profile'}
            </DialogTitle>
            <DialogDescription>
              {editingProfile ? `Update the details for "${editingProfile.name}".` : "Set a name and choose the apps for your new profile."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex-grow overflow-y-auto space-y-6 pr-2">
            <div>
              <Label htmlFor="profileName" className="text-base">Profile Name</Label>
              <Input 
                id="profileName" 
                value={profileNameInput} 
                onChange={(e) => setProfileNameInput(e.target.value)} 
                placeholder="e.g., Work, Study, Relax"
                className="mt-1 text-base"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Select Apps for this Profile</h3>
              {categories.map(category => (
                  <div key={category} className="mb-6">
                    <h4 className="text-md font-semibold mb-3 text-foreground/80">{category}</h4>
                    {renderAppGrid(USER_APPS_LIST.filter(app => (app.category || "Other") === category), false, profileSelectedAppIds, handleToggleAppSelectionForDialog)}
                  </div>
                ))}
                 <div>
                    <h4 className="text-md font-semibold mb-3 text-foreground/80">System Apps (Optional)</h4>
                    {renderAppGrid(SYSTEM_APPS_LIST, false, profileSelectedAppIds, handleToggleAppSelectionForDialog, true)}
                </div>
            </div>
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <Button variant="outline" onClick={() => setIsProfileFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProfileForm}>
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Confirmation Dialog (reused) */}
      <AlertDialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The profile "{profileToDelete?.name}" will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProfileToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kid's Mode Setup Dialog (reused) */}
      <Dialog open={showKidsModeSetupDialog} onOpenChange={setShowKidsModeSetupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center"><KidsModeIcon className="w-7 h-7 mr-3 text-primary" /> Setup Kid's Mode</DialogTitle>
             <DialogDescription>Set a password and timer for a safe Kid's Mode session.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
              <ShieldAlert className="h-5 w-5 text-blue-600" />
              <AlertTitle className="font-semibold">Important Note</AlertTitle>
              <AlertDescription>
                Kid's Mode in this web app provides a simulated restricted environment. True device-level restrictions require a native mobile application.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="kidsModeSetupPassword">Set Password</Label>
              <Input 
                id="kidsModeSetupPassword" 
                type="password" 
                value={tempKidsModePassword}
                onChange={(e) => setTempKidsModePassword(e.target.value)}
                placeholder="Enter a password for Kid's Mode" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="kidsModeSetupTimer">Timer Duration (minutes)</Label>
              <Input 
                id="kidsModeSetupTimer" 
                type="number" 
                value={tempKidsModeTimerDuration}
                onChange={(e) => setTempKidsModeTimerDuration(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
                className="mt-1"
              />
            </div>
             <p className="text-sm text-muted-foreground">Allowed apps are preset. Timer will start upon setup completion.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKidsModeSetupDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveKidsModeSetup}>
              <Lock className="mr-2 h-4 w-4" /> Save & Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Focus Timer Congratulations Dialog (reused) */}
      <Dialog open={showFocusCongratsDialog} onOpenChange={setShowFocusCongratsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center pt-6">
            <PartyPopper className="w-16 h-16 text-primary mb-4" />
            <DialogTitle className="text-2xl font-bold">Focus Session Complete!</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground py-4 text-base">
            Great job on staying focused! You've earned a well-deserved break.
          </p>
          <DialogFooter className="sm:justify-center pb-6">
            <DialogClose asChild>
              <Button type="button" size="lg">Awesome!</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center"><Info className="w-7 h-7 mr-3 text-primary" /> Application Information</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-accent/10 border-accent/30">
              <Info className="h-5 w-5 text-accent" />
              <AlertTitle className="text-accent-foreground/90 font-semibold">Note on Full Functionality</AlertTitle>
              <AlertDescription className="text-accent-foreground/80">
                For features like automatically scanning installed apps, enforcing device-level access restrictions, system-wide grayscale, or truly locking Kid's/Focus Mode, a native mobile application with system permissions is typically required. This web prototype demonstrates the core concepts and UI. Data for statistics is stored locally in your browser.
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-sm text-muted-foreground space-y-1">
                <p><strong className="text-foreground">Focus Mode Icon:</strong> Toggles Focus Mode on/off. Status (and profile/timer info) shown on hover or if active.</p>
                <p><strong className="text-foreground">Palette Icon:</strong> Toggles Grayscale visual filter.</p>
                <p><strong className="text-foreground">Timer Icon:</strong> Opens Focus Timer settings. Shows remaining time if active.</p>
                <p><strong className="text-foreground">Users Icon:</strong> Opens Custom Profile management.</p>
                <p><strong className="text-foreground">Smile Icon:</strong> Activates or sets up Kid's Mode.</p>
                <p><strong className="text-foreground">Bar Chart Icon:</strong> Navigates to the Statistics page.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <footer className={cn("text-center py-6 text-base text-muted-foreground border-t print:hidden", isKidsModeActive && "hidden")}>
        <div className="flex justify-center items-center space-x-4">
          <span>FocusFlow &copy; {new Date().getFullYear()}</span>
          <Link href="/stats" legacyBehavior><a className="text-primary hover:underline flex items-center"><BarChart3 className="mr-1 h-4 w-4" />View Stats</a></Link>
        </div>
      </footer>
    </div>
  );
}
