import { gql } from 'apollo-server-express';
export const typeDefs = gql `
  scalar DateTime

  type DashboardStats {
    totalUsers: Int!
    totalCourses: Int!
    totalAssignments: Int!
    totalSubmissions: Int!
    activeUsers: Int!
    activeCourses: Int!
  }

  type Course {
    id: ID!
    name: String!
    courseCode: String!
    studentCount: Int!
    assignmentCount: Int!
    teacherCount: Int!
    isPublished: Boolean!
    workflowState: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Assignment {
    id: ID!
    title: String!
    name: String # Fallback field for compatibility
    course: Course!
    dueAt: DateTime
    pointsPossible: Float
    submissionTypes: [String!]!
    workflowState: String!
    description: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Submission {
    id: ID!
    assignment: Assignment!
    user: User!
    submittedAt: DateTime
    grade: String
    score: Float
    workflowState: String!
  }

  type Discussion {
    id: ID!
    title: String!
    course: Course!
    message: String!
    author: User!
    replyCount: Int!
    unreadCount: Int!
    lastReplyAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type File {
    id: ID!
    displayName: String!
    filename: String!
    contentType: String!
    size: Int!
    url: String!
    course: Course
    folder: Folder
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type Folder {
    id: ID!
    name: String!
    fullName: String!
    course: Course
    parentFolder: Folder
    filesCount: Int!
    foldersCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type CalendarEvent {
    id: ID!
    title: String!
    description: String
    startAt: DateTime!
    endAt: DateTime
    allDay: Boolean!
    course: Course
    assignment: Assignment
    eventType: String!
    createdAt: DateTime!
    updatedAt: DateTime
  }

  type Query {
    # Dashboard
    dashboardStats: DashboardStats!
    
    # Courses
    courses(limit: Int = 10, offset: Int = 0): [Course!]!
    course(id: ID!): Course
    
    # Assignments
    assignments(limit: Int = 10, offset: Int = 0, courseId: ID): [Assignment!]!
    assignment(id: ID!): Assignment
    
    # Users
    users(limit: Int = 10, offset: Int = 0): [User!]!
    user(id: ID!): User
    
    # Submissions
    submissions(limit: Int = 10, offset: Int = 0, assignmentId: ID, userId: ID): [Submission!]!
    submission(id: ID!): Submission
    
    # Discussions
    discussions(limit: Int = 10, offset: Int = 0, courseId: ID): [Discussion!]!
    discussion(id: ID!): Discussion
    
    # Files
    files(limit: Int = 10, offset: Int = 0, courseId: ID, folderId: ID): [File!]!
    file(id: ID!): File
    
    # Folders
    folders(limit: Int = 10, offset: Int = 0, courseId: ID, parentFolderId: ID): [Folder!]!
    folder(id: ID!): Folder
    
    # Calendar
    calendarEvents(limit: Int = 10, offset: Int = 0, startDate: DateTime, endDate: DateTime): [CalendarEvent!]!
    calendarEvent(id: ID!): CalendarEvent
  }

  type Mutation {
    # Courses
    createCourse(name: String!, courseCode: String!): Course!
    updateCourse(id: ID!, name: String, courseCode: String): Course!
    deleteCourse(id: ID!): Boolean!
    
    # Assignments
    createAssignment(title: String!, courseId: ID!, dueAt: DateTime, pointsPossible: Float): Assignment!
    updateAssignment(id: ID!, title: String, dueAt: DateTime, pointsPossible: Float): Assignment!
    deleteAssignment(id: ID!): Boolean!
    
    # Submissions
    createSubmission(assignmentId: ID!, userId: ID!): Submission!
    gradeSubmission(id: ID!, grade: String, score: Float): Submission!
    
    # Discussions
    createDiscussion(title: String!, message: String!, courseId: ID!): Discussion!
    updateDiscussion(id: ID!, title: String, message: String): Discussion!
    deleteDiscussion(id: ID!): Boolean!
    
    # Files
    uploadFile(displayName: String!, filename: String!, contentType: String!, size: Int!, courseId: ID, folderId: ID): File!
    deleteFile(id: ID!): Boolean!
    
    # Folders
    createFolder(name: String!, courseId: ID, parentFolderId: ID): Folder!
    updateFolder(id: ID!, name: String): Folder!
    deleteFolder(id: ID!): Boolean!
    
    # Calendar
    createCalendarEvent(title: String!, startAt: DateTime!, endAt: DateTime, allDay: Boolean = false, courseId: ID): CalendarEvent!
    updateCalendarEvent(id: ID!, title: String, startAt: DateTime, endAt: DateTime, allDay: Boolean): CalendarEvent!
    deleteCalendarEvent(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=typeDefs.js.map