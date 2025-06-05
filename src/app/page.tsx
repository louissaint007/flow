
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { AppCard } from '@/components/AppCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { USER_APPS_LIST, SYSTEM_APPS_LIST } from '@/lib/constants';
import type { MockApp, CustomProfile } from '@/types';
import { ShieldCheck, ListChecks, Eye, EyeOff, Info, Zap, Palette, UsersIcon, PlusCircle, Edit3, Trash2, PlayCircle, Save, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isGrayscaleMode, setIsGrayscaleMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [customProfiles, setCustomProfiles] = useState<CustomProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CustomProfile | null>(null);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileSelectedAppIds, setProfileSelectedAppIds] = useState<Set<string>>(new Set());
  const [profileToDelete, setProfileToDelete] = useState<CustomProfile | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    // Load profiles from localStorage if needed in the future
  }, []);

  // Effect to save profiles to localStorage (optional for now)
  // useEffect(() => {
  //   if (mounted) {
  //     localStorage.setItem('customProfiles', JSON.stringify(customProfiles));
  //   }
  // }, [customProfiles, mounted]);

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
    onToggle: (appId: string) => void,
    selectableSystemApps: boolean = false
  ) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          isSelected={currentSelection.has(app.id)}
          onToggleSelection={!isFocusView && (selectableSystemApps || !app.isSystemApp) ? onToggle : undefined}
          isFocusModeView={isFocusView}
          disabled={!selectableSystemApps && app.isSystemApp && !isFocusView}
        />
      ))}
    </div>
  ), []);
  
  const categories = useMemo(() => {
    const cats = new Set(USER_APPS_LIST.map(app => app.category || "Other"));
    return Array.from(cats);
  }, []);

  const handleOpenCreateProfileDialog = () => {
    setEditingProfile(null);
    setProfileNameInput('');
    setProfileSelectedAppIds(new Set());
    setIsProfileDialogOpen(true);
  };

  const handleOpenEditProfileDialog = (profile: CustomProfile) => {
    setEditingProfile(profile);
    setProfileNameInput(profile.name);
    setProfileSelectedAppIds(new Set(profile.appIds));
    setIsProfileDialogOpen(true);
  };

  const handleSaveProfile = () => {
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
        id: Date.now().toString(), // Simple ID generation
        name: profileNameInput.trim(),
        appIds: Array.from(profileSelectedAppIds),
      };
      setCustomProfiles([...customProfiles, newProfile]);
      toast({ title: "Profile Created", description: `Profile "${newProfile.name}" has been created.` });
    }
    setIsProfileDialogOpen(false);
    setEditingProfile(null);
  };

  const activateProfile = (profile: CustomProfile) => {
    setSelectedAppIds(new Set(profile.appIds));
    setActiveProfileId(profile.id);
    toast({ title: "Profile Activated", description: `Profile "${profile.name}" is now active.` });
  };

  const handleDeleteProfile = () => {
    if (!profileToDelete) return;
    setCustomProfiles(customProfiles.filter(p => p.id !== profileToDelete.id));
    if (activeProfileId === profileToDelete.id) {
      setActiveProfileId(null);
      setSelectedAppIds(new Set()); // Reset selection or to default
    }
    toast({ title: "Profile Deleted", description: `Profile "${profileToDelete.name}" has been deleted.`, variant: "destructive" });
    setProfileToDelete(null);
  };


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
              ? activeProfileId && customProfiles.find(p => p.id === activeProfileId)
                ? `Focusing with "${customProfiles.find(p => p.id === activeProfileId)?.name}" profile. Only whitelisted apps are accessible.`
                : 'Only whitelisted apps and essential system services are accessible. Enjoy your focused session!'
              : 'Toggle the switch to enter Focus Mode. Select applications or activate a profile below.'}
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
            For features like automatically scanning installed apps, enforcing device-level access restrictions, or system-wide grayscale, a native mobile application with system permissions is typically required. This web prototype demonstrates the core concepts and UI.
          </AlertDescription>
        </Alert>

        {/* Custom Profiles Section */}
        <div className="mb-12 p-6 bg-card rounded-xl shadow-md border border-border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold flex items-center text-foreground">
              <UsersIcon className="w-7 h-7 mr-3 text-primary" />
              Custom Profiles
            </h2>
            <Button onClick={handleOpenCreateProfileDialog} variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Profile
            </Button>
          </div>
          {customProfiles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No custom profiles created yet. Click "Create Profile" to get started.</p>
          ) : (
            <div className="space-y-4">
              {customProfiles.map(profile => (
                <div key={profile.id} className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all",
                  activeProfileId === profile.id ? "bg-primary/10 border-primary shadow-md" : "bg-background hover:bg-muted/50"
                )}>
                  <span className={cn(
                    "font-medium text-lg",
                    activeProfileId === profile.id ? "text-primary" : "text-foreground"
                  )}>{profile.name}</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={activeProfileId === profile.id ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => activeProfileId === profile.id ? setActiveProfileId(null) : activateProfile(profile)}
                      className="w-28"
                    >
                      {activeProfileId === profile.id ? <XCircle className="mr-2 h-4 w-4" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                      {activeProfileId === profile.id ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditProfileDialog(profile)} aria-label="Edit profile">
                      <Edit3 className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </Button>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setProfileToDelete(profile)} aria-label="Delete profile">
                        <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div 
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            isFocusMode ? 'animate-fade-out opacity-0 hidden' : 'animate-fade-in opacity-100 block'
          )}
        >
          {!isFocusMode && (
            <>
              <div className="mb-12">
                 <div className="flex justify-between items-center mb-2">
                    <h2 className="text-3xl font-bold flex items-center text-primary">
                    <ListChecks className="w-8 h-8 mr-3" />
                    Select Your Allowed Apps
                    </h2>
                    {activeProfileId && (
                        <Button variant="outline" size="sm" onClick={() => { setActiveProfileId(null); setSelectedAppIds(new Set()); }}>
                            Clear Profile Selection
                        </Button>
                    )}
                </div>
                <p className="text-muted-foreground mb-6 text-lg">
                  {activeProfileId ? `Using "${customProfiles.find(p=>p.id === activeProfileId)?.name}" profile. You can still customize below.` : 'Choose which apps you want to access when Focus Mode is on.'}
                </p>
                {categories.map(category => (
                  <div key={category} className="mb-8 p-6 bg-card rounded-lg shadow-sm border">
                    <h3 className="text-2xl font-semibold mb-5 text-foreground">{category}</h3>
                    {renderAppGrid(USER_APPS_LIST.filter(app => (app.category || "Other") === category), false, selectedAppIds, handleToggleAppSelectionForPage)}
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
                    {renderAppGrid(SYSTEM_APPS_LIST, false, selectedAppIds, handleToggleAppSelectionForPage, true)}
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
                  renderAppGrid(whitelistedApps, true, selectedAppIds, () => {})
                ) : (
                  <p className="text-muted-foreground text-center py-6 text-lg">No apps whitelisted. Disable Focus Mode to select apps or activate a profile.</p>
                )}
              </div>
              <Separator className="my-8" />
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center text-primary">
                  <ShieldCheck className="w-8 h-8 mr-3" />
                  System Apps
                </h2>
                <p className="text-muted-foreground mb-6 text-lg">Essential system apps remain accessible.</p>
                {renderAppGrid(SYSTEM_APPS_LIST.filter(app => selectedAppIds.has(app.id) || app.isSystemApp), true, selectedAppIds, () => {}, true)}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Profile Creation/Editing Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingProfile ? `Edit Profile: ${editingProfile.name}` : 'Create New Profile'}
            </DialogTitle>
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
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveProfile}>
              <Save className="mr-2 h-4 w-4" /> Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Confirmation Dialog */}
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

      <footer className="text-center py-6 text-base text-muted-foreground border-t">
        FocusFlow &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
