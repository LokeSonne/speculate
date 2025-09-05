# Mock API Setup with MSW

This project uses [Mock Service Worker (MSW)](https://mswjs.io/) to provide a mock API for development and testing without requiring a real Supabase database.

## Features

- **Complete API Mocking**: All Supabase endpoints are mocked
- **Realistic Data**: Pre-populated with sample feature specs and change requests
- **Realistic Delays**: Simulates network latency
- **Easy Toggle**: Enable/disable via environment variable

## Setup

### 1. Environment Configuration

Create a `.env.local` file with:

```bash
# Enable mock API
VITE_USE_MOCK_API=true

# Optional: Supabase credentials (not needed for mock mode)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 2. Mock Data

The mock API includes:

- **2 Sample Users**: John Doe and Jane Smith
- **1 Sample Feature Spec**: "User Dashboard" with complete data
- **1 Sample Change Request**: Dark mode suggestion with comment

### 3. Available Endpoints

All Supabase endpoints are mocked:

#### Authentication

- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/token` - User login
- `POST /auth/v1/logout` - User logout
- `POST /auth/v1/recover` - Password reset
- `GET /auth/v1/user` - Get current user
- `PUT /auth/v1/user` - Update user profile

#### Feature Specs

- `GET /rest/v1/feature_specs` - List all specs
- `POST /rest/v1/feature_specs` - Create new spec
- `PATCH /rest/v1/feature_specs` - Update spec
- `DELETE /rest/v1/feature_specs` - Delete spec

#### Change Requests

- `GET /rest/v1/change_requests` - List change requests
- `POST /rest/v1/change_requests` - Create change request
- `PATCH /rest/v1/change_requests` - Update change request
- `DELETE /rest/v1/change_requests` - Delete change request

#### Change Request Comments

- `GET /rest/v1/change_request_comments` - List comments
- `POST /rest/v1/change_request_comments` - Add comment

## Usage

### Development

```bash
# Start with mock API
VITE_USE_MOCK_API=true pnpm dev
```

### Testing

```bash
# Run tests with mock API
VITE_USE_MOCK_API=true pnpm test
```

### Production

```bash
# Use real Supabase
VITE_USE_MOCK_API=false pnpm build
```

## Mock Data Structure

The mock data includes realistic sample data that demonstrates all features:

- **Feature Specs**: Complete specifications with all sections
- **Change Requests**: Various types (suggestion, issue, question, improvement)
- **Comments**: Threaded discussions on change requests
- **Users**: Multiple users for testing collaboration

## Authentication Features

The mock API includes a complete authentication system:

### Auto-Login

- **Automatic Login**: Automatically logs in as `john@example.com` when mock mode is enabled
- **Test Users**: Pre-configured users (John Doe, Jane Smith) with password `password123`
- **Session Management**: Proper JWT token handling and session persistence
- **Persistent Sessions**: Sessions survive page refreshes using localStorage

### Authentication Status Widget

- **Development Panel**: Shows current authentication status in development mode
- **Quick Login**: Buttons to quickly switch between test users
- **User Management**: Create new test users on the fly

### Available Test Users

- **john@example.com** - John Doe (Primary user)
- **jane@example.com** - Jane Smith (Secondary user)
- **Password**: `password123` for all test users

### Authentication Flow

1. **Sign Up**: Create new users with email/password
2. **Sign In**: Login with existing credentials
3. **Session**: Automatic token management
4. **Protected Routes**: All API endpoints require authentication
5. **Sign Out**: Proper session cleanup

### Response Format

The MSW handlers return responses in the exact format Supabase expects:

- **Token Response**: Returns `access_token`, `refresh_token`, `expires_in`, etc. as separate fields
- **User Data**: Includes complete user object with metadata
- **Session Management**: Proper JWT token structure for Supabase client compatibility

## Troubleshooting

### URL Construction Error

If you see `Failed to construct 'URL': Invalid URL` error, it means the Supabase client is trying to create a URL with empty environment variables. This is fixed by:

1. Setting `VITE_USE_MOCK_API=true` in your environment
2. The Supabase client will use dummy values when mock mode is enabled

### Environment Variables

Make sure your `.env.local` file contains:

```bash
VITE_USE_MOCK_API=true
```

You don't need to set `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` when using mock mode.

### Session Persistence Issues

If you lose authentication after page refresh:

1. **Check localStorage**: Open DevTools → Application → Local Storage
2. **Look for key**: `supabase.auth.token` should contain session data
3. **Clear and retry**: If corrupted, clear localStorage and sign in again
4. **Console logs**: Look for `🔄 Restoring session from localStorage` message

### Session Storage

The mock API stores sessions in:

- **Memory**: Active sessions during runtime
- **localStorage**: Persistent storage across page refreshes
- **Key**: `supabase.auth.token` in localStorage

## Benefits

1. **No Database Setup**: Develop without Supabase configuration
2. **Consistent Data**: Same data every time for reliable testing
3. **Fast Development**: No network calls, instant responses
4. **Easy Testing**: Predictable data for automated tests
5. **Offline Development**: Works without internet connection

## Switching Between Mock and Real API

Simply change the `VITE_USE_MOCK_API` environment variable:

- `true` - Use Mock Service Worker
- `false` - Use real Supabase API

The application will automatically detect the setting and use the appropriate API.
