import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

// MOCK NAVIGATE ONCE
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// MOCK FIREBASE AUTH FUNCTIONS
const mockSignInWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockSignOut = jest.fn();
const mockGetUserRole = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
  sendPasswordResetEmail: (...args) => mockSendPasswordResetEmail(...args),
  signOut: () => mockSignOut(),
  onAuthStateChanged: (auth, callback) => {
    callback(null);
    return mockUnsubscribe; // unsubscribe fn
  },
  setPersistence: () => Promise.resolve(),
  browserSessionPersistence: {},
}));

// MOCK FIREBASE FUNCTIONS
jest.mock('firebase/functions', () => ({
  httpsCallable: () => mockGetUserRole,
}));

// MOCK FIREBASE EXPORTS
jest.mock('../../firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn().mockResolvedValue('fake-token'),
    },
  },
  functions: {},
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Login Component Given/When/Then Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('Given Login component rendered, When viewed, Then inputs and button visible', () => {
    renderWithRouter(<Login />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('Given empty email, When submit, Then show error', async () => {
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/email and password are required/i)).toBeInTheDocument();
  });

  test('Given empty password, When submit, Then show error', async () => {
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'email@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByText(/email and password are required/i)).toBeInTheDocument();
  });

//   test('Given valid credentials, When submit, Then signInWithEmailAndPassword called', async () => {
//     mockSignInWithEmailAndPassword.mockResolvedValue({
//       user: { uid: 'user1', emailVerified: true, getIdToken: jest.fn().mockResolvedValue('token') },
//     });
//     mockGetUserRole.mockResolvedValue({ data: { role: 'buyer' } });

//     renderWithRouter(<Login />);
//     fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'test@example.com' } });
//     fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
//     fireEvent.click(screen.getByRole('button', { name: /log in/i }));

//     await waitFor(() => {
//       expect(mockSignInWithEmailAndPassword).toHaveBeenCalled();
//       expect(mockNavigate).toHaveBeenCalledWith('/home');
//     });
//   });

  test('Given invalid credentials, When submit, Then show invalid credentials error', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  test('Given forgot password clicked with empty email, Then show error', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText(/forgot your password\?/i));
    expect(await screen.findByText(/please enter your email first/i)).toBeInTheDocument();
  });

  test('Given forgot password clicked with valid email, Then show success', async () => {
    mockSendPasswordResetEmail.mockResolvedValue();

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'reset@example.com' } });
    fireEvent.click(screen.getByText(/forgot your password\?/i));

    expect(await screen.findByText(/password reset email sent/i)).toBeInTheDocument();
  });

  test('Given forgot password fails, Then show failure error', async () => {
    mockSendPasswordResetEmail.mockRejectedValue(new Error('fail'));

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'fail@example.com' } });
    fireEvent.click(screen.getByText(/forgot your password\?/i));

    expect(await screen.findByText(/failed to send reset email/i)).toBeInTheDocument();
  });

  test('Given unverified email login, Then show verify email error and signOut called', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'u123', emailVerified: false, getIdToken: jest.fn() },
    });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'unverified@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/please verify your email before logging in/i)).toBeInTheDocument();
    expect(mockSignOut).toHaveBeenCalled();
  });

  test('useEffect unsubscribes auth listener on unmount', () => {
    const { unmount } = renderWithRouter(<Login />);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
