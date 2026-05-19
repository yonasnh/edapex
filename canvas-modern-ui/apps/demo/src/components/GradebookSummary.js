import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo } from 'react';
import { Tile, ProgressBar, Tag } from '@carbon/react';
import clsx from 'clsx';
/**
 * Calculate grade statistics from submissions data
 */
const calculateGradeStats = (students, assignments, submissions) => {
    const totalStudents = students.length;
    const scores = [];
    let totalSubmissions = 0;
    let totalGraded = 0;
    let totalPossible = 0;
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    students.forEach(student => {
        const studentSubmissions = submissions[student.id] || [];
        let studentScore = 0;
        let studentPossible = 0;
        assignments.forEach(assignment => {
            const submission = studentSubmissions.find(s => s.assignment_id === assignment.id);
            const points = assignment.points_possible || 0;
            studentPossible += points;
            totalPossible += points;
            if (submission) {
                totalSubmissions++;
                if (submission.workflow_state === 'graded' && submission.score !== null) {
                    totalGraded++;
                    studentScore += submission.score;
                }
            }
        });
        if (studentPossible > 0) {
            const percentage = (studentScore / studentPossible) * 100;
            scores.push(percentage);
            // Calculate letter grade distribution
            if (percentage >= 90)
                distribution.A++;
            else if (percentage >= 80)
                distribution.B++;
            else if (percentage >= 70)
                distribution.C++;
            else if (percentage >= 60)
                distribution.D++;
            else
                distribution.F++;
        }
    });
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    const submissionRate = totalPossible > 0 ? (totalSubmissions / (totalStudents * assignments.length)) * 100 : 0;
    const gradedRate = totalSubmissions > 0 ? (totalGraded / totalSubmissions) * 100 : 0;
    return {
        totalStudents,
        averageScore,
        highestScore,
        lowestScore,
        submissionRate,
        gradedRate,
        distribution
    };
};
const GradeDistribution = ({ distribution, totalStudents }) => {
    const grades = ['A', 'B', 'C', 'D', 'F'];
    return (_jsxs("div", { className: "grade-distribution", children: [_jsx("h4", { className: "grade-distribution__title", children: "Grade Distribution" }), _jsx("div", { className: "grade-distribution__chart", children: grades.map(grade => {
                    const count = distribution[grade];
                    const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                    return (_jsxs("div", { className: "grade-distribution__item", children: [_jsxs("div", { className: "grade-distribution__label", children: [_jsx("span", { className: "grade-distribution__grade", children: grade }), _jsxs("span", { className: "grade-distribution__count", children: ["(", count, ")"] })] }), _jsx(ProgressBar, { label: `${grade} grade distribution`, value: percentage, max: 100, size: "small", className: `grade-distribution__bar grade-distribution__bar--${grade.toLowerCase()}` }), _jsxs("span", { className: "grade-distribution__percentage", children: [percentage.toFixed(1), "%"] })] }, grade));
                }) })] }));
};
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
export const GradebookSummary = memo(({ courseId, courseName, students, assignments, submissions, variant = 'dashboard', onViewFullGradebook, className, 'data-testid': testId, ...props }) => {
    const stats = calculateGradeStats(students, assignments, submissions);
    const isDetailed = variant === 'detailed';
    const getScoreColor = (score) => {
        if (score >= 90)
            return 'green';
        if (score >= 80)
            return 'blue';
        if (score >= 70)
            return 'warm-gray';
        if (score >= 60)
            return 'warm-gray';
        return 'red';
    };
    return (_jsxs(Tile, { className: clsx('gradebook-summary', `gradebook-summary--${variant}`, className), "data-testid": testId, ...props, children: [_jsxs("div", { className: "gradebook-summary__header", children: [_jsx("h3", { className: "gradebook-summary__title", children: isDetailed ? `${courseName} - Gradebook Summary` : 'Gradebook Overview' }), onViewFullGradebook && (_jsx("button", { className: "gradebook-summary__view-link", onClick: onViewFullGradebook, type: "button", children: "View Full Gradebook \u2192" }))] }), _jsxs("div", { className: "gradebook-summary__stats", children: [_jsxs("div", { className: "gradebook-summary__stat-grid", children: [_jsxs("div", { className: "gradebook-summary__stat", children: [_jsx("span", { className: "gradebook-summary__stat-label", children: "Students" }), _jsx("span", { className: "gradebook-summary__stat-value", children: stats.totalStudents })] }), _jsxs("div", { className: "gradebook-summary__stat", children: [_jsx("span", { className: "gradebook-summary__stat-label", children: "Assignments" }), _jsx("span", { className: "gradebook-summary__stat-value", children: assignments.length })] }), _jsxs("div", { className: "gradebook-summary__stat", children: [_jsx("span", { className: "gradebook-summary__stat-label", children: "Class Average" }), _jsxs("div", { className: "gradebook-summary__stat-value-with-tag", children: [_jsxs("span", { className: "gradebook-summary__stat-value", children: [stats.averageScore.toFixed(1), "%"] }), _jsx(Tag, { type: getScoreColor(stats.averageScore), size: "sm", children: stats.averageScore >= 90 ? 'A' :
                                                    stats.averageScore >= 80 ? 'B' :
                                                        stats.averageScore >= 70 ? 'C' :
                                                            stats.averageScore >= 60 ? 'D' : 'F' })] })] }), _jsxs("div", { className: "gradebook-summary__stat", children: [_jsx("span", { className: "gradebook-summary__stat-label", children: "Submission Rate" }), _jsxs("span", { className: "gradebook-summary__stat-value", children: [stats.submissionRate.toFixed(1), "%"] })] })] }), isDetailed && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "gradebook-summary__detailed-stats", children: [_jsxs("div", { className: "gradebook-summary__stat", children: [_jsx("span", { className: "gradebook-summary__stat-label", children: "Highest Score" }), _jsxs("span", { className: "gradebook-summary__stat-value", children: [stats.highestScore.toFixed(1), "%"] })] }), _jsxs("div", { className: "gradebook-summary__stat", children: [_jsx("span", { className: "gradebook-summary__stat-label", children: "Lowest Score" }), _jsxs("span", { className: "gradebook-summary__stat-value", children: [stats.lowestScore.toFixed(1), "%"] })] }), _jsxs("div", { className: "gradebook-summary__stat", children: [_jsx("span", { className: "gradebook-summary__stat-label", children: "Graded Rate" }), _jsxs("span", { className: "gradebook-summary__stat-value", children: [stats.gradedRate.toFixed(1), "%"] })] })] }), _jsx(GradeDistribution, { distribution: stats.distribution, totalStudents: stats.totalStudents })] }))] }), !isDetailed && (_jsxs("div", { className: "gradebook-summary__quick-stats", children: [_jsxs("div", { className: "gradebook-summary__progress", children: [_jsx("span", { className: "gradebook-summary__progress-label", children: "Submissions" }), _jsx(ProgressBar, { label: "Submission rate progress", value: stats.submissionRate, max: 100, size: "small", className: "gradebook-summary__progress-bar" })] }), _jsxs("div", { className: "gradebook-summary__progress", children: [_jsx("span", { className: "gradebook-summary__progress-label", children: "Graded" }), _jsx(ProgressBar, { label: "Graded rate progress", value: stats.gradedRate, max: 100, size: "small", className: "gradebook-summary__progress-bar" })] })] })), _jsxs("div", { className: "sr-only", children: ["Gradebook summary for ", courseName, ".", stats.totalStudents, " students, ", assignments.length, " assignments. Class average: ", stats.averageScore.toFixed(1), "%. Submission rate: ", stats.submissionRate.toFixed(1), "%. Graded rate: ", stats.gradedRate.toFixed(1), "%."] })] }));
});
GradebookSummary.displayName = 'GradebookSummary';
//# sourceMappingURL=GradebookSummary.js.map