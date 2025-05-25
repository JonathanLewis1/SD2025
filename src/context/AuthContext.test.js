// src/context/AuthContext.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn()
}));

jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn()
}));

const mockUser = { email: 'user@example.com' };
const mockGetUserRole = jest.fn();

const TestComponent = () => {
  const { user, userRole, loading, error } = useAuth();
  return (
    <div>
      <div data-testid="user">{user?.email}</div>
      <div data-testid="role">{userRole}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    httpsCallable.mockReturnValue(mockGetUserRole);
  });

  test('renders null user when unauthenticated', async () => {
    onAuthStateChanged.mockImplementationOnce((auth, cb) => cb(null));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('');
      expect(screen.getByTestId('role').textContent).toBe('');
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  test('sets user and role when authenticated and role returned', async () => {
    onAuthStateChanged.mockImplementationOnce((auth, cb) => cb(mockUser));
    mockGetUserRole.mockResolvedValue({ data: { role: 'buyer' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user@example.com');
      expect(screen.getByTestId('role').textContent).toBe('buyer');
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
  });

  test('shows error when role is missing', async () => {
    onAuthStateChanged.mockImplementationOnce((auth, cb) => cb(mockUser));
    mockGetUserRole.mockResolvedValue({ data: {} });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toMatch(/no role in response/i);
    });
  });

  test('shows error when callable throws error', async () => {
    onAuthStateChanged.mockImplementationOnce((auth, cb) => cb(mockUser));
    mockGetUserRole.mockRejectedValue({
      message: 'Internal error',
      code: 'internal'
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toMatch(/error fetching user role/i);
    });
  });
});
