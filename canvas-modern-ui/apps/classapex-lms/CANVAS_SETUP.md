# Canvas LMS GraphQL Setup Guide

This guide helps you connect the ClassApex LMS frontend to a Canvas LMS GraphQL API.

## Quick Start

1. **Start Canvas LMS** (if you have it running locally)
2. **Configure Environment** - Copy `.env.example` to `.env` and update:
   ```bash
   cp .env.example .env
   ```
3. **Update GraphQL Endpoint** in `.env`:
   ```env
   VITE_GRAPHQL_ENDPOINT=/api/graphql
   ```
   (Uses Vite proxy to avoid CORS issues)
4. **Start the Frontend**:
   ```bash
   npm run dev
   ```

## Connection Status

The Dashboard will show:
- ✅ **Green notification**: Connected to Canvas LMS GraphQL API
- ❌ **Red notification**: Connection failed (using mock data)
- 🔄 **Blue notification**: Checking connection...

## Troubleshooting

### Connection Refused (ERR_CONNECTION_REFUSED)

This means Canvas LMS is not running or not accessible:

1. **Check Canvas LMS is running**:
   ```bash
   # If using Docker
   docker ps | grep canvas
   
   # If running locally
   ps aux | grep canvas
   ```

2. **Verify the GraphQL endpoint**:
   - Visit `http://localhost:3000/api/graphql` in your browser
   - You should see a GraphQL playground or schema introspection

3. **Check the port**:
   - Canvas LMS typically runs on port 3000
   - Update `.env` if your Canvas runs on a different port

### CORS Issues

**✅ CORS is automatically handled** by the Vite development proxy.

The app uses `/api/graphql` which is proxied to `http://localhost:3000/api/graphql` to avoid CORS issues.

If you still get CORS errors:

1. **Restart the development server** after changing `.env`
2. **Check Canvas LMS is running** on port 3000
3. **Verify proxy configuration** in `vite.config.ts`

### Authentication Issues

If you get 401/403 errors:

1. **Generate Canvas API Token**:
   - Go to Canvas → Account → Settings → Approved Integrations
   - Generate a new access token

2. **Add token to environment**:
   ```env
   VITE_CANVAS_API_TOKEN=your_token_here
   ```

## Development Tools

### GraphQL Debug Panel

In development mode, click the floating "GraphQL Debug" button to see:
- Environment configuration
- Query status and errors
- Network information
- Troubleshooting tips

### Browser Console

Check the browser console for detailed GraphQL debug information:
```
🔍 Dashboard GraphQL Debug Info: {
  statsLoading: false,
  coursesLoading: false,
  assignmentsLoading: false,
  statsError: "Failed to fetch",
  graphqlEndpoint: "http://localhost:3000/api/graphql"
}
```

## Mock Data Fallback

If Canvas LMS is not available, the app will:
- Show a warning notification
- Use mock data for demonstration
- Continue to function normally
- Retry connections automatically

## Canvas LMS GraphQL Schema

The app expects these GraphQL queries to be available:
- `dashboardStats` - System statistics
- `courses` - Course list with pagination
- `assignments` - Assignment list with pagination

## Adding Sample Data

To see the full functionality of ClassApex LMS, add sample data to Canvas LMS:

### Quick Method (Browser Console)
1. **Login to Canvas LMS** as admin at http://localhost:3000
2. **Open browser console** (F12)
3. **Copy and paste** the contents of `scripts/seed-canvas-browser.js`
4. **Run**: `seedCanvasData()`
5. **Wait for completion** - Creates 5 courses, 15 assignments, 15 discussions, 3 events
6. **Visit ClassApex LMS** at http://localhost:3003 to see real data

### What Gets Created
- 📚 **5 Courses**: CS101, MATH301, WEB201, DS101, MKT250
- 📝 **15 Assignments**: 3 per course with different due dates
- 💬 **15 Discussions**: Welcome posts, Q&A, study tips
- 📅 **3 Calendar Events**: Office hours, guest lectures, study groups
- 📁 **20 Folders**: Organized file structure per course

See `scripts/README.md` for detailed instructions and troubleshooting.

## Need Help?

1. Check the health check notification on the Dashboard
2. Use the GraphQL Debug Panel (development mode)
3. Check browser console for detailed error messages
4. Verify Canvas LMS is running and accessible
5. Run the seed data script to populate Canvas with sample content
