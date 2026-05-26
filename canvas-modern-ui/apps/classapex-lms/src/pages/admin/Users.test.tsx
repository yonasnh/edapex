import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUsersPage from './Users';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockCanvasFetch = vi.fn();
const mockRefetch = vi.fn();
let mockCanvasUsers: any[] = [];
let mockCanvasAdmins: any[] = [];
let mockCourses: any[] = [];

vi.mock('../../hooks/useCanvasQuery', () => ({
  useCanvasQuery: vi.fn((endpoint: string, _params?: any) => {
    if (endpoint === '/api/v1/accounts/1/users') {
      return { data: mockCanvasUsers, isLoading: false, refetch: mockRefetch };
    }
    if (endpoint === '/api/v1/accounts/1/admins') {
      return { data: mockCanvasAdmins, isLoading: false };
    }
    if (endpoint === '/api/v1/courses') {
      return { data: mockCourses, isLoading: false };
    }
    return { data: null, isLoading: false };
  }),
  canvasFetch: (...args: any[]) => mockCanvasFetch(...args),
}));

vi.mock('../../contexts/RoleContext', () => ({
  useRole: () => ({ role: 'admin', masqueradeAs: vi.fn() }),
}));

vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
    showAlert: vi.fn(),
  }),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderPage() {
  return render(<AdminUsersPage />);
}

function openCreateModal() {
  const addBtn = screen.getByRole('button', { name: /add user/i });
  fireEvent.click(addBtn);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AdminUsersPage — user creation & role assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvasUsers = [];
    mockCanvasAdmins = [];
    mockCourses = [
      { id: 101, name: 'Introduction to Biology' },
      { id: 102, name: 'Advanced Calculus' },
    ];
  });

  it('shows error when creating Observer without selecting a course', async () => {
    const mockShowToast = vi.fn();
    vi.mocked(await import('../../hooks/useNotification')).useNotification = () => ({
      showToast: mockShowToast,
      showConfirm: vi.fn().mockResolvedValue(true),
      showAlert: vi.fn(),
    });

    renderPage();
    openCreateModal();

    // Fill name & email
    fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
      target: { value: 'Jane Observer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter email address/i), {
      target: { value: 'jane.observer@example.com' },
    });

    // Select Observer role
    const roleSelect = screen.getByDisplayValue('Student');
    fireEvent.change(roleSelect, { target: { value: 'observer' } });

    // Leave course empty and submit
    const createBtn = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Course is required for this role',
          type: 'error',
        })
      );
    });

    // Should NOT call canvasFetch for user creation
    expect(mockCanvasFetch).not.toHaveBeenCalled();
  });

  it('creates user + ObserverEnrollment when course is selected', async () => {
    mockCanvasFetch
      .mockResolvedValueOnce({ id: 999, name: 'Jane Observer' }) // create user
      .mockResolvedValueOnce({ id: 888 }); // create enrollment

    renderPage();
    openCreateModal();

    fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
      target: { value: 'Jane Observer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter email address/i), {
      target: { value: 'jane.observer@example.com' },
    });

    const roleSelect = screen.getByDisplayValue('Student');
    fireEvent.change(roleSelect, { target: { value: 'observer' } });

    // Course selector appears after picking a non-admin role
    const courseSelect = await screen.findByDisplayValue('Select a course...');
    fireEvent.change(courseSelect, { target: { value: '101' } });

    const createBtn = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockCanvasFetch).toHaveBeenCalledTimes(2);
    });

    // 1st call: create user
    expect(mockCanvasFetch).toHaveBeenNthCalledWith(
      1,
      '/api/v1/accounts/1/users',
      expect.objectContaining({ method: 'POST' })
    );

    // 2nd call: enroll as Observer
    expect(mockCanvasFetch).toHaveBeenNthCalledWith(
      2,
      '/api/v1/courses/101/enrollments',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          enrollment: expect.objectContaining({
            type: 'ObserverEnrollment',
            enrollment_state: 'active',
          }),
        }),
      })
    );
  });

  it('creates user + AccountAdmin when role is admin (no course needed)', async () => {
    mockCanvasFetch
      .mockResolvedValueOnce({ id: 777, name: 'Super Admin' })
      .mockResolvedValueOnce({ id: 666 });

    renderPage();
    openCreateModal();

    fireEvent.change(screen.getByPlaceholderText(/enter user's full name/i), {
      target: { value: 'Super Admin' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter email address/i), {
      target: { value: 'super.admin@example.com' },
    });

    const roleSelect = screen.getByDisplayValue('Student');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    // No course selector should appear for admin
    expect(screen.queryByText(/select a course/i)).not.toBeInTheDocument();

    const createBtn = screen.getByRole('button', { name: /create user/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(mockCanvasFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockCanvasFetch).toHaveBeenNthCalledWith(
      2,
      '/api/v1/accounts/1/admins',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          user_id: 777,
          role: 'AccountAdmin',
        }),
      })
    );
  });

  it('maps ObserverEnrollment from Canvas API to observer role in UI', () => {
    mockCanvasUsers = [
      {
        id: 42,
        name: 'Parent Smith',
        email: 'parent.smith@example.com',
        enrollments: [
          { id: 501, type: 'ObserverEnrollment', course_id: 101 },
        ],
      },
    ];

    renderPage();

    expect(screen.getByText('Parent Smith')).toBeInTheDocument();
    expect(screen.getByText('observer')).toBeInTheDocument();
  });

  it('prefers TeacherEnrollment over StudentEnrollment when user has both', () => {
    mockCanvasUsers = [
      {
        id: 43,
        name: 'Dr. Lee',
        email: 'lee@example.com',
        enrollments: [
          { id: 502, type: 'StudentEnrollment', course_id: 101 },
          { id: 503, type: 'TeacherEnrollment', course_id: 102 },
        ],
      },
    ];

    renderPage();

    expect(screen.getByText('Dr. Lee')).toBeInTheDocument();
    expect(screen.getByText('teacher')).toBeInTheDocument();
  });

  it('falls back to student when no enrollments are present', () => {
    mockCanvasUsers = [
      {
        id: 44,
        name: 'New User',
        email: 'new@example.com',
        enrollments: [],
      },
    ];

    renderPage();

    expect(screen.getByText('New User')).toBeInTheDocument();
    expect(screen.getByText('student')).toBeInTheDocument();
  });
});
