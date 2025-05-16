import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from './SignUp';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Firebase and related functions
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSendEmailVerification = jest.fn();
const mockRegisterUserProfile = jest.fn();

jest.mock('../../firebase', () => ({
  auth: {},
  db: {},
  functions: {},
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...args) => mockCreateUserWithEmailAndPassword(...args),
  sendEmailVerification: (...args) => mockSendEmailVerification(...args),
}));

jest.mock('firebase/functions', () => ({
  httpsCallable: () => mockRegisterUserProfile,
}));

// Helper to wrap component with router
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockRegisterUserProfile.mockClear();
  });

  test('Given user fills valid info, when submitting, then navigates to /login', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: {
        uid: 'abc123',
        email: 'john@x.com',
        emailVerified: false,
        metadata: {},
      },
    });
    mockSendEmailVerification.mockResolvedValue();
    mockRegisterUserProfile.mockResolvedValue();

    renderWithRouter(<SignUp />);

    fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'john@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/role/i), { target: { value: 'seller' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'john@x.com', '123456');
      expect(mockSendEmailVerification).toHaveBeenCalled();
      expect(mockRegisterUserProfile).toHaveBeenCalledWith({
        uid: 'abc123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'seller',
        email: 'john@x.com',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('Given empty first name, when submitting, then shows error "First Name is required"', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'john@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument();
  });

  test('Given empty last name, when submitting, then shows error "Last Name is required"', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'john@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/last name is required/i)).toBeInTheDocument();
  });

  test('Given empty email, when submitting, then shows error "Email is required"', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  test('Given empty password, when submitting, then shows error "Password is required"', async () => {
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'john@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test('Given sign-up API error occurs, when submitting, then shows error message', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error('Email already in use'));
    renderWithRouter(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'john@x.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
  });
});
