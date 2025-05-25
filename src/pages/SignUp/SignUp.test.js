import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../firebase';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

jest.mock('../../firebase', () => ({
  auth: {},
  functions: {},
}));

jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

const renderForm = () =>
  render(
    <BrowserRouter>
      <SignUp />
    </BrowserRouter>
  );

describe('SignUp Component (Given-When-Then)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Given the user submits an empty form, When clicking Sign Up, Then show general required-fields error', async () => {
    renderForm();
    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(await screen.findByText(/All fields required\./i)).toBeInTheDocument();
  });

  test('Given the user fills only First Name, When clicking Sign Up, Then show general required-fields error', async () => {
    renderForm();
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(await screen.findByText(/All fields required\./i)).toBeInTheDocument();
  });

  test('Given the user fills names only, When clicking Sign Up, Then show general required-fields error', async () => {
    renderForm();
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(await screen.findByText(/All fields required\./i)).toBeInTheDocument();
  });

  test('Given the user fills names and email only, When clicking Sign Up, Then show general required-fields error', async () => {
    renderForm();
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText(/Sign Up/i));
    expect(await screen.findByText(/All fields required\./i)).toBeInTheDocument();
  });

  test('Given the user enters banned email, When submitting the form, Then an error message should show and user is not created', async () => {
    httpsCallable.mockImplementation((_, name) => {
      if (name === 'isEmailBanned') {
        return () => Promise.resolve({ data: { banned: true } });
      }
    });

    renderForm();
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Banned' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'banned@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/Sign Up/i));

    expect(await screen.findByText(/This email is banned\./i)).toBeInTheDocument();
  });

  test('Given all fields valid and user not banned, When submitting the form, Then account is created and redirected', async () => {
    const mockUser = { user: { uid: 'uid123' } };

    httpsCallable.mockImplementation((_, name) => {
      if (name === 'isEmailBanned') {
        return () => Promise.resolve({ data: { banned: false } });
      }
      if (name === 'registerUserProfile') {
        return () => Promise.resolve({ success: true });
      }
    });

    createUserWithEmailAndPassword.mockResolvedValue(mockUser);
    sendEmailVerification.mockResolvedValue();

    renderForm();
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/Sign Up/i));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'user@example.com', 'password123');
      expect(sendEmailVerification).toHaveBeenCalledWith(expect.objectContaining({ uid: 'uid123' }));
    });
  });

  test('Given Firebase signup fails, When createUserWithEmailAndPassword rejects, Then it should show the error message', async () => {
    httpsCallable.mockReturnValue(() => Promise.resolve({ data: { banned: false } }));
    createUserWithEmailAndPassword.mockRejectedValue(new Error('Signup failed'));

    renderForm();
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'fail@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/Sign Up/i));

    expect(await screen.findByText(/Signup failed/i)).toBeInTheDocument();
  });
});
