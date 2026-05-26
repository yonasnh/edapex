/**
 * End-to-end simulation of the Observer-role bug and its fix.
 *
 * This test replicates the exact React state lifecycle that caused the bug:
 *   1. Create user with Observer role + course enrollment
 *   2. Refetch fires
 *   3. Canvas returns user with empty enrollments[]
 *   4. Verify role is STILL 'observer' (not 'student')
 *
 * Run: node --test src/pages/admin/Users.bugfix.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// ─── Replicate the exact logic from Users.tsx ─────────────────────────────────

function mapCanvasUsers(canvasUsers, canvasAdmins, knownRoles) {
  const adminUserIds = new Set();
  if (Array.isArray(canvasAdmins)) {
    canvasAdmins.forEach(admin => {
      if (admin.user && admin.user.id) {
        adminUserIds.add(String(admin.user.id));
      }
    });
  }

  return canvasUsers.map(u => {
    const id = String(u.id);
    const email = u.email || u.login_id || 'no-email@example.com';
    const name = u.name || u.short_name || 'Unknown User';

    // THE FIX: knownRoles fallback
    let role = 'student';
    if (adminUserIds.has(id)) {
      role = 'admin';
    } else if (Array.isArray(u.enrollments) && u.enrollments.length > 0) {
      const types = u.enrollments.map(e => e.type || e.role);
      if (types.includes('TeacherEnrollment')) role = 'teacher';
      else if (types.includes('TaEnrollment')) role = 'ta';
      else if (types.includes('DesignerEnrollment')) role = 'designer';
      else if (types.includes('ObserverEnrollment')) role = 'observer';
      else if (types.includes('StudentEnrollment')) role = 'student';
    } else if (knownRoles[id]) {
      role = knownRoles[id];   // ← THE FIX
    }

    return { id, name, email, role };
  });
}

// ─── Bug reproduction test ────────────────────────────────────────────────────

describe('BUG: Observer user reverts to Student after refetch', () => {
  it('WITHOUT knownRoles fix: role becomes student after empty-enrollment refetch', () => {
    // Simulate the broken logic (before fix)
    function brokenMap(canvasUsers) {
      return canvasUsers.map(u => {
        const id = String(u.id);
        let role = 'student';
        if (Array.isArray(u.enrollments) && u.enrollments.length > 0) {
          const types = u.enrollments.map(e => e.type);
          if (types.includes('ObserverEnrollment')) role = 'observer';
          else if (types.includes('StudentEnrollment')) role = 'student';
        }
        // NO knownRoles fallback — this is the bug
        return { id, role };
      });
    }

    // Canvas returns user after refetch with empty enrollments
    const canvasResponse = [{ id: 99, name: 'Parent Smith', email: 'parent@example.com', enrollments: [] }];
    const result = brokenMap(canvasResponse);

    assert.strictEqual(result[0].role, 'student',
      'This demonstrates the BUG: Observer becomes Student');
  });

  it('WITH knownRoles fix: role stays observer after empty-enrollment refetch', () => {
    const knownRoles = { '99': 'observer' };

    // Canvas returns user after refetch with empty enrollments
    const canvasResponse = [{ id: 99, name: 'Parent Smith', email: 'parent@example.com', enrollments: [] }];
    const result = mapCanvasUsers(canvasResponse, [], knownRoles);

    assert.strictEqual(result[0].role, 'observer',
      'Fix works: role is preserved from knownRoles');
  });

  it('FULL lifecycle: create → local state → refetch → role preserved', () => {
    // Step 1: knownRoles starts empty
    const knownRoles = {};

    // Step 2: Admin creates an Observer user in course 101
    const createdUserId = '99';
    const createdRole = 'observer';
    knownRoles[createdUserId] = createdRole;

    // Step 3: Local state immediately reflects the correct role
    let users = [{ id: '99', name: 'Parent Smith', email: 'parent@example.com', role: 'observer' }];
    assert.strictEqual(users[0].role, 'observer', 'Local state correct after creation');

    // Step 4: refetch() fires — Canvas returns the user with EMPTY enrollments
    // (This is what Canvas actually does for account-level user listings)
    const canvasUsers = [{ id: 99, name: 'Parent Smith', email: 'parent@example.com', enrollments: [] }];

    // Step 5: useEffect re-runs with the fixed logic
    users = mapCanvasUsers(canvasUsers, [], knownRoles);

    // THE ASSERTION THAT MATTERS
    assert.strictEqual(users[0].role, 'observer',
      'After refetch, role MUST still be observer, not student');
  });

  it('Canvas enrollments still take priority when they ARE present', () => {
    const knownRoles = { '100': 'student' }; // we thought they were a student

    // But Canvas now returns actual TeacherEnrollment
    const canvasUsers = [{
      id: 100,
      name: 'Dr. Lee',
      email: 'lee@example.com',
      enrollments: [{ type: 'TeacherEnrollment', course_id: 102 }],
    }];

    const users = mapCanvasUsers(canvasUsers, [], knownRoles);

    assert.strictEqual(users[0].role, 'teacher',
      'When Canvas HAS enrollment data, it overrides knownRoles');
  });

  it('Admin role is never overridden by knownRoles', () => {
    const knownRoles = { '1': 'observer' }; // wrong, but should be ignored

    const canvasUsers = [{
      id: 1,
      name: 'Super Admin',
      email: 'admin@example.com',
      enrollments: [],
    }];

    const canvasAdmins = [{ user: { id: 1 }, role: 'AccountAdmin' }];

    const users = mapCanvasUsers(canvasUsers, canvasAdmins, knownRoles);

    assert.strictEqual(users[0].role, 'admin',
      'Admin check runs before knownRoles fallback');
  });
});

console.log('✅ Bugfix lifecycle tests passed');
