import { Context } from '../context';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

// Custom scalar types
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const BigIntScalar = new GraphQLScalarType({
  name: 'BigInt',
  description: 'BigInt custom scalar type',
  serialize(value: any) {
    return value.toString();
  },
  parseValue(value: any) {
    return BigInt(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return BigInt(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,
  BigInt: BigIntScalar,

  Query: {
    // User queries
    users: async (_: any, { limit, offset }: { limit: number; offset: number }, { prisma }: Context) => {
      return await prisma.users.findMany({
        take: limit,
        skip: offset,
        where: {
          workflow_state: 'active',
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    },

    user: async (_: any, { id }: { id: bigint }, { prisma }: Context) => {
      return await prisma.users.findUnique({
        where: { id },
      });
    },

    // Course queries
    courses: async (_: any, { limit, offset }: { limit: number; offset: number }, { prisma }: Context) => {
      return await prisma.courses.findMany({
        take: limit,
        skip: offset,
        where: {
          workflow_state: {
            in: ['available', 'published'],
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    },

    course: async (_: any, { id }: { id: bigint }, { prisma }: Context) => {
      return await prisma.courses.findUnique({
        where: { id },
      });
    },

    // Assignment queries
    assignments: async (_: any, { courseId, limit, offset }: { courseId?: bigint; limit: number; offset: number }, { prisma }: Context) => {
      return await prisma.assignments.findMany({
        take: limit,
        skip: offset,
        where: {
          ...(courseId && { context_id: courseId }),
          workflow_state: {
            in: ['published', 'available'],
          },
        },
        orderBy: {
          due_at: 'asc',
        },
      });
    },

    assignment: async (_: any, { id }: { id: bigint }, { prisma }: Context) => {
      return await prisma.assignments.findUnique({
        where: { id },
      });
    },

    // Enrollment queries
    enrollments: async (_: any, { courseId, userId, limit, offset }: { courseId?: bigint; userId?: bigint; limit: number; offset: number }, { prisma }: Context) => {
      return await prisma.enrollments.findMany({
        take: limit,
        skip: offset,
        where: {
          ...(courseId && { course_id: courseId }),
          ...(userId && { user_id: userId }),
          workflow_state: 'active',
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    },

    // Submission queries
    submissions: async (_: any, { assignmentId, userId, limit, offset }: { assignmentId?: bigint; userId?: bigint; limit: number; offset: number }, { prisma }: Context) => {
      return await prisma.submissions.findMany({
        take: limit,
        skip: offset,
        where: {
          ...(assignmentId && { assignment_id: assignmentId }),
          ...(userId && { user_id: userId }),
          workflow_state: {
            in: ['submitted', 'graded'],
          },
        },
        orderBy: {
          submitted_at: 'desc',
        },
      });
    },

    // Dashboard stats
    dashboardStats: async (_: any, __: any, { prisma }: Context) => {
      const [totalUsers, totalCourses, totalAssignments, totalSubmissions, activeUsers, activeCourses] = await Promise.all([
        prisma.users.count({ where: { workflow_state: 'active' } }),
        prisma.courses.count({ where: { workflow_state: { in: ['available', 'published'] } } }),
        prisma.assignments.count({ where: { workflow_state: { in: ['published', 'available'] } } }),
        prisma.submissions.count({ where: { workflow_state: { in: ['submitted', 'graded'] } } }),
        prisma.users.count({ 
          where: { 
            workflow_state: 'active',
            updated_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          } 
        }),
        prisma.courses.count({ 
          where: { 
            workflow_state: { in: ['available', 'published'] },
            updated_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          } 
        }),
      ]);

      return {
        totalUsers,
        totalCourses,
        totalAssignments,
        totalSubmissions,
        activeUsers,
        activeCourses,
      };
    },

    // Course analytics
    courseAnalytics: async (_: any, { courseId }: { courseId: bigint }, { prisma }: Context) => {
      const [enrollmentCount, submissionStats] = await Promise.all([
        prisma.enrollments.count({
          where: {
            course_id: courseId,
            workflow_state: 'active',
            type: 'StudentEnrollment',
          },
        }),
        prisma.submissions.aggregate({
          where: {
            assignments: {
              context_id: courseId,
            },
            workflow_state: 'graded',
          },
          _avg: {
            score: true,
          },
          _count: {
            id: true,
          },
        }),
      ]);

      const totalAssignments = await prisma.assignments.count({
        where: {
          context_id: courseId,
          workflow_state: { in: ['published', 'available'] },
        },
      });

      const countId = (submissionStats as any)._count?.id || 0;
      const avgScore = (submissionStats as any)._avg?.score || 0;
      const submissionRate = (totalAssignments > 0 && enrollmentCount > 0) ? (countId / (enrollmentCount * totalAssignments)) * 100 : 0;

      return {
        courseId,
        studentEngagement: 85.5, // Placeholder - would calculate from activity data
        averageGrade: avgScore,
        submissionRate,
        activityTrend: [], // Placeholder - would calculate from activity logs
      };
    },

    // Search functions
    searchUsers: async (_: any, { query }: { query: string }, { prisma }: Context) => {
      return await prisma.users.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { sortable_name: { contains: query, mode: 'insensitive' } },
          ],
          workflow_state: 'active',
        },
        take: 20,
      });
    },

    searchCourses: async (_: any, { query }: { query: string }, { prisma }: Context) => {
      return await prisma.courses.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { course_code: { contains: query, mode: 'insensitive' } },
          ],
          workflow_state: { in: ['available', 'published'] },
        },
        take: 20,
      });
    },
  },

  // Type resolvers for computed fields and relationships
  User: {
    displayName: (user: any) => user.name || user.sortable_name || 'Unknown User',
    isActive: (user: any) => user.workflow_state === 'active',
    
    enrollments: async (user: any, _: any, { prisma }: Context) => {
      return await prisma.enrollments.findMany({
        where: {
          user_id: user.id,
          workflow_state: 'active',
        },
      });
    },

    submissions: async (user: any, _: any, { prisma }: Context) => {
      return await prisma.submissions.findMany({
        where: {
          user_id: user.id,
        },
        take: 50,
        orderBy: {
          submitted_at: 'desc',
        },
      });
    },

    courses: async (user: any, _: any, { prisma }: Context) => {
      const enrollments = await prisma.enrollments.findMany({
        where: {
          user_id: user.id,
          workflow_state: 'active',
        },
        include: {
          courses: true,
        },
      });
      return enrollments.map((e: any) => e.courses);
    },
  },

  Course: {
    isActive: (course: any) => ['available', 'published'].includes(course.workflow_state),
    isPublished: (course: any) => course.workflow_state === 'published',
    
    studentCount: async (course: any, _: any, { prisma }: Context) => {
      return await prisma.enrollments.count({
        where: {
          course_id: course.id,
          type: 'StudentEnrollment',
          workflow_state: 'active',
        },
      });
    },

    teacherCount: async (course: any, _: any, { prisma }: Context) => {
      return await prisma.enrollments.count({
        where: {
          course_id: course.id,
          type: 'TeacherEnrollment',
          workflow_state: 'active',
        },
      });
    },

    assignmentCount: async (course: any, _: any, { prisma }: Context) => {
      return await prisma.assignments.count({
        where: {
          context_id: course.id,
          workflow_state: { in: ['published', 'available'] },
        },
      });
    },

    enrollments: async (course: any, _: any, { prisma }: Context) => {
      return await prisma.enrollments.findMany({
        where: {
          course_id: course.id,
          workflow_state: 'active',
        },
      });
    },

    assignments: async (course: any, _: any, { prisma }: Context) => {
      return await prisma.assignments.findMany({
        where: {
          context_id: course.id,
          workflow_state: { in: ['published', 'available'] },
        },
        orderBy: {
          due_at: 'asc',
        },
      });
    },

    students: async (course: any, _: any, { prisma }: Context) => {
      const enrollments = await prisma.enrollments.findMany({
        where: {
          course_id: course.id,
          type: 'StudentEnrollment',
          workflow_state: 'active',
        },
        include: {
          users_enrollments_user_idTousers: true,
        },
      });
      return enrollments.map((e: any) => e.users_enrollments_user_idTousers);
    },

    teachers: async (course: any, _: any, { prisma }: Context) => {
      const enrollments = await prisma.enrollments.findMany({
        where: {
          course_id: course.id,
          type: 'TeacherEnrollment',
          workflow_state: 'active',
        },
        include: {
          users_enrollments_user_idTousers: true,
        },
      });
      return enrollments.map((e: any) => e.users_enrollments_user_idTousers);
    },
  },

  Assignment: {
    isPublished: (assignment: any) => ['published', 'available'].includes(assignment.workflow_state),
    isOverdue: (assignment: any) => assignment.due_at && new Date(assignment.due_at) < new Date(),
    
    submissionCount: async (assignment: any, _: any, { prisma }: Context) => {
      return await prisma.submissions.count({
        where: {
          assignment_id: assignment.id,
          workflow_state: { in: ['submitted', 'graded'] },
        },
      });
    },

    gradedCount: async (assignment: any, _: any, { prisma }: Context) => {
      return await prisma.submissions.count({
        where: {
          assignment_id: assignment.id,
          workflow_state: 'graded',
        },
      });
    },

    averageScore: async (assignment: any, _: any, { prisma }: Context) => {
      const result = await prisma.submissions.aggregate({
        where: {
          assignment_id: assignment.id,
          workflow_state: 'graded',
          score: { not: null },
        },
        _avg: {
          score: true,
        },
      });
      return result._avg.score;
    },

    course: async (assignment: any, _: any, { prisma }: Context) => {
      return await prisma.courses.findUnique({
        where: { id: assignment.context_id },
      });
    },

    submissions: async (assignment: any, _: any, { prisma }: Context) => {
      return await prisma.submissions.findMany({
        where: {
          assignment_id: assignment.id,
        },
        orderBy: {
          submitted_at: 'desc',
        },
      });
    },
  },

  Enrollment: {
    isActive: (enrollment: any) => enrollment.workflow_state === 'active',
    isStudent: (enrollment: any) => enrollment.type === 'StudentEnrollment',
    isTeacher: (enrollment: any) => enrollment.type === 'TeacherEnrollment',
    isTA: (enrollment: any) => enrollment.type === 'TaEnrollment',

    user: async (enrollment: any, _: any, { prisma }: Context) => {
      return await prisma.users.findUnique({
        where: { id: enrollment.user_id },
      });
    },

    course: async (enrollment: any, _: any, { prisma }: Context) => {
      return await prisma.courses.findUnique({
        where: { id: enrollment.course_id },
      });
    },
  },

  Submission: {
    isSubmitted: (submission: any) => ['submitted', 'graded'].includes(submission.workflow_state),
    isGraded: (submission: any) => submission.workflow_state === 'graded',
    isLate: (submission: any) => submission.late_policy_status === 'late',

    assignment: async (submission: any, _: any, { prisma }: Context) => {
      return await prisma.assignments.findUnique({
        where: { id: submission.assignment_id },
      });
    },

    user: async (submission: any, _: any, { prisma }: Context) => {
      return await prisma.users.findUnique({
        where: { id: submission.user_id },
      });
    },
  },
};
