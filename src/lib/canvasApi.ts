// Canvas LMS API client for frontend
import { useSettingsStore } from '@/features/settings/store';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface CanvasTokenResponse {
  success: boolean;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  canvas_domain: string;
}

export interface CanvasError {
  error: string;
  message: string;
  canvas_error?: any;
}

export class CanvasApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public canvasError?: any
  ) {
    super(message);
    this.name = 'CanvasApiError';
  }
}

/**
 * Exchange authorization code for access token via backend
 */
export async function exchangeCanvasToken(code: string, state?: string): Promise<CanvasTokenResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/canvas/token-exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new CanvasApiError(
        data.message || 'Failed to exchange token',
        response.status,
        data.canvas_error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof CanvasApiError) {
      throw error;
    }
    
    throw new CanvasApiError(
      'Network error during token exchange',
      0
    );
  }
}

/**
 * Refresh expired access token via backend
 */
export async function refreshCanvasToken(refreshToken: string): Promise<CanvasTokenResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/canvas/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new CanvasApiError(
        data.message || 'Failed to refresh token',
        response.status,
        data.canvas_error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof CanvasApiError) {
      throw error;
    }
    
    throw new CanvasApiError(
      'Network error during token refresh',
      0
    );
  }
}

/**
 * Make authenticated request to Canvas API
 */
async function makeCanvasRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const settings = useSettingsStore.getState();
  const { canvasAccessToken, canvasDomain } = settings;

  if (!canvasAccessToken || !canvasDomain) {
    throw new CanvasApiError('Canvas not connected. Please authenticate first.', 401);
  }

  const url = `${canvasDomain}/api/v1${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${canvasAccessToken}`,
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token might be expired, try to refresh
      const { canvasRefreshToken } = settings;
      if (canvasRefreshToken) {
        try {
          const tokenResponse = await refreshCanvasToken(canvasRefreshToken);
          settings.setCanvasTokens(
            tokenResponse.access_token,
            tokenResponse.refresh_token
          );
          
          // Retry the original request with new token
          return makeCanvasRequest(endpoint, options);
        } catch (refreshError) {
          // Refresh failed, user needs to re-authenticate
          settings.clearCanvasTokens();
          throw new CanvasApiError('Canvas authentication expired. Please reconnect.', 401);
        }
      } else {
        settings.clearCanvasTokens();
        throw new CanvasApiError('Canvas authentication expired. Please reconnect.', 401);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new CanvasApiError(
        errorData.message || `Canvas API error: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof CanvasApiError) {
      throw error;
    }
    
    throw new CanvasApiError(
      'Network error communicating with Canvas',
      0
    );
  }
}

/**
 * Get user's active courses
 */
export async function getCanvasCourses(): Promise<any[]> {
  return makeCanvasRequest('/courses?enrollment_state=active&per_page=100');
}

/**
 * Get assignments for a specific course
 */
export async function getCourseAssignments(courseId: string): Promise<any[]> {
  return makeCanvasRequest(`/courses/${courseId}/assignments?include[]=all_dates&per_page=100`);
}

/**
 * Get user's planner items (what's due)
 */
export async function getPlannerItems(startDate: string, endDate: string): Promise<any[]> {
  return makeCanvasRequest(`/planner/items?start_date=${startDate}&end_date=${endDate}`);
}

/**
 * Get calendar events
 */
export async function getCalendarEvents(
  startDate: string,
  endDate: string,
  contextCodes?: string[]
): Promise<any[]> {
  let endpoint = `/calendar_events?start_date=${startDate}&end_date=${endDate}&type=assignment`;
  
  if (contextCodes && contextCodes.length > 0) {
    contextCodes.forEach(code => {
      endpoint += `&context_codes[]=${code}`;
    });
  }
  
  return makeCanvasRequest(endpoint);
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<any> {
  return makeCanvasRequest('/users/self');
}