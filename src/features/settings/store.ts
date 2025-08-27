@@ .. @@
 interface SettingsState {
   theme: Theme;
   timeFormat: '12h' | '24h';
   weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
   slotSize: number; // minutes
+  
+  // Canvas LMS Integration
+  canvasDomain?: string;
+  canvasAccessToken?: string;
+  canvasRefreshToken?: string;
+  canvasTokenExpiresAt?: number;
+  canvasUser?: any;
   
   // Actions
   setTheme: (theme: Partial<Theme>) => void;
   setTimeFormat: (format: '12h' | '24h') => void;
   setWeekStartsOn: (day: 0 | 1) => void;
   setSlotSize: (size: number) => void;
+  
+  // Canvas Actions
+  setCanvasDomain: (domain: string) => void;
+  setCanvasTokens: (accessToken: string, refreshToken?: string, expiresIn?: number) => void;
+  setCanvasUser: (user: any) => void;
+  clearCanvasTokens: () => void;
+  isCanvasConnected: () => boolean;
 }

@@ .. @@
       timeFormat: '12h',
       weekStartsOn: 1,
       slotSize: 15,
+      
+      // Canvas defaults
+      canvasDomain: undefined,
+      canvasAccessToken: undefined,
+      canvasRefreshToken: undefined,
+      canvasTokenExpiresAt: undefined,
+      canvasUser: undefined,

       setTheme: (themeUpdates) => {
@@ .. @@
       setSlotSize: (size) => set({ slotSize: size }),
+      
+      setCanvasDomain: (domain) => set({ canvasDomain: domain }),
+      
+      setCanvasTokens: (accessToken, refreshToken, expiresIn) => {
+        const expiresAt = expiresIn 
+          ? Date.now() + (expiresIn * 1000) 
+          : undefined;
+          
+        set({ 
+          canvasAccessToken: accessToken,
+          canvasRefreshToken: refreshToken,
+          canvasTokenExpiresAt: expiresAt
+        });
+      },
+      
+      setCanvasUser: (user) => set({ canvasUser: user }),
+      
+      clearCanvasTokens: () => set({ 
+        canvasAccessToken: undefined,
+        canvasRefreshToken: undefined,
+        canvasTokenExpiresAt: undefined,
+        canvasUser: undefined
+      }),
+      
+      isCanvasConnected: () => {
+        const state = get();
+        return !!(state.canvasAccessToken && state.canvasDomain);
+      },
     }),
     {
       name: 'settings-storage',