import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactAdmin from './ContactAdmin';
import { MemoryRouter } from 'react-router-dom';

describe('ContactAdmin Page', () => {
  test('Given the form is displayed, when the user fills it in and clicks send, then a confirmation message should appear', () => {
    render(
      <MemoryRouter>
        <ContactAdmin />
      </MemoryRouter>
    );

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(nameInput, { target: { value: 'Alice' } });
    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Hi, I have a question.' } });

    fireEvent.click(sendButton);

    const confirmation = screen.getByText(/thank you for your message/i);
    expect(confirmation).toBeInTheDocument();
  });
});
