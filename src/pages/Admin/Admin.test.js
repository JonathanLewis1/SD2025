import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Admin from './Admin';
import { BrowserRouter } from 'react-router-dom';

// Mock firebase/functions
const mockGetAllUsers = jest.fn();
const mockGetAllComplaints = jest.fn();
const mockBanUser = jest.fn();

jest.mock('firebase/functions', () => ({
  httpsCallable: (functions, name) => {
    switch (name) {
      case 'getAllUsers': return mockGetAllUsers;
      case 'getAllComplaints': return mockGetAllComplaints;
      case 'banUser': return mockBanUser;
      default: return jest.fn();
    }
  }
}));

jest.mock('../../firebase', () => ({
  functions: {}
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Admin Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Given Admin loads, When data is fetched, Then users and complaints are shown', async () => {
    mockGetAllUsers.mockResolvedValue({
      data: [
        { id: '1', firstName: 'Jane', lastName: 'Doe', email: 'jane@demo.com', role: 'buyer' }
      ]
    });
    mockGetAllComplaints.mockResolvedValue({
      data: [
        { name: 'User A', email: 'a@example.com', message: 'Issue 1' }
      ]
    });

    renderWithRouter(<Admin />);

    // Wait for users table to appear
    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@demo.com')).toBeInTheDocument();
      expect(screen.getByText('buyer')).toBeInTheDocument();
    });

    // Wait for complaints to appear
    expect(screen.getByText('User A')).toBeInTheDocument();
    expect(screen.getByText('a@example.com')).toBeInTheDocument();
    expect(screen.getByText('Issue 1')).toBeInTheDocument();
  });

  test('Given user data, When ban is clicked, Then banUser is called and user is removed', async () => {
    mockGetAllUsers.mockResolvedValue({
      data: [
        { id: '2', firstName: 'John', lastName: 'Smith', email: 'john@demo.com', role: 'seller' }
      ]
    });
    mockGetAllComplaints.mockResolvedValue({ data: [] });
    mockBanUser.mockResolvedValue({ data: { success: true } });

    renderWithRouter(<Admin />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Ban'));

    await waitFor(() => {
      expect(mockBanUser).toHaveBeenCalledWith({ userId: '2', email: 'john@demo.com' });
      expect(screen.queryByText('John')).not.toBeInTheDocument();
    });
  });

  test('Given empty responses, When fetched, Then show empty tables without crashing', async () => {
    mockGetAllUsers.mockResolvedValue({ data: [] });
    mockGetAllComplaints.mockResolvedValue({ data: [] });

    renderWithRouter(<Admin />);
    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Complaints')).toBeInTheDocument();
    });
  });
});
