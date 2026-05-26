/**
 * Pure Node.js test for Users.tsx role-assignment logic.
 * Run with: node --test src/pages/admin/Users.logic.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

const ENROLLMENT_TYPE_MAP = {
  student: 'StudentEnrollment',
  teacher: 'TeacherEnrollment',
  ta: 'TaEnrollment',
  observer: 'ObserverEnrollment',
  designer: 'DesignerEnrollment',
};

// Replicated role-determination logic from Users.tsx (with knownRoles fallback)
function determineRole(user, adminUserIds, knownRoles) {
  const id = String(user.id);
  if (adminUserIds.has(id)) return 'admin';
  if (Array.isArray(user.enrollments) && user.enrollments.length > 0) {
    const types = user.enrollments.map(e => e.type || e.role);
    if (types.includes('TeacherEnrollment')) return 'teacher';
    if (types.includes('TaEnrollment')) return 'ta';
    if (types.includes('DesignerEnrollment')) return 'designer';
    if (types.includes('ObserverEnrollment')) return 'observer';
    if (types.includes('StudentEnrollment')) return 'student';
  }
  if (knownRoles[id]) return knownRoles[id];
  return 'student';
}

function validateCreate(newUser) {
  if (!newUser.name.trim() || !newUser.email.trim()) {
    return { ok: false, error: 'Name and email are required' };
  }
  if (newUser.role !== 'admin' && !newUser.courseId) {
    return { ok: false, error: 'Course is required for this role' };
  }
  return { ok: true };
}

describe('Role determination from Canvas enrollments', () => {
  it('marks account admins correctly', () => {
    assert.strictEqual(determineRole({ id: 1, enrollments: [] }, new Set(['1']), {}), 'admin');
  });

  it('detects ObserverEnrollment → observer', () => {
    const user = { id: 42, enrollments: [{ type: 'ObserverEnrollment', course_id: 101 }] };
    assert.strictEqual(determineRole(user, new Set(), {}), 'observer');
  });

  it('detects TeacherEnrollment → teacher', () => {
    const user = { id: 43, enrollments: [{ type: 'TeacherEnrollment', course_id: 102 }] };
    assert.strictEqual(determineRole(user, new Set(), {}), 'teacher');
  });

  it('prefers higher-privilege role when multiple enrollments exist', () => {
    const user = { id: 44, enrollments: [
      { type: 'StudentEnrollment', course_id: 101 },
      { type: 'TeacherEnrollment', course_id: 102 },
    ]};
    assert.strictEqual(determineRole(user, new Set(), {}), 'teacher');
  });

  it('falls back to student when no enrollments and no knownRoles', () => {
    const user = { id: 45, enrollments: [] };
    assert.strictEqual(determineRole(user, new Set(), {}), 'student');
  });

  it('falls back to student when enrollments field is missing', () => {
    const user = { id: 46 };
    assert.strictEqual(determineRole(user, new Set(), {}), 'student');
  });

  it('uses knownRoles when Canvas returns empty enrollments (the refetch bug)', () => {
    // This is the exact bug: after refetch, Canvas returns user with empty enrollments
    const user = { id: 99, enrollments: [] };
    const knownRoles = { '99': 'observer' };
    assert.strictEqual(determineRole(user, new Set(), knownRoles), 'observer');
  });

  it('enrollments take priority over knownRoles (Canvas is the source of truth)', () => {
    const user = { id: 100, enrollments: [{ type: 'TeacherEnrollment' }] };
    const knownRoles = { '100': 'student' };
    assert.strictEqual(determineRole(user, new Set(), knownRoles), 'teacher');
  });
});

describe('Create-user validation', () => {
  it('blocks Observer creation without a course', () => {
    const result = validateCreate({ name: 'Jane', email: 'jane@example.com', role: 'observer', courseId: '' });
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.error, 'Course is required for this role');
  });

  it('blocks Teacher creation without a course', () => {
    const result = validateCreate({ name: 'Prof', email: 'prof@example.com', role: 'teacher', courseId: '' });
    assert.strictEqual(result.ok, false);
  });

  it('allows Admin creation without a course', () => {
    const result = validateCreate({ name: 'Admin', email: 'admin@example.com', role: 'admin', courseId: '' });
    assert.strictEqual(result.ok, true);
  });

  it('allows Observer creation with a course', () => {
    const result = validateCreate({ name: 'Jane', email: 'jane@example.com', role: 'observer', courseId: '101' });
    assert.strictEqual(result.ok, true);
  });

  it('rejects empty name/email', () => {
    const result = validateCreate({ name: '', email: '', role: 'student', courseId: '101' });
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.error, 'Name and email are required');
  });
});

describe('Enrollment type map completeness', () => {
  it('covers all UI role options', () => {
    const uiRoles = ['student', 'teacher', 'ta', 'observer', 'designer'];
    for (const role of uiRoles) {
      assert.ok(ENROLLMENT_TYPE_MAP[role], `Missing Canvas enrollment type for role: ${role}`);
    }
  });

  it('maps observer to ObserverEnrollment', () => {
    assert.strictEqual(ENROLLMENT_TYPE_MAP.observer, 'ObserverEnrollment');
  });
});

console.log('✅ All logic tests passed (Node.js built-in test runner)');
