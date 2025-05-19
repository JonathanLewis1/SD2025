// suppress React-Router future warnings
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

// 1) Mock everything
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  auth: {},
}));
jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));
jest.mock('../firebase', () => ({ auth: {}, db: {} }));

// 2) Spy on Navigate to render a marker
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    Navigate: ({ to }) => <div data-testid="nav" data-to={to} />,
  };
});

describe('ProtectedRoute Component', () => {
  const mockUser = { uid: 'u1', emailVerified: true };
  beforeEach(() => {
    jest.resetAllMocks();
    // onAuthStateChanged calls callback immediately and returns an unsubscribe fn
    onAuthStateChanged.mockImplementation((a, cb) => {
      cb(mockUser);
      return jest.fn();
    });
  });

  test('Given no user or unverified, Then redirects to /login', async () => {
    // callback with either null or unverified
    onAuthStateChanged.mockImplementation((a, cb) => {
      cb(null);
      return jest.fn();
    });

    const { getByTestId } = render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>OK</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(getByTestId('nav').dataset.to).toBe('/login');
    });
  });

  test('Given verified user with disallowed role, Then redirects to /login', async () => {
    // Firestore returns a role not in allowedRoles
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'buyer' }) });

    const { getByTestId } = render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>OK</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(getByTestId('nav').dataset.to).toBe('/login');
    });
  });

  test('Given verified user with allowed role, Then renders children', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'seller' }) });

    const { queryByTestId, getByText } = render(
      <ProtectedRoute allowedRoles={['seller']}>
        <div data-testid="child">Secret</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(queryByTestId('nav')).toBeNull();
      expect(getByText('Secret')).toBeInTheDocument();
    });
  });

  test('Given firestore error, Then redirects to /error', async () => {
    getDoc.mockRejectedValue(new Error('oops'));

    const { getByTestId } = render(
      <ProtectedRoute allowedRoles={['seller']}>
        <div>OK</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(getByTestId('nav').dataset.to).toBe('/error');
    });
  });
});
