import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useSettingsStore } from '@/features/settings/store';
import { exchangeCanvasToken, getCurrentUser, CanvasApiError } from '@/lib/canvasApi';
import { importCanvasData } from '@/lib/canvasDataProcessor';
import { toast } from 'sonner';

export default function CanvasOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCanvasTokens, setCanvasUser, canvasDomain } = useSettingsStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle Canvas OAuth errors
        if (error) {
          throw new Error(errorDescription || `Canvas OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Canvas');
        }

        setStatus('loading');

        // Exchange code for access token via backend
        console.log('Exchanging authorization code for access token...');
        const tokenResponse = await exchangeCanvasToken(code, state || undefined);

        // Store tokens and domain
        setCanvasTokens(
          tokenResponse.access_token,
          tokenResponse.refresh_token,
          tokenResponse.expires_in
        );

        // If domain wasn't set before, set it now
        if (!canvasDomain && tokenResponse.canvas_domain) {
          useSettingsStore.getState().setCanvasDomain(tokenResponse.canvas_domain);
        }

        // Fetch and store user information
        console.log('Fetching Canvas user information...');
        const user = await getCurrentUser();
        setCanvasUser(user);

        // Import Canvas data automatically after successful connection
        console.log('Importing Canvas data...');
        await importCanvasData();
        setStatus('success');
        toast.success(`Successfully connected to Canvas as ${user.name}`);

        // Redirect to settings page after a short delay
        setTimeout(() => {
          navigate('/settings', { replace: true });
        }, 2000);

      } catch (error) {
        console.error('Canvas OAuth callback error:', error);
        
        let errorMessage = 'Failed to connect to Canvas';
        
        if (error instanceof CanvasApiError) {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        setStatus('error');
        toast.error(errorMessage);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setCanvasTokens, setCanvasUser, canvasDomain]);

  const handleRetry = () => {
    navigate('/settings', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin text-blue-600" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
            
            {status === 'loading' && 'Connecting to Canvas...'}
            {status === 'success' && 'Successfully Connected!'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && 'Please wait while we complete the Canvas LMS integration.'}
            {status === 'success' && 'Your Canvas LMS account has been successfully connected. Redirecting...'}
            {status === 'error' && 'There was an issue connecting to your Canvas LMS account.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status === 'loading' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Exchanging authorization code...
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                Fetching user information...
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                Completing setup...
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-sm text-muted-foreground">
                You can now import assignments and due dates from Canvas LMS.
              </div>
              <Button onClick={() => navigate('/settings')} className="w-full">
                Go to Settings
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Settings
                </Button>
                <Button onClick={() => window.location.reload()} className="flex-1">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}