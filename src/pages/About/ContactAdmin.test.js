// src/pages/ContactAdmin/ContactAdmin.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactAdmin from './ContactAdmin';

// MOCK FIREBASE FUNCTIONS
const mockSubmitComplaint = jest.fn();

jest.mock('firebase/functions', () => ({
  httpsCallable: () => mockSubmitComplaint,
}));

jest.mock('../../firebase', () => ({
  functions: {},
}));

describe('ContactAdmin Component — Given/When/Then', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Given ContactAdmin rendered, When viewed, Then name, email, message inputs and Send button are visible', () => {
    // Given
    render(<ContactAdmin />);

    // Then
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('Given form filled out correctly, When I submit, Then thank-you message is shown', async () => {
    // Given
    render(<ContactAdmin />);
    fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { name: 'name', value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText(/your email/i), { target: { name: 'email', value: 'alice@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/your message/i), { target: { name: 'message', value: 'Hello admin' } });

    mockSubmitComplaint.mockResolvedValue({ data: { success: true } });

    // When
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Then
    await waitFor(() => {
      expect(mockSubmitComplaint).toHaveBeenCalledWith({
        name: 'Alice',
        email: 'alice@example.com',
        message: 'Hello admin',
      });
      expect(screen.getByText(/thank you for your message/i)).toBeInTheDocument();
    });
  });

  test('Given submission fails, When I submit, Then an alert is shown', async () => {
    // Given
    render(<ContactAdmin />);
    fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { name: 'name', value: 'Bob' } });
    fireEvent.change(screen.getByPlaceholderText(/your email/i), { target: { name: 'email', value: 'bob@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/your message/i), { target: { name: 'message', value: 'Need help' } });

    const error = new Error('Network error');
    mockSubmitComplaint.mockRejectedValue(error);

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // When
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    // Then
    await waitFor(() => {
      expect(mockSubmitComplaint).toHaveBeenCalledWith({
        name: 'Bob',
        email: 'bob@example.com',
        message: 'Need help',
      });
      expect(alertSpy).toHaveBeenCalledWith(
        'Failed to send your message. Please try again.'
      );
    });

    alertSpy.mockRestore();
  });
});
