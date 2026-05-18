import { gql } from 'apollo-server-express';
export const typeDefs = gql `
  scalar DateTime
  scalar BigInt

  type User {
    id: BigInt!
    name: String
    sortableName: String
    workflowState: String!
    timeZone: String
    uuid: String
    createdAt: DateTime!
    updatedAt: DateTime!
    avatarImageUrl: String
    avatarImageSource: String
    avatarImageUpdatedAt: DateTime
    phone: String
    schoolName: String
    schoolPosition: String
    shortName: String
    deletedAt: DateTime
    showUserServices: Boolean
    
    # Computed fields
    displayName: String!
    isActive: Boolean!
    
    # Relationships
    enrollments: [Enrollment!]!
    submissions: [Submission!]!
    courses: [Course!]!
  }

  type Course {
    id: BigInt!
    name: String
    accountId: BigInt!
    groupWeightingScheme: String
    workflowState: String!
    uuid: String
    startAt: DateTime
    concludeAt: DateTime
    gradingStandardId: BigInt
    isPublic: Boolean
    allowStudentWikiEdits: Boolean
    createdAt: DateTime!
    updatedAt: DateTime!
    courseCode: String
    defaultView: String
    rootAccountId: BigInt
    enrollmentTermId: BigInt
    sisSourceId: String
    openEnrollment: Boolean
    storageQuota: BigInt
    allowWikiComments: Boolean
    selfEnrollment: Boolean
    license: String
    locale: String
    publicDescription: String
    selfEnrollmentCode: String
    selfEnrollmentLimit: Int
    integrationId: String
    timeZone: String
    ltiContextId: String
    showPublicContextMessages: Boolean
    syllabusBody: String
    syllabusCoursesSummary: Boolean
    gradingStandardEnabled: Boolean
    gradingStandardIdentifier: String
    createdByUser: BigInt
    courseFormat: String
    imageId: BigInt
    imageUrl: String
    bannerImageId: BigInt
    bannerImageUrl: String
    gradePassbackSetting: String
    homeroomCourse: Boolean
    syncEnrollmentsFromHomeroom: Boolean
    homeroomCourseId: BigInt
    templateCourseId: BigInt
    
    # Computed fields
    isActive: Boolean!
    isPublished: Boolean!
    studentCount: Int!
    teacherCount: Int!
    assignmentCount: Int!
    
    # Relationships
    enrollments: [Enrollment!]!
    assignments: [Assignment!]!
    students: [User!]!
    teachers: [User!]!
  }

  type Assignment {
    id: BigInt!
    title: String
    description: String
    dueAt: DateTime
    unlockAt: DateTime
    lockAt: DateTime
    pointsPossible: Float
    gradingType: String
    submissionTypes: String
    workflowState: String!
    contextId: BigInt!
    contextType: String!
    assignmentGroupId: BigInt
    gradingStandardId: BigInt
    createdAt: DateTime!
    updatedAt: DateTime!
    groupCategoryId: BigInt
    submissionsDownloads: Int
    peerReviewCount: Int
    peerReviewsDueAt: DateTime
    peerReviewsAssigned: Boolean
    peerReviewVisibility: String
    automaticPeerReviews: Boolean
    allDay: Boolean
    allDayDate: DateTime
    couldBeLocked: Boolean
    clonedItemId: BigInt
    contextModuleId: BigInt
    position: Int
    migrationId: String
    turnitinEnabled: Boolean
    vericiteEnabled: Boolean
    turnitinSettings: String
    gradeGroupStudentsIndividually: Boolean
    anonymousPeerReviews: Boolean
    timeZoneEdited: String
    freeFormCriterionComments: Boolean
    
    # Computed fields
    isPublished: Boolean!
    isOverdue: Boolean!
    submissionCount: Int!
    gradedCount: Int!
    averageScore: Float
    
    # Relationships
    course: Course!
    submissions: [Submission!]!
  }

  type Enrollment {
    id: BigInt!
    userId: BigInt!
    courseId: BigInt!
    type: String!
    uuid: String
    workflowState: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    associatedUserId: BigInt
    sisBatchId: BigInt
    startAt: DateTime
    endAt: DateTime
    courseSectionId: BigInt!
    rootAccountId: BigInt!
    completedAt: DateTime
    selfEnrolled: Boolean
    gradePublishingStatus: String
    lastActivityAt: DateTime
    totalActivityTime: Int
    roleId: BigInt!
    gradePublishingMessage: String
    limitPrivilegesToCourseSection: Boolean
    lastAttendedAt: DateTime
    
    # Computed fields
    isActive: Boolean!
    isStudent: Boolean!
    isTeacher: Boolean!
    isTA: Boolean!
    
    # Relationships
    user: User!
    course: Course!
  }

  type Submission {
    id: BigInt!
    assignmentId: BigInt!
    userId: BigInt!
    submissionType: String
    workflowState: String!
    grade: String
    score: Float
    submittedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    gradeMatchesCurrentSubmission: Boolean
    publishedGrade: String
    publishedScore: Float
    gradedAt: DateTime
    graderId: BigInt
    gradingPeriodId: BigInt
    excused: Boolean
    latePolicyStatus: String
    pointsDeducted: Float
    cachedDueDate: DateTime
    redoRequest: Boolean
    
    # Computed fields
    isSubmitted: Boolean!
    isGraded: Boolean!
    isLate: Boolean!
    
    # Relationships
    assignment: Assignment!
    user: User!
  }

  # Dashboard and Analytics Types
  type DashboardStats {
    totalUsers: Int!
    totalCourses: Int!
    totalAssignments: Int!
    totalSubmissions: Int!
    activeUsers: Int!
    activeCourses: Int!
  }

  type CourseAnalytics {
    courseId: BigInt!
    studentEngagement: Float!
    averageGrade: Float!
    submissionRate: Float!
    activityTrend: [ActivityPoint!]!
  }

  type ActivityPoint {
    date: DateTime!
    count: Int!
  }

  # Query Types
  type Query {
    # User queries
    users(limit: Int = 50, offset: Int = 0): [User!]!
    user(id: BigInt!): User
    
    # Course queries
    courses(limit: Int = 50, offset: Int = 0): [Course!]!
    course(id: BigInt!): Course
    
    # Assignment queries
    assignments(courseId: BigInt, limit: Int = 50, offset: Int = 0): [Assignment!]!
    assignment(id: BigInt!): Assignment
    
    # Enrollment queries
    enrollments(courseId: BigInt, userId: BigInt, limit: Int = 50, offset: Int = 0): [Enrollment!]!
    
    # Submission queries
    submissions(assignmentId: BigInt, userId: BigInt, limit: Int = 50, offset: Int = 0): [Submission!]!
    
    # Dashboard and Analytics
    dashboardStats: DashboardStats!
    courseAnalytics(courseId: BigInt!): CourseAnalytics!
    
    # Search
    searchUsers(query: String!): [User!]!
    searchCourses(query: String!): [Course!]!
  }
`;
//# sourceMappingURL=typeDefs.js.map