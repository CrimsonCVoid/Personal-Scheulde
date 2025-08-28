import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  RefreshCw, 
  Download, 
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useSettingsStore } from '@/features/settings/store';
import { importCanvasData, getCanvasImportStats } from '@/lib/canvasDataProcessor';
import WeightedModulesView from '@/components/canvas/WeightedModulesView';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function CanvasModulesPage() {
  const { isCanvasConnected, canvasUser, canvasDomain } = useSettingsStore();
  const [isImporting, setIsImporting] = useState(false);
  
  const importStats = getCanvasImportStats();

  const handleImportData = async () => {
    if (!isCanvasConnected()) {
      toast.error('Please connect to Canvas LMS first');
      return;
    }

    setIsImporting(true);
    try {
      const stats = await importCanvasData();
      toast.success(
        `Successfully imported ${stats.assignmentsImported} assignments from ${stats.coursesProcessed} courses`
      );
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import Canvas data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportData = () => {
    try {
      const canvasEvents = useEventsStore.getState().events.filter(e => e.canvasId);
      const exportData = {
        events: canvasEvents,
        stats: importStats,
        exportedAt: new Date().toISOString(),
        canvasDomain,
        user: canvasUser?.name
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `canvas-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Canvas data exported successfully');
    } catch (error) {
      toast.error('Failed to export Canvas data');
    }
  };

  if (!isCanvasConnected()) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Canvas LMS Integration</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your Canvas LMS account to import course modules, assignments, and due dates directly into your calendar.
          </p>
          <Button asChild>
            <a href="/settings">
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect to Canvas LMS
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <motion.div 
        className="p-6 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Canvas Modules & Assignments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your Canvas course content and weighted assignments
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleImportData} disabled={isImporting}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isImporting ? 'animate-spin' : ''}`} />
            {isImporting ? 'Importing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <div className="font-medium text-green-800 dark:text-green-200">
                Connected to Canvas LMS
              </div>
              <div className="text-sm text-green-600 dark:text-green-300">
                {canvasUser?.name} • {canvasDomain}
              </div>
            </div>
            {importStats.lastImportDate && (
              <div className="text-right text-sm text-muted-foreground">
                Last sync: {new Date(parseInt(importStats.lastImportDate)).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="weighted" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weighted" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Weighted Assignments
            {importStats.weightedAssignments > 0 && (
              <Badge className="ml-1">{importStats.weightedAssignments}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">
            All Canvas Items
            {importStats.totalCanvasEvents > 0 && (
              <Badge variant="secondary" className="ml-1">{importStats.totalCanvasEvents}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendar">
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weighted">
          <WeightedModulesView />
        </TabsContent>

        <TabsContent value="all">
          <WeightedModulesView />
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Canvas Calendar Integration
              </CardTitle>
              <CardDescription>
                Your Canvas assignments and events are automatically synced to your main calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Canvas events are integrated into your main calendar view
                </p>
                <Button asChild>
                  <a href="/calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </motion.div>
    </div>
  );
}