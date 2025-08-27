@@ .. @@
 import { Separator } from '@/components/ui/separator';
 import { useSettingsStore } from '@/features/settings/store';
-import { Sun, Moon, Monitor, Download, Upload, Palette } from 'lucide-react';
+import { Sun, Moon, Monitor, Download, Upload, Palette, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
 import { toast } from 'sonner';

 export default function SettingsPage() {
   const { 
     theme, 
     timeFormat, 
     weekStartsOn, 
     slotSize,
+    canvasDomain,
+    canvasUser,
+    isCanvasConnected,
+    setCanvasDomain,
+    clearCanvasTokens,
     setTheme,
     setTimeFormat,
     setWeekStartsOn,
     setSlotSize
   } = useSettingsStore();

+  const handleConnectCanvas = () => {
+    if (!canvasDomain) {
+      toast.error('Please enter your Canvas domain first');
+      return;
+    }
+
+    // Construct Canvas OAuth URL
+    const clientId = import.meta.env.VITE_CANVAS_CLIENT_ID;
+    const redirectUri = `${window.location.origin}/oauth/canvas/callback`;
+    const state = crypto.randomUUID(); // Generate random state for security
+    
+    if (!clientId) {
+      toast.error('Canvas integration is not configured. Please check your environment variables.');
+      return;
+    }
+
+    const authUrl = new URL(`${canvasDomain}/login/oauth2/auth`);
+    authUrl.searchParams.set('client_id', clientId);
+    authUrl.searchParams.set('response_type', 'code');
+    authUrl.searchParams.set('redirect_uri', redirectUri);
+    authUrl.searchParams.set('state', state);
+    authUrl.searchParams.set('scope', 'url:GET|/api/v1/courses url:GET|/api/v1/courses/:course_id/assignments url:GET|/api/v1/planner/items url:GET|/api/v1/calendar_events url:GET|/api/v1/users/self');
+
+    // Store state in sessionStorage for validation
+    sessionStorage.setItem('canvas_oauth_state', state);
+
+    // Redirect to Canvas for authorization
+    window.location.href = authUrl.toString();
+  };
+
+  const handleDisconnectCanvas = () => {
+    clearCanvasTokens();
+    toast.success('Disconnected from Canvas LMS');
+  };

   const handleExportData = () => {
@@ .. @@
         </Card>

+        {/* Canvas LMS Integration */}
+        <Card>
+          <CardHeader>
+            <CardTitle className="flex items-center gap-2">
+              <ExternalLink className="h-5 w-5" />
+              Canvas LMS Integration
+            </CardTitle>
+            <CardDescription>
+              Connect your Canvas LMS account to import assignments and due dates
+            </CardDescription>
+          </CardHeader>
+          <CardContent className="space-y-6">
+            {!isCanvasConnected() ? (
+              <>
+                <div className="space-y-2">
+                  <Label htmlFor="canvas-domain">Canvas Domain</Label>
+                  <Input
+                    id="canvas-domain"
+                    type="url"
+                    placeholder="https://yourdomain.instructure.com"
+                    value={canvasDomain || ''}
+                    onChange={(e) => setCanvasDomain(e.target.value)}
+                  />
+                  <p className="text-sm text-muted-foreground">
+                    Enter your Canvas LMS domain (e.g., https://canvas.university.edu)
+                  </p>
+                </div>
+                
+                <Button onClick={handleConnectCanvas} className="w-full">
+                  <ExternalLink className="h-4 w-4 mr-2" />
+                  Connect to Canvas LMS
+                </Button>
+              </>
+            ) : (
+              <div className="space-y-4">
+                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
+                  <CheckCircle className="h-5 w-5 text-green-600" />
+                  <div className="flex-1">
+                    <div className="font-medium text-green-800 dark:text-green-200">
+                      Connected to Canvas LMS
+                    </div>
+                    <div className="text-sm text-green-600 dark:text-green-300">
+                      {canvasUser?.name} • {canvasDomain}
+                    </div>
+                  </div>
+                </div>
+                
+                <div className="flex gap-2">
+                  <Button variant="outline" onClick={handleDisconnectCanvas} className="flex-1">
+                    Disconnect
+                  </Button>
+                  <Button variant="outline" className="flex-1">
+                    Import Assignments
+                  </Button>
+                </div>
+              </div>
+            )}
+            
+            <div className="text-sm text-muted-foreground">
+              <p className="mb-2">Canvas integration allows you to:</p>
+              <ul className="list-disc list-inside space-y-1 ml-2">
+                <li>Import assignment due dates as calendar events</li>
+                <li>Sync course schedules and deadlines</li>
+                <li>View upcoming assignments in your dashboard</li>
+                <li>Get notifications for Canvas deadlines</li>
+              </ul>
+            </div>
+          </CardContent>
+        </Card>
+
         {/* Data Management */}
         <Card>