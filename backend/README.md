# Canvas OAuth Backend Service

This backend service handles the secure OAuth 2.0 token exchange with Canvas LMS, keeping your client secret safe from client-side exposure.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your Canvas LMS configuration:
   - `CANVAS_DOMAIN`: Your Canvas instance URL (e.g., `https://yourdomain.instructure.com`)
   - `CANVAS_CLIENT_ID`: Your Canvas Developer Key ID
   - `CANVAS_CLIENT_SECRET`: Your Canvas Developer Key Secret
   - `CANVAS_REDIRECT_URI`: Must match what you configured in Canvas (e.g., `http://localhost:5173/oauth/canvas/callback`)

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### POST `/api/canvas/token-exchange`
Exchanges an authorization code for an access token.

**Request Body:**
```json
{
  "code": "authorization_code_from_canvas",
  "state": "optional_state_parameter"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "canvas_access_token",
  "refresh_token": "canvas_refresh_token",
  "expires_in": 3600,
  "token_type": "Bearer",
  "canvas_domain": "https://yourdomain.instructure.com"
}
```

### POST `/api/canvas/refresh-token`
Refreshes an expired access token.

**Request Body:**
```json
{
  "refresh_token": "canvas_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "new_canvas_access_token",
  "refresh_token": "new_or_same_refresh_token",
  "expires_in": 3600
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## Security Considerations

- **Client Secret Protection**: The Canvas client secret is stored securely on the backend and never exposed to the frontend.
- **CORS Configuration**: The server only accepts requests from your configured frontend URL.
- **Environment Variables**: All sensitive configuration is stored in environment variables.
- **Error Handling**: Detailed error information is logged server-side but sanitized responses are sent to the client.

## Production Deployment

For production deployment:

1. **Environment Variables**: Set all required environment variables in your production environment.
2. **HTTPS**: Ensure your backend is served over HTTPS.
3. **CORS**: Update `FRONTEND_URL` to match your production frontend domain.
4. **Canvas Configuration**: Update your Canvas Developer Key redirect URI to match your production callback URL.
5. **Process Management**: Use a process manager like PM2 or deploy to a platform like Heroku, Railway, or Vercel.

## Troubleshooting

- **"Missing required environment variable"**: Ensure all variables in `.env.example` are set in your `.env` file.
- **CORS errors**: Verify that `FRONTEND_URL` matches your frontend's actual URL.
- **Canvas API errors**: Check that your Canvas Developer Key is properly configured and active.
- **Token validation fails**: Ensure your Canvas domain is correct and accessible.