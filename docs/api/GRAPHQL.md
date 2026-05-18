# 🔗 GraphQL API Documentation

The SchoolApex GraphQL API provides a powerful, flexible interface for accessing Canvas LMS data and SchoolApex-specific functionality.

## Overview

- **Endpoint**: `http://localhost:4003/graphql`
- **Playground**: `http://localhost:4003/graphql` (development only)
- **Schema**: Auto-generated from TypeScript definitions

## Getting Started

### Basic Query

```graphql
query GetCourses {
  courses {
    id
    name
    courseCode
    enrollmentCount
    startAt
    endAt
  }
}
```

### With Variables

```graphql
query GetCourse($courseId: ID!) {
  course(id: $courseId) {
    id
    name
    description
    assignments {
      id
      name
      dueAt
      pointsPossible
    }
  }
}
```

## Schema Overview

### Core Types

#### Course

```graphql
type Course {
  id: ID!
  name: String!
  courseCode: String
  description: String
  startAt: DateTime
  endAt: DateTime
  enrollmentCount: Int
  assignments: [Assignment!]!
  discussions: [Discussion!]!
  announcements: [Announcement!]!
  files: [File!]!
}
```

#### User

```graphql
type User {
  id: ID!
  name: String!
  email: String
  avatarUrl: String
  roles: [String!]!
  enrollments: [Enrollment!]!
}
```

#### Assignment

```graphql
type Assignment {
  id: ID!
  name: String!
  description: String
  dueAt: DateTime
  pointsPossible: Float
  submissionTypes: [String!]!
  course: Course!
  submissions: [Submission!]!
}
```

#### Discussion

```graphql
type Discussion {
  id: ID!
  title: String!
  message: String
  postedAt: DateTime
  author: User!
  course: Course!
  replies: [DiscussionReply!]!
  isLocked: Boolean!
  isPinned: Boolean!
}
```

## Queries

### Courses

```graphql
# Get all courses for current user
query GetMyCourses {
  courses {
    id
    name
    courseCode
    enrollmentCount
  }
}

# Get specific course with details
query GetCourseDetails($courseId: ID!) {
  course(id: $courseId) {
    id
    name
    description
    assignments(limit: 10) {
      id
      name
      dueAt
      pointsPossible
    }
    discussions(limit: 5) {
      id
      title
      postedAt
      author {
        name
      }
    }
  }
}
```

### Assignments

```graphql
# Get assignments for a course
query GetCourseAssignments($courseId: ID!) {
  course(id: $courseId) {
    assignments {
      id
      name
      description
      dueAt
      pointsPossible
      submissionTypes
    }
  }
}

# Get assignment with submissions
query GetAssignmentDetails($assignmentId: ID!) {
  assignment(id: $assignmentId) {
    id
    name
    description
    dueAt
    submissions {
      id
      submittedAt
      score
      user {
        name
      }
    }
  }
}
```

### Discussions

```graphql
# Get course discussions
query GetDiscussions($courseId: ID!) {
  course(id: $courseId) {
    discussions {
      id
      title
      message
      postedAt
      author {
        name
        avatarUrl
      }
      replies {
        id
        message
        postedAt
        author {
          name
        }
      }
    }
  }
}
```

### User Data

```graphql
# Get current user profile
query GetCurrentUser {
  currentUser {
    id
    name
    email
    avatarUrl
    enrollments {
      course {
        id
        name
      }
      role
    }
  }
}
```

## Mutations

### Create Discussion

```graphql
mutation CreateDiscussion($input: CreateDiscussionInput!) {
  createDiscussion(input: $input) {
    id
    title
    message
    postedAt
    author {
      name
    }
  }
}
```

### Submit Assignment

```graphql
mutation SubmitAssignment($input: SubmitAssignmentInput!) {
  submitAssignment(input: $input) {
    id
    submittedAt
    submissionType
    body
  }
}
```

### Update User Profile

```graphql
mutation UpdateUserProfile($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    name
    email
    bio
  }
}
```

## Input Types

### CreateDiscussionInput

```graphql
input CreateDiscussionInput {
  courseId: ID!
  title: String!
  message: String!
  isPinned: Boolean = false
  isLocked: Boolean = false
}
```

### SubmitAssignmentInput

```graphql
input SubmitAssignmentInput {
  assignmentId: ID!
  submissionType: SubmissionType!
  body: String
  fileIds: [ID!]
}
```

## Subscriptions

### Real-time Discussion Updates

```graphql
subscription DiscussionUpdates($courseId: ID!) {
  discussionUpdated(courseId: $courseId) {
    id
    title
    message
    author {
      name
    }
  }
}
```

### Assignment Notifications

```graphql
subscription AssignmentNotifications {
  assignmentNotification {
    type
    assignment {
      id
      name
      dueAt
    }
  }
}
```

## Error Handling

### Error Types

```graphql
type Error {
  message: String!
  code: String!
  path: [String!]
}
```

### Common Error Codes

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Input validation failed
- `CANVAS_API_ERROR`: Canvas API error

### Error Response Example

```json
{
  "errors": [
    {
      "message": "Course not found",
      "code": "NOT_FOUND",
      "path": ["course"]
    }
  ],
  "data": null
}
```

## Authentication

### Bearer Token

```javascript
const client = new ApolloClient({
  uri: 'http://localhost:4003/graphql',
  headers: {
    authorization: `Bearer ${canvasApiToken}`
  }
})
```

### Context

The GraphQL context includes:

```typescript
interface Context {
  user: User | null
  canvasApi: CanvasApiClient
  dataSources: {
    courses: CoursesDataSource
    assignments: AssignmentsDataSource
    discussions: DiscussionsDataSource
  }
}
```

## Pagination

### Cursor-based Pagination

```graphql
query GetCourses($first: Int, $after: String) {
  courses(first: $first, after: $after) {
    edges {
      node {
        id
        name
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

### Offset-based Pagination

```graphql
query GetAssignments($limit: Int, $offset: Int) {
  assignments(limit: $limit, offset: $offset) {
    id
    name
    dueAt
  }
}
```

## Caching

### Query Caching

The API implements intelligent caching:

- **Course data**: 5 minutes
- **Assignment data**: 2 minutes
- **Discussion data**: 1 minute
- **User data**: 10 minutes

### Cache Control Headers

```http
Cache-Control: max-age=300, public
ETag: "abc123"
```

## Rate Limiting

- **Queries**: 1000 requests per hour per user
- **Mutations**: 100 requests per hour per user
- **Subscriptions**: 10 concurrent connections per user

## Development Tools

### GraphQL Playground

Access the interactive playground at `http://localhost:4003/graphql` in development mode.

### Schema Introspection

```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      description
    }
  }
}
```

### Query Complexity Analysis

The API analyzes query complexity to prevent expensive operations:

```graphql
# This query might be rejected due to high complexity
query ExpensiveQuery {
  courses {
    assignments {
      submissions {
        user {
          enrollments {
            course {
              assignments {
                submissions
              }
            }
          }
        }
      }
    }
  }
}
```

## Client Integration

### React with Apollo Client

```typescript
import { useQuery } from '@apollo/client'
import { GET_COURSES } from './queries'

const CoursesPage = () => {
  const { data, loading, error } = useQuery(GET_COURSES)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {data.courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
```

### TypeScript Code Generation

Generate TypeScript types from the schema:

```bash
# Install codegen
pnpm add -D @graphql-codegen/cli

# Generate types
pnpm graphql-codegen
```

## Performance Tips

1. **Use fragments** for reusable field selections
2. **Batch queries** when possible
3. **Implement proper caching** on the client
4. **Avoid deep nesting** in queries
5. **Use subscriptions** for real-time data

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure proper CORS configuration
2. **Authentication failures**: Check API token validity
3. **Rate limiting**: Implement proper retry logic
4. **Query complexity**: Simplify complex queries

### Debug Mode

Enable debug logging:

```bash
DEBUG=graphql:* pnpm dev
```

## Next Steps

- Explore [Canvas API Integration](./CANVAS.md)
- Learn about [LTI Service](./LTI.md)
- Review [Authentication Guide](../setup/CANVAS_INTEGRATION.md)
