import React from 'react';
import { Assignment, User, Submission } from '@schoolapex/core';
/**
 * Gradebook Summary component props
 */
interface GradebookSummaryProps {
    courseId: string;
    courseName: string;
    students: User[];
    assignments: Assignment[];
    submissions: Record<string, Submission[]>;
    variant?: 'dashboard' | 'detailed';
    onViewFullGradebook?: () => void;
    className?: string;
    'data-testid'?: string;
}
/**
 * SchoolApex Gradebook Summary component
 *
 * Displays key gradebook statistics and metrics for a course, including
 * average scores, submission rates, and grade distribution.
 *
 * @example
 * ```tsx
 * <GradebookSummary
 *   courseId="123"
 *   courseName="Advanced Web Development"
 *   students={students}
 *   assignments={assignments}
 *   submissions={submissions}
 *   variant="dashboard"
 *   onViewFullGradebook={() => navigate('/gradebook')}
 * />
 * ```
 */
export declare const GradebookSummary: React.NamedExoticComponent<GradebookSummaryProps>;
export {};
//# sourceMappingURL=GradebookSummary.d.ts.map