// src/context/AuthContext.test.js

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase';

// Mocks
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn()
}));
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn()
}));
jest.mock('../firebase', () => ({
  auth: {},
  functions: {}
}));

// A helper component that displays context values
function DisplayAuth() {
  const { user, userRole, loading, error, isCheckingRole } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'null'}</span>
      <span data-testid="role">{userRole ?? 'null'}</span>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="error">{error ?? 'null'}</span>
      <span data-testid="checking">{isCheckingRole.toString()}</span>
    </div>
  );
}

describe('AuthProvider and useAuth', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  function setup(onChangeImplementation) {
    onAuthStateChanged.mockImplementation(onChangeImplementation);
    render(
      <AuthProvider>
        <DisplayAuth />
      </AuthProvider>
    );
  }

  test('Given no user, When auth state reports null, Then loading→false, user & role null, no error', async () => {
    setup((_, cb) => {
      cb(null);
      return () => {};
    });

    // advance both timers (effect and role-check)
    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('role').textContent).toBe('null');
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('error').textContent).toBe('null');
    expect(screen.getByTestId('checking').textContent).toBe('false');
  });

  test('Given valid user and valid role, Then userRole set and no error', async () => {
    const fakeUser = { email: 'a@b.com' };
    const fakeFn = jest.fn().mockResolvedValue({ data: { role: 'buyer' } });
    httpsCallable.mockReturnValue(fakeFn);

    setup((_, cb) => {
      cb(fakeUser);
      return () => {};
    });

    await act(async () => {
      jest.runAllTimers();
      await fakeFn();
    });

    expect(screen.getByTestId('user').textContent).toBe('a@b.com');
    expect(screen.getByTestId('role').textContent).toBe('buyer');
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('error').textContent).toBe('null');
    expect(screen.getByTestId('checking').textContent).toBe('false');
  });

  test('Given getUserRole returns no data, Then error "Failed to verify user role: No data received"', async () => {
    const fakeUser = { email: 'x@y.com' };
    const fakeFn = jest.fn().mockResolvedValue({ data: null });
    httpsCallable.mockReturnValue(fakeFn);

    setup((_, cb) => { cb(fakeUser); return () => {}; });

    await act(async () => {
      jest.runAllTimers();
      await fakeFn();
    });

    expect(screen.getByTestId('error').textContent).toBe('Failed to verify user role: No data received');
  });

  test('Given getUserRole returns data without role, Then error "Failed to verify user role: No role in response"', async () => {
    const fakeUser = { email: 'u@v.com' };
    const fakeFn = jest.fn().mockResolvedValue({ data: { foo: 'bar' } });
    httpsCallable.mockReturnValue(fakeFn);

    setup((_, cb) => { cb(fakeUser); return () => {}; });

    await act(async () => {
      jest.runAllTimers();
      await fakeFn();
    });

    expect(screen.getByTestId('error').textContent).toBe('Failed to verify user role: No role in response');
  });

  test('Given getUserRole returns invalid role, Then error "Invalid user role: hacker"', async () => {
    const fakeUser = { email: 'p@q.com' };
    const fakeFn = jest.fn().mockResolvedValue({ data: { role: 'hacker' } });
    httpsCallable.mockReturnValue(fakeFn);

    setup((_, cb) => { cb(fakeUser); return () => {}; });

    await act(async () => {
      jest.runAllTimers();
      await fakeFn();
    });

    expect(screen.getByTestId('error').textContent).toBe('Invalid user role: hacker');
  });

  test('Given getUserRole throws not-found, Then error "User profile not found"', async () => {
    const fakeUser = { email: 'n@o.com' };
    const err = Object.assign(new Error('oops'), { code: 'not-found' });
    const fakeFn = jest.fn().mockRejectedValue(err);
    httpsCallable.mockReturnValue(fakeFn);

    setup((_, cb) => { cb(fakeUser); return () => {}; });

    await act(async () => {
      jest.runAllTimers();
      try { await fakeFn(); } catch {}
    });

    expect(screen.getByTestId('error').textContent).toBe('User profile not found');
  });

  test('Given getUserRole throws unauthenticated, Then error "Please sign in again"', async () => {
    const fakeUser = { email: 's@t.com' };
    const err = Object.assign(new Error('denied'), { code: 'unauthenticated' });
    const fakeFn = jest.fn().mockRejectedValue(err);
    httpsCallable.mockReturnValue(fakeFn);

    setup((_, cb) => { cb(fakeUser); return () => {}; });

    await act(async () => {
      jest.runAllTimers();
      try { await fakeFn(); } catch {}
    });

    expect(screen.getByTestId('error').textContent).toBe('Please sign in again');
  });

  test('Given getUserRole throws other error, Then error "Error fetching user role"', async () => {
    const fakeUser = { email: 'e@f.com' };
    const err = new Error('gone wrong');
    const fakeFn = jest.fn().mockRejectedValue(err);
    httpsCallable.mockReturnValue(fakeFn);

    setup((_, cb) => { cb(fakeUser); return () => {}; });

    await act(async () => {
      jest.runAllTimers();
      try { await fakeFn(); } catch {}
    });

    expect(screen.getByTestId('error').textContent).toBe('Error fetching user role');
  });
});
