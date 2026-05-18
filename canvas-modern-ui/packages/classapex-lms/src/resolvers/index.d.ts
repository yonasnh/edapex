import { Context } from '../context';
import { GraphQLScalarType } from 'graphql';
export declare const resolvers: {
    DateTime: GraphQLScalarType<Date | null, any>;
    BigInt: GraphQLScalarType<bigint | null, any>;
    Query: {
        users: (_: any, { limit, offset }: {
            limit: number;
            offset: number;
        }, { prisma }: Context) => Promise<any>;
        user: (_: any, { id }: {
            id: bigint;
        }, { prisma }: Context) => Promise<any>;
        courses: (_: any, { limit, offset }: {
            limit: number;
            offset: number;
        }, { prisma }: Context) => Promise<any>;
        course: (_: any, { id }: {
            id: bigint;
        }, { prisma }: Context) => Promise<any>;
        assignments: (_: any, { courseId, limit, offset }: {
            courseId?: bigint;
            limit: number;
            offset: number;
        }, { prisma }: Context) => Promise<any>;
        assignment: (_: any, { id }: {
            id: bigint;
        }, { prisma }: Context) => Promise<any>;
        enrollments: (_: any, { courseId, userId, limit, offset }: {
            courseId?: bigint;
            userId?: bigint;
            limit: number;
            offset: number;
        }, { prisma }: Context) => Promise<any>;
        submissions: (_: any, { assignmentId, userId, limit, offset }: {
            assignmentId?: bigint;
            userId?: bigint;
            limit: number;
            offset: number;
        }, { prisma }: Context) => Promise<any>;
        dashboardStats: (_: any, __: any, { prisma }: Context) => Promise<{
            totalUsers: any;
            totalCourses: any;
            totalAssignments: any;
            totalSubmissions: any;
            activeUsers: any;
            activeCourses: any;
        }>;
        courseAnalytics: (_: any, { courseId }: {
            courseId: bigint;
        }, { prisma }: Context) => Promise<{
            courseId: bigint;
            studentEngagement: number;
            averageGrade: any;
            submissionRate: number;
            activityTrend: never[];
        }>;
        searchUsers: (_: any, { query }: {
            query: string;
        }, { prisma }: Context) => Promise<any>;
        searchCourses: (_: any, { query }: {
            query: string;
        }, { prisma }: Context) => Promise<any>;
    };
    User: {
        displayName: (user: any) => any;
        isActive: (user: any) => boolean;
        enrollments: (user: any, _: any, { prisma }: Context) => Promise<any>;
        submissions: (user: any, _: any, { prisma }: Context) => Promise<any>;
        courses: (user: any, _: any, { prisma }: Context) => Promise<any>;
    };
    Course: {
        isActive: (course: any) => boolean;
        isPublished: (course: any) => boolean;
        studentCount: (course: any, _: any, { prisma }: Context) => Promise<any>;
        teacherCount: (course: any, _: any, { prisma }: Context) => Promise<any>;
        assignmentCount: (course: any, _: any, { prisma }: Context) => Promise<any>;
        enrollments: (course: any, _: any, { prisma }: Context) => Promise<any>;
        assignments: (course: any, _: any, { prisma }: Context) => Promise<any>;
        students: (course: any, _: any, { prisma }: Context) => Promise<any>;
        teachers: (course: any, _: any, { prisma }: Context) => Promise<any>;
    };
    Assignment: {
        isPublished: (assignment: any) => boolean;
        isOverdue: (assignment: any) => any;
        submissionCount: (assignment: any, _: any, { prisma }: Context) => Promise<any>;
        gradedCount: (assignment: any, _: any, { prisma }: Context) => Promise<any>;
        averageScore: (assignment: any, _: any, { prisma }: Context) => Promise<any>;
        course: (assignment: any, _: any, { prisma }: Context) => Promise<any>;
        submissions: (assignment: any, _: any, { prisma }: Context) => Promise<any>;
    };
    Enrollment: {
        isActive: (enrollment: any) => boolean;
        isStudent: (enrollment: any) => boolean;
        isTeacher: (enrollment: any) => boolean;
        isTA: (enrollment: any) => boolean;
        user: (enrollment: any, _: any, { prisma }: Context) => Promise<any>;
        course: (enrollment: any, _: any, { prisma }: Context) => Promise<any>;
    };
    Submission: {
        isSubmitted: (submission: any) => boolean;
        isGraded: (submission: any) => boolean;
        isLate: (submission: any) => boolean;
        assignment: (submission: any, _: any, { prisma }: Context) => Promise<any>;
        user: (submission: any, _: any, { prisma }: Context) => Promise<any>;
    };
};
//# sourceMappingURL=index.d.ts.map