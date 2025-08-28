@@ .. @@
-  return (
-    <div className="h-screen flex flex-col bg-background">
-      <Header />
-      <div className="flex-1 flex overflow-hidden">
-        <Sidebar />
-        <main className="flex-1 overflow-auto">
-          <Outlet />
-        </main>
-      </div>
-      <Toaster position="top-right" />
-    </div>
-  );
+  return (
+    <div className="w-screen h-screen min-h-[100vh] flex flex-col bg-background">
+      <Header />
+      <div className="flex-1 flex overflow-hidden">
+        <Sidebar />
+        <main className="flex-1 overflow-auto">
+          <Outlet />
+        </main>
+      </div>
+      <Toaster position="top-right" />
+    </div>
+  );
 }