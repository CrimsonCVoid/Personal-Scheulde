const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Canvas OAuth token exchange endpoint
app.post('/api/canvas/token-exchange', async (req, res) => {
  try {
    const { code, state } = req.body;

    // Validate required parameters
    if (!code) {
      return res.status(400).json({
        error: 'Missing authorization code',
        message: 'The authorization code is required for token exchange'
      });
    }

    // Validate environment variables
    const requiredEnvVars = [
      'CANVAS_DOMAIN',
      'CANVAS_CLIENT_ID',
      'CANVAS_CLIENT_SECRET',
      'CANVAS_REDIRECT_URI'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        return res.status(500).json({
          error: 'Server configuration error',
          message: 'Canvas integration is not properly configured'
        });
      }
    }

    // Prepare token exchange request
    const tokenUrl = `${process.env.CANVAS_DOMAIN}/login/oauth2/token`;
    const tokenData = {
      grant_type: 'authorization_code',
      client_id: process.env.CANVAS_CLIENT_ID,
      client_secret: process.env.CANVAS_CLIENT_SECRET,
      redirect_uri: process.env.CANVAS_REDIRECT_URI,
      code: code
    };

    console.log('Exchanging authorization code for access token...');
    console.log('Token URL:', tokenUrl);
    console.log('Client ID:', process.env.CANVAS_CLIENT_ID);
    console.log('Redirect URI:', process.env.CANVAS_REDIRECT_URI);

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(tokenUrl, tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    const { access_token, refresh_token, expires_in, token_type } = tokenResponse.data;

    if (!access_token) {
      throw new Error('No access token received from Canvas');
    }

    // Optionally, fetch user info to validate the token
    try {
      const userResponse = await axios.get(`${process.env.CANVAS_DOMAIN}/api/v1/users/self`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        },
        timeout: 5000
      });

      console.log('Token validated successfully for user:', userResponse.data.name);
    } catch (userError) {
      console.warn('Could not validate token with user info:', userError.message);
      // Continue anyway, as the token might still be valid
    }

    // Return the access token and related info to the frontend
    res.json({
      success: true,
      access_token,
      refresh_token,
      expires_in,
      token_type: token_type || 'Bearer',
      canvas_domain: process.env.CANVAS_DOMAIN
    });

  } catch (error) {
    console.error('Canvas token exchange error:', error);

    // Handle specific Canvas API errors
    if (error.response) {
      const { status, data } = error.response;
      console.error('Canvas API Error Response:', {
        status,
        data,
        headers: error.response.headers
      });

      return res.status(status).json({
        error: 'Canvas API error',
        message: data.error_description || data.error || 'Failed to exchange authorization code',
        canvas_error: data
      });
    }

    // Handle network/timeout errors
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'Canvas API request timed out. Please try again.'
      });
    }

    // Handle other errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during token exchange'
    });
  }
});

// Canvas token refresh endpoint (for when tokens expire)
app.post('/api/canvas/refresh-token', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Missing refresh token',
        message: 'A refresh token is required to obtain a new access token'
      });
    }

    const tokenUrl = `${process.env.CANVAS_DOMAIN}/login/oauth2/token`;
    const tokenData = {
      grant_type: 'refresh_token',
      client_id: process.env.CANVAS_CLIENT_ID,
      client_secret: process.env.CANVAS_CLIENT_SECRET,
      refresh_token: refresh_token
    };

    const tokenResponse = await axios.post(tokenUrl, tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const { access_token, refresh_token: new_refresh_token, expires_in } = tokenResponse.data;

    res.json({
      success: true,
      access_token,
      refresh_token: new_refresh_token || refresh_token,
      expires_in
    });

  } catch (error) {
    console.error('Canvas token refresh error:', error);

    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json({
        error: 'Canvas API error',
        message: data.error_description || 'Failed to refresh token',
        canvas_error: data
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during token refresh'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Canvas OAuth backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Canvas domain: ${process.env.CANVAS_DOMAIN || 'Not configured'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});