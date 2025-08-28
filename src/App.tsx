@@ .. @@
-import './App.css';
+import { useEffect, useState } from 'react';
+import { Button } from '@/components/ui/button';
+import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
+import { BookOpen, Calendar, CheckCircle2, Clock, Users } from 'lucide-react';
+import { motion } from 'framer-motion';
+import { useSettingsStore } from '@/features/settings/store';
+import { RouterProvider } from 'react-router-dom';
+import { router } from './app/routes';
 
 function App() {
+  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
+  const { isCanvasConnected, canvasUser } = useSettingsStore();
+
+  useEffect(() => {
+    // Check authentication status
+    const checkAuth = async () => {
+      // Simulate auth check delay
+      await new Promise(resolve => setTimeout(resolve, 500));
+      setIsCheckingAuth(false);
+    };
+    checkAuth();
+  }, []);
+
+  const handleConnectCanvas = () => {
+    // Redirect to backend OAuth endpoint
+    window.location.href = '/auth/login';
+  };
+
+  // Show loading state while checking authentication
+  if (isCheckingAuth) {
+    return (
+      <div className="w-screen h-screen min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
+        <div className="flex items-center gap-3">
+          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
+          <span className="text-lg font-medium">Loading...</span>
+        </div>
+      </div>
+    );
+  }
+
+  // Show Canvas connection page if not authenticated
+  if (!isCanvasConnected()) {
+    return (
+      <div className="w-screen h-screen min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
+        <motion.div
+          initial={{ opacity: 0, y: 20 }}
+          animate={{ opacity: 1, y: 0 }}
+          transition={{ duration: 0.6 }}
+          className="w-full max-w-2xl"
+        >
+          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
+            <CardHeader className="text-center pb-8">
+              <motion.div
+                initial={{ scale: 0 }}
+                animate={{ scale: 1 }}
+                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
+                className="flex items-center justify-center mb-6"
+              >
+                <div className="relative">
+                  <BookOpen className="h-16 w-16 text-primary" />
+                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
+                    <Calendar className="h-3 w-3 text-white" />
+                  </div>
+                </div>
+              </motion.div>
+              <CardTitle className="text-3xl font-bold mb-2">
+                Connect to Canvas LMS
+              </CardTitle>
+              <CardDescription className="text-lg">
+                Import your course assignments, modules, and due dates directly into your personal calendar
+              </CardDescription>
+            </CardHeader>
+            
+            <CardContent className="space-y-8">
+              {/* Features Grid */}
+              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
+                <motion.div
+                  initial={{ opacity: 0, y: 20 }}
+                  animate={{ opacity: 1, y: 0 }}
+                  transition={{ delay: 0.3 }}
+                  className="text-center"
+                >
+                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
+                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
+                  </div>
+                  <h3 className="font-semibold mb-2">Assignment Sync</h3>
+                  <p className="text-sm text-muted-foreground">
+                    Automatically import all your Canvas assignments with due dates
+                  </p>
+                </motion.div>
+                
+                <motion.div
+                  initial={{ opacity: 0, y: 20 }}
+                  animate={{ opacity: 1, y: 0 }}
+                  transition={{ delay: 0.4 }}
+                  className="text-center"
+                >
+                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
+                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
+                  </div>
+                  <h3 className="font-semibold mb-2">Weighted Tracking</h3>
+                  <p className="text-sm text-muted-foreground">
+                    Visual indicators for weighted assignments that affect your grades
+                  </p>
+                </motion.div>
+                
+                <motion.div
+                  initial={{ opacity: 0, y: 20 }}
+                  animate={{ opacity: 1, y: 0 }}
+                  transition={{ delay: 0.5 }}
+                  className="text-center"
+                >
+                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
+                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
+                  </div>
+                  <h3 className="font-semibold mb-2">Smart Reminders</h3>
+                  <p className="text-sm text-muted-foreground">
+                    Get notified before important deadlines and exams
+                  </p>
+                </motion.div>
+              </div>

+              {/* Connect Button */}
+              <motion.div
+                initial={{ opacity: 0, scale: 0.9 }}
+                animate={{ opacity: 1, scale: 1 }}
+                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
+                className="text-center"
+              >
+                <Button 
+                  onClick={handleConnectCanvas}
+                  size="lg"
+                  className="w-full max-w-md mx-auto h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
+                >
+                  <BookOpen className="h-6 w-6 mr-3" />
+                  Connect to Canvas LMS
+                </Button>
+                
+                <p className="text-sm text-muted-foreground mt-4">
+                  Secure OAuth 2.0 authentication • Your credentials are never stored
+                </p>
+              </motion.div>

+              {/* Benefits List */}
+              <motion.div
+                initial={{ opacity: 0 }}
+                animate={{ opacity: 1 }}
+                transition={{ delay: 0.7 }}
+                className="bg-muted/30 rounded-lg p-6"
+              >
+                <h4 className="font-semibold mb-4 flex items-center gap-2">
+                  <Users className="h-5 w-5 text-primary" />
+                  What you'll get:
+                </h4>
+                <ul className="space-y-2 text-sm">
+                  <li className="flex items-center gap-2">
+                    <CheckCircle2 className="h-4 w-4 text-green-600" />
+                    All course assignments and due dates
+                  </li>
+                  <li className="flex items-center gap-2">
+                    <CheckCircle2 className="h-4 w-4 text-green-600" />
+                    Weighted assignment tracking with visual indicators
+                  </li>
+                  <li className="flex items-center gap-2">
+                    <CheckCircle2 className="h-4 w-4 text-green-600" />
+                    Course modules and learning objectives
+                  </li>
+                  <li className="flex items-center gap-2">
+                    <CheckCircle2 className="h-4 w-4 text-green-600" />
+                    Automatic calendar integration and reminders
+                  </li>
+                </ul>
+              </motion.div>
+            </CardContent>
+          </Card>
+        </motion.div>
+      </div>
+    );
+  }

+  // Show main application if authenticated
   return (
-    <>
-      <div>Start prompting.</div>
-    </>
+    <div className="w-screen h-screen min-h-[100vh]">
+      <RouterProvider router={router} />
+    </div>
   );
 }