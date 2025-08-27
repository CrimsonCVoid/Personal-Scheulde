import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/features/settings/store';
import { Sun, Moon, Monitor, Download, Upload, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { 
    theme, 
    timeFormat, 
    weekStartsOn, 
    slotSize,
    setTheme,
    setTimeFormat,
    setWeekStartsOn,
    setSlotSize
  } = useSettingsStore();

  const handleExportData = () => {
    try {
      const data = {
        events: JSON.parse(localStorage.getItem('events-storage') || '{}'),
        tasks: JSON.parse(localStorage.getItem('tasks-storage') || '{}'),
        availability: JSON.parse(localStorage.getItem('availability-storage') || '{}'),
        settings: JSON.parse(localStorage.getItem('settings-storage') || '{}'),
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Restore data to localStorage
        if (data.events) localStorage.setItem('events-storage', JSON.stringify(data.events));
        if (data.tasks) localStorage.setItem('tasks-storage', JSON.stringify(data.tasks));
        if (data.availability) localStorage.setItem('availability-storage', JSON.stringify(data.availability));
        if (data.settings) localStorage.setItem('settings-storage', JSON.stringify(data.settings));

        toast.success('Data imported successfully. Please refresh the page.');
      } catch (error) {
        toast.error('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your scheduling app experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <div className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </div>
              </div>
              <Select 
                value={theme.mode} 
                onValueChange={(value: 'light' | 'dark' | 'system') => setTheme({ mode: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduced motion</Label>
                <div className="text-sm text-muted-foreground">
                  Disable animations and transitions
                </div>
              </div>
              <Switch
                checked={theme.reducedMotion}
                onCheckedChange={(checked) => setTheme({ reducedMotion: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Calendar Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar Settings</CardTitle>
            <CardDescription>
              Configure how your calendar displays and behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Time format</Label>
                <div className="text-sm text-muted-foreground">
                  Display times in 12-hour or 24-hour format
                </div>
              </div>
              <Select 
                value={timeFormat} 
                onValueChange={setTimeFormat}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12h</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Week starts on</Label>
                <div className="text-sm text-muted-foreground">
                  Choose the first day of the week
                </div>
              </div>
              <Select 
                value={weekStartsOn.toString()} 
                onValueChange={(value) => setWeekStartsOn(parseInt(value) as 0 | 1)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Time slot duration</Label>
                <div className="text-sm text-muted-foreground">
                  Default duration for calendar time slots
                </div>
              </div>
              <Select 
                value={slotSize.toString()} 
                onValueChange={(value) => setSlotSize(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Export or import your calendar data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleExportData} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-data"
                />
                <Button variant="outline" className="w-full" asChild>
                  <label htmlFor="import-data" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </label>
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Export your data to create a backup or import previously exported data.
            </p>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <div className="text-sm text-muted-foreground mt-1">
                  {localStorage.getItem('user-email') || 'john@example.com'}
                </div>
              </div>
              <Separator />
              <div className="pt-2">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}