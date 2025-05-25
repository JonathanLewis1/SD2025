// src/pages/Login/Login.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

// MOCK NAVIGATE
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// MOCK FIREBASE AUTH FUNCTIONS
const mockSignIn = jest.fn();
const mockSendReset = jest.fn();
const mockSignOut = jest.fn();
const mockCheckBanned = jest.fn();
const mockGetRole = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args) => mockSignIn(...args),
  sendPasswordResetEmail: (...args) => mockSendReset(...args),
  signOut: () => mockSignOut(),
  onAuthStateChanged: (_auth, cb) => { cb(null); return mockUnsubscribe; },
  setPersistence: () => Promise.resolve(),
  browserSessionPersistence: {},
}));

jest.mock('firebase/functions', () => ({
  httpsCallable: (_fns, name) => name === 'isEmailBanned' ? mockCheckBanned : mockGetRole,
}));

// MOCK FIREBASE EXPORTS
jest.mock('../../firebase', () => ({
  auth: {},
  functions: {},
}));

const renderWithRouter = ui => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Login Component Given/When/Then Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('Given component mounted, When viewed, Then email, password inputs and log-in button appear', () => {
    renderWithRouter(<Login />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('Given empty inputs, When form submitted, Then show "Email and password required."', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/email and password required\./i)).toBeInTheDocument();
  });

  test('Given wrong credentials, When form submitted, Then show "Invalid credentials."', async () => {
    mockSignIn.mockRejectedValue({ code: 'auth/wrong-password' });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'bad@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/invalid credentials\./i)).toBeInTheDocument();
  });

  test('Given unverified email, When sign-in succeeds, Then show "Please verify your email first." and signOut called', async () => {
    mockSignIn.mockResolvedValue({ user: { emailVerified: false } });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'u@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/please verify your email first\./i)).toBeInTheDocument();
    expect(mockSignOut).toHaveBeenCalled();
  });

  test('Given banned account, When sign-in succeeds and ban checked, Then show "Account banned." and signOut called', async () => {
    mockSignIn.mockResolvedValue({ user: { emailVerified: true } });
    mockCheckBanned.mockResolvedValue({ data: { banned: true } });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'ban@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/account banned\./i)).toBeInTheDocument();
    expect(mockSignOut).toHaveBeenCalled();
  });

  test('Given buyer role, When login flow completes, Then navigate to "/home"', async () => {
    mockSignIn.mockResolvedValue({ user: { emailVerified: true } });
    mockCheckBanned.mockResolvedValue({ data: { banned: false } });
    mockGetRole.mockResolvedValue({ data: { role: 'buyer' } });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'b@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/home'));
  });

  test('Given seller role, When login flow completes, Then navigate to "/sellerpage"', async () => {
    mockSignIn.mockResolvedValue({ user: { emailVerified: true } });
    mockCheckBanned.mockResolvedValue({ data: { banned: false } });
    mockGetRole.mockResolvedValue({ data: { role: 'seller' } });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 's@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/sellerpage'));
  });

  test('Given admin role, When login flow completes, Then navigate to "/admin"', async () => {
    mockSignIn.mockResolvedValue({ user: { emailVerified: true } });
    mockCheckBanned.mockResolvedValue({ data: { banned: false } });
    mockGetRole.mockResolvedValue({ data: { role: 'admin' } });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'));
  });

  test('Given unknown role, When login flow completes, Then show "Unknown role."', async () => {
    mockSignIn.mockResolvedValue({ user: { emailVerified: true } });
    mockCheckBanned.mockResolvedValue({ data: { banned: false } });
    mockGetRole.mockResolvedValue({ data: { role: 'mystery' } });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/unknown role\./i)).toBeInTheDocument();
  });

  // test('Given no email entered, When clicking "Forgot your password?", Then show "Enter your email first."', async () => {
  //   renderWithRouter(<Login />);
  //   await act(async () => {
  //     fireEvent.click(screen.getByText(/forgot your password\?/i));
  //   });
  //   expect(await screen.findByText(/enter your email first\./i)).toBeInTheDocument();
  // });

  // test('Given valid email entered, When clicking "Forgot your password?", Then show "Reset email sent!"', async () => {
  //   mockSendReset.mockResolvedValue();
  //   renderWithRouter(<Login />);
  //   fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'reset@x.com' } });
  //   await act(async () => {
  //     fireEvent.click(screen.getByText(/forgot your password\?/i));
  //   });
  //   expect(await screen.findByText(/reset email sent!/i)).toBeInTheDocument();
  // });

  // test('Given send reset fails, When clicking "Forgot your password?", Then show "Failed to send reset email."', async () => {
  //   mockSendReset.mockRejectedValue(new Error('fail'));
  //   renderWithRouter(<Login />);
  //   fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'fail@x.com' } });
  //   await act(async () => {
  //     fireEvent.click(screen.getByText(/forgot your password\?/i));
  //   });
  //   expect(await screen.findByText(/failed to send reset email\./i)).toBeInTheDocument();
  // });

  test('Given component unmounted, When cleanup runs, Then auth listener is unsubscribed', () => {
    const { unmount } = renderWithRouter(<Login />);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
