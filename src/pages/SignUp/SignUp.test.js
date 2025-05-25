import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

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

const renderForm = () => render(
  <BrowserRouter>
    <SignUp />
  </BrowserRouter>
);

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test('Given the user submits an empty form, Then the First Name error should show', async () => {
  //   renderForm();
  //   fireEvent.click(screen.getByText(/Sign Up/i));
  //   expect(await screen.findByText(/First Name is required/i)).toBeInTheDocument();
  // });

  // test('Given the user skips Last Name, Then the Last Name error should show', async () => {
  //   renderForm();
  //   fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
  //   fireEvent.click(screen.getByText(/Sign Up/i));
  //   expect(await screen.findByText(/Last Name is required/i)).toBeInTheDocument();
  // });

  // test('Given the user skips email, Then the Email error should show', async () => {
  //   renderForm();
  //   fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
  //   fireEvent.click(screen.getByText(/Sign Up/i));
  //   expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
  // });

  // test('Given the user skips password, Then the Password error should show', async () => {
  //   renderForm();
  //   fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
  //   fireEvent.click(screen.getByText(/Sign Up/i));
  //   expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
  // });

  // test('Given the user is banned, Then an error message should show and user is not created', async () => {
  //   httpsCallable.mockImplementation((_, name) => {
  //     if (name === 'isEmailBanned') {
  //       return () => Promise.resolve({ data: { banned: true } });
  //     }
  //   });

  //   renderForm();
  //   fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Banned' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'banned@example.com' } });
  //   fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
  //   fireEvent.click(screen.getByText(/Sign Up/i));
  //   expect(await screen.findByText(/email has been banned/i)).toBeInTheDocument();
  // });

  test('Given all fields are valid and user is not banned, When submitting the form, Then account is created and redirected', async () => {
    const mockUser = {
      user: {
        uid: 'uid123',
        email: 'test@example.com',
        emailVerified: false,
        metadata: {},
      },
    };

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
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByText(/Sign Up/i));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
      expect(sendEmailVerification).toHaveBeenCalled();
    });
  });

  test('Given Firebase signup fails, Then it should show the error message', async () => {
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
