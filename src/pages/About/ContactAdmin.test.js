import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactAdmin from './ContactAdmin';
import { httpsCallable } from 'firebase/functions';

// Mock firebase/functions
jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}));

// Mock firebase.js
jest.mock('../../firebase', () => ({
  functions: {},
}));

describe('ContactAdmin Component', () => {
  beforeEach(() => {
    httpsCallable.mockClear();
  });

  test('Given the ContactAdmin form is loaded, Then all form fields should render', () => {
    render(<ContactAdmin />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
  });

  test('Given the user types into the form, When they enter values, Then the input fields should reflect the typed values', () => {
    render(<ContactAdmin />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Hello Admin' } });

    expect(screen.getByLabelText(/Name/i).value).toBe('John');
    expect(screen.getByLabelText(/Email/i).value).toBe('john@example.com');
    expect(screen.getByLabelText(/Message/i).value).toBe('Hello Admin');
  });

  test('Given valid form input, When the user submits the form, Then the firebase function should be called and confirmation shown', async () => {
    const mockSubmit = jest.fn().mockResolvedValue({});
    httpsCallable.mockReturnValue(mockSubmit);

    render(<ContactAdmin />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Need help' } });
    fireEvent.click(screen.getByText(/Send/i));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Jane',
        email: 'jane@example.com',
        message: 'Need help',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Thank you for your message/i)).toBeInTheDocument();
    });
  });

  test('Given the firebase call fails, When the user submits the form, Then an alert should notify the user of the error', async () => {
    const mockSubmit = jest.fn().mockRejectedValue(new Error('fail'));
    httpsCallable.mockReturnValue(mockSubmit);
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ContactAdmin />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Bob' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'bob@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Issue' } });
    fireEvent.click(screen.getByText(/Send/i));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to send your message. Please try again.');
    });
  });
});

