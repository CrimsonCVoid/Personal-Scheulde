# Canvas LMS Integration Backend

A comprehensive backend service for integrating with Canvas LMS API, providing full CRUD operations for course management, module organization, assignment handling, and student enrollment management.

## Features

### Core Functionality
- **Complete Canvas API Integration**: Full REST API v1 support with proper authentication
- **Module Management**: Create, update, delete, and reorder course modules
- **Assignment Management**: Handle due dates, bulk operations, and section overrides
- **Course Synchronization**: Automatic syncing with local caching for performance
- **Student Enrollment**: Manage course enrollments and track progress
- **Analytics & Reporting**: Progress tracking and performance analytics

### Technical Features
- **OAuth 2.0 Authentication**: Secure Canvas LMS integration
- **Rate Limiting**: Respects Canvas API limits with intelligent queuing
- **Local Caching**: SQLite database for offline access and performance
- **Job Queue**: Background processing for bulk operations
- **Comprehensive Logging**: Winston-based logging with rotation
- **Error Handling**: Robust error handling with retry mechanisms
- **Input Validation**: Joi and express-validator for data validation
- **Unit Testing**: Jest-based testing with >80% coverage

## Architecture

```
├── src/
│   ├── database/           # Database schema and migrations
│   ├── middleware/         # Express middleware (auth, validation, etc.)
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic and Canvas API integration
│   ├── utils/             # Utilities (logging, rate limiting, etc.)
│   └── server.js          # Main application entry point
├── tests/                 # Unit and integration tests
├── logs/                  # Application logs
└── data/                  # SQLite database files
```

## Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd canvas-backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Canvas configuration
   ```

3. **Set up database:**
   ```bash
   npm run migrate
   npm run seed  # Optional: seed with sample data
   ```

4. **Start the server:**
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

## API Documentation

### Authentication
All API endpoints (except `/api/auth/*`) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Courses
- `GET /api/courses` - List user's courses
- `GET /api/courses/:id` - Get specific course
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

#### Modules
- `GET /api/modules/:courseId` - List course modules
- `GET /api/modules/:courseId/:moduleId` - Get specific module
- `POST /api/modules/:courseId` - Create new module
- `PUT /api/modules/:courseId/:moduleId` - Update module
- `DELETE /api/modules/:courseId/:moduleId` - Delete module
- `POST /api/modules/:courseId/reorder` - Reorder modules

#### Module Items
- `POST /api/modules/:courseId/:moduleId/items` - Create module item
- `PUT /api/modules/:courseId/:moduleId/items/:itemId` - Update module item
- `DELETE /api/modules/:courseId/:moduleId/items/:itemId` - Delete module item

#### Assignments
- `GET /api/assignments/:courseId` - List course assignments
- `GET /api/assignments/:courseId/:assignmentId` - Get specific assignment
- `POST /api/assignments/:courseId` - Create new assignment
- `PUT /api/assignments/:courseId/:assignmentId` - Update assignment
- `DELETE /api/assignments/:courseId/:assignmentId` - Delete assignment
- `POST /api/assignments/:courseId/bulk-update-dates` - Bulk update due dates

#### Synchronization
- `POST /api/sync/courses` - Sync all courses
- `POST /api/sync/course/:courseId` - Sync specific course
- `GET /api/sync/status` - Get sync job status

### Request/Response Examples

#### Create Module
```bash
POST /api/modules/123
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Week 1: Introduction",
  "description": "Course introduction and overview",
  "position": 1,
  "unlock_at": "2024-01-15T00:00:00Z",
  "prerequisites": [],
  "requirement_count": {
    "type": "must_complete_all"
  }
}
```

#### Bulk Update Assignment Dates
```bash
POST /api/assignments/123/bulk-update-dates
Content-Type: application/json
Authorization: Bearer <token>

{
  "updates": [
    {
      "assignmentId": "456",
      "dueAt": "2024-02-15T23:59:59Z",
      "unlockAt": "2024-02-01T00:00:00Z",
      "lockAt": "2024-02-20T23:59:59Z"
    }
  ]
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CANVAS_DOMAIN` | Your Canvas LMS domain | Required |
| `CANVAS_CLIENT_ID` | Canvas Developer Key ID | Required |
| `CANVAS_CLIENT_SECRET` | Canvas Developer Key Secret | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `DATABASE_URL` | SQLite database path | `./data/canvas_integration.db` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `RATE_LIMIT_PER_SECOND` | Canvas API rate limit | `10` |
| `SYNC_INTERVAL_MINUTES` | Auto-sync interval | `30` |
| `LOG_LEVEL` | Logging level | `info` |

### Canvas Developer Key Setup

1. **Access Canvas Admin:**
   - Log into your Canvas instance as an administrator
   - Navigate to Admin → Developer Keys

2. **Create API Key:**
   - Click "+ Developer Key" → "+ API Key"
   - Fill in the required information:
     - **Key Name**: "Canvas Integration Backend"
     - **Redirect URI**: `http://localhost:3000/auth/canvas/callback`
     - **Scopes**: Select appropriate permissions for your use case

3. **Configure Environment:**
   - Copy the Client ID to `CANVAS_CLIENT_ID`
   - Copy the Client Secret to `CANVAS_CLIENT_SECRET`
   - Set `CANVAS_DOMAIN` to your Canvas instance URL

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Requirements
- Minimum 80% code coverage
- Unit tests for all services and utilities
- Integration tests for API endpoints
- Mock Canvas API responses for consistent testing

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT secret
- [ ] Set up Redis for job queue
- [ ] Configure log rotation
- [ ] Set up monitoring and alerting
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up SSL/TLS certificates
- [ ] Configure database backups

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring and Logging

### Log Levels
- `error`: System errors and Canvas API failures
- `warn`: Rate limiting and token expiration warnings
- `info`: Request logging and sync operations
- `debug`: Detailed Canvas API interactions

### Metrics to Monitor
- Canvas API response times
- Rate limit utilization
- Sync job success/failure rates
- Database query performance
- Memory and CPU usage

## Security Considerations

- **Token Security**: Canvas access tokens are encrypted at rest
- **Rate Limiting**: Prevents API abuse and respects Canvas limits
- **Input Validation**: All inputs validated and sanitized
- **CORS Configuration**: Restricted to allowed origins
- **Audit Logging**: All operations logged for compliance
- **Error Handling**: Sensitive information not exposed in errors

## Troubleshooting

### Common Issues

1. **Canvas API Rate Limiting**
   - Check rate limiter configuration
   - Monitor API usage patterns
   - Implement exponential backoff

2. **Token Expiration**
   - Implement automatic token refresh
   - Monitor token expiration times
   - Provide clear error messages

3. **Sync Failures**
   - Check Canvas API connectivity
   - Verify user permissions
   - Review error logs for specific failures

### Debug Mode
Set `LOG_LEVEL=debug` to enable detailed logging of Canvas API interactions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.