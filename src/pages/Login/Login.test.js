import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../firebase';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(cb => { cb({ uid: '123' }); return jest.fn(); }),
  setPersistence: jest.fn().mockResolvedValue(),
  browserSessionPersistence: {}
}));

jest.mock('firebase/functions', () => ({ httpsCallable: jest.fn() }));
jest.mock('../../firebase', () => ({ auth: {}, functions: {} }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderLogin = () =>
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Given component mounts, When effect runs, Then subscribe to auth state changes', () => {
    renderLogin();
    expect(onAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function));
  });

  test('Given no user input, When rendered, Then placeholders and signup link are visible', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /log in/i });
    expect(btn).toBeEnabled();
    expect(screen.getByText(/sign up now/i)).toHaveAttribute('href', '/signup');
  });

  test('Given empty input fields, When clicking Log In, Then show required-fields error', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/email and password required/i)).toBeInTheDocument();
  });

  test('Given wrong credentials, When signIn rejects auth/wrong-password, Then show invalid-credentials error', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'x@y.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test('Given a non-auth error, When signIn rejects with other code, Then show generic login-failed message', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'some-other-code', message: 'oops' });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'e@f.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/login failed: oops/i)).toBeInTheDocument();
  });

  test('Given unverified user, When signIn resolves emailVerified=false, Then show verify-email error and sign out', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: false } });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'u@v.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/please verify your email first/i)).toBeInTheDocument();
    expect(signOut).toHaveBeenCalled();
  });

  test('Given a banned account, When checkBanned returns banned, Then show banned error and sign out', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: true } });
    const banFn = jest.fn().mockResolvedValue({ data: { banned: true } });
    httpsCallable.mockReturnValueOnce(banFn);
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'ban@ned.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/account banned/i)).toBeInTheDocument();
    expect(signOut).toHaveBeenCalled();
  });

  test('Given admin role, When checkRole returns admin, Then navigate to admin page', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: true } });
    const banFn = jest.fn().mockResolvedValue({ data: { banned: false } });
    const roleFn = jest.fn().mockResolvedValue({ data: { role: 'admin' } });
    httpsCallable.mockReturnValueOnce(banFn).mockReturnValueOnce(roleFn);
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@d.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  test('Given unknown role, When checkRole returns ghost, Then show unknown-role error', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: true } });
    const banFn = jest.fn().mockResolvedValue({ data: { banned: false } });
    const roleFn = jest.fn().mockResolvedValue({ data: { role: 'ghost' } });
    httpsCallable.mockReturnValueOnce(banFn).mockReturnValueOnce(roleFn);
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'g@h.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/unknown role/i)).toBeInTheDocument();
  });
});
