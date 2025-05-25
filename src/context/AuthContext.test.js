<<<<<<< HEAD
// src/context/AuthContext.test.js

import React from 'react';
import { render, screen, act } from '@testing-library/react';
=======
//  mocks before any imports 
jest.mock('../firebase', () => ({
  auth: {},
  functions: {},
}));
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
>>>>>>> 4780ca96d1428569cdb5a761de212108ee5bcbf0
import { AuthProvider, useAuth } from './AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase';

<<<<<<< HEAD
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
=======
// tiny consumer to inspect context
function TestConsumer() {
  const { user, userRole, loading, error, isCheckingRole } = useAuth();
  return (
    <>
      <p data-testid="user">{user ? user.email : 'no-user'}</p>
      <p data-testid="role">{String(userRole)}</p>
      <p data-testid="loading">{String(loading)}</p>
      <p data-testid="checking">{String(isCheckingRole)}</p>
      <p data-testid="error">{error || 'no-error'}</p>
    </>
  );
}

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
  jest.useRealTimers();
});

describe('AuthContext / useAuth', () => {
  const unsubscribeMock = jest.fn();

  it('Given useAuth is called outside of AuthProvider, When the consumer renders, Then it should throw an error', () => {
    expect(() => render(<TestConsumer />))
      .toThrow(/useAuth must be used within an AuthProvider/);
  });

  it('Given AuthProvider is mounted, When it unmounts, Then it calls the unsubscribe function', () => {
    onAuthStateChanged.mockImplementation(() => unsubscribeMock);
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    unmount();
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  describe('When no user is signed in', () => {
    beforeEach(() => {
      onAuthStateChanged.mockImplementation((auth, cb) => {
        cb(null);
        return unsubscribeMock;
      });
    });

    it('Given onAuthStateChanged reports null, When the provider initializes, Then user is "no-user", role is null, loading is false, and no error', async () => {
      jest.useFakeTimers();
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await act(async () => {});

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('role')).toHaveTextContent('null');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  describe('When a user is signed in', () => {
    const fakeUser = { email: 'alice@example.com' };
    let getUserRoleMock;

    beforeEach(() => {
      onAuthStateChanged.mockImplementation((auth, cb) => {
        cb(fakeUser);
        return unsubscribeMock;
      });
      getUserRoleMock = jest.fn();
      httpsCallable.mockReturnValue(getUserRoleMock);
    });

    function flushAllTimers() {
      act(() => jest.advanceTimersByTime(2000));
    }

    it('Given a valid role response, When role check completes, Then it sets userRole to "seller", clears error, and stops loading', async () => {
      jest.useFakeTimers();
      getUserRoleMock.mockResolvedValue({ data: { role: 'seller' } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      flushAllTimers();
      await act(async () => {});

      expect(getUserRoleMock).toHaveBeenCalledWith({ email: fakeUser.email });
      expect(screen.getByTestId('user')).toHaveTextContent('alice@example.com');
      expect(screen.getByTestId('role')).toHaveTextContent('seller');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('Given the role function returns no data.role, When role check completes, Then it leaves userRole null and shows the proper error message', async () => {
      jest.useFakeTimers();
      getUserRoleMock.mockResolvedValue({ data: {} });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      flushAllTimers();
      await act(async () => {});

      expect(screen.getByTestId('role')).toHaveTextContent('null');
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Failed to verify user role: No role in response'
      );
    });

    it('Given the role function throws code "not-found", When role check fails, Then it shows "User profile not found"', async () => {
      jest.useFakeTimers();
      const err = new Error();
      err.code = 'not-found';
      getUserRoleMock.mockRejectedValue(err);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      flushAllTimers();
      await act(async () => {});

      expect(screen.getByTestId('error')).toHaveTextContent('User profile not found');
    });

    it('Given the role function throws code "invalid-argument", When role check fails, Then it displays the error message from the exception', async () => {
      jest.useFakeTimers();
      const err = new Error('Bad data');
      err.code = 'invalid-argument';
      getUserRoleMock.mockRejectedValue(err);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      flushAllTimers();
      await act(async () => {});

      expect(screen.getByTestId('error')).toHaveTextContent('Bad data');
    });

    it('Given the role function throws code "unauthenticated", When role check fails, Then it shows "Please sign in again"', async () => {
      jest.useFakeTimers();
      const err = new Error();
      err.code = 'unauthenticated';
      getUserRoleMock.mockRejectedValue(err);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      flushAllTimers();
      await act(async () => {});

      expect(screen.getByTestId('error')).toHaveTextContent('Please sign in again');
>>>>>>> 4780ca96d1428569cdb5a761de212108ee5bcbf0
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
