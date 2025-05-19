// // // import React from 'react';
// // // import { render, screen, fireEvent } from '@testing-library/react';
// // // import ContactAdmin from './ContactAdmin';
// // // import { MemoryRouter } from 'react-router-dom';

// // // describe('ContactAdmin Page', () => {
// // //   test('Given the form is displayed, when the user fills it in and clicks send, then a confirmation message should appear', () => {
// // //     render(
// // //       <MemoryRouter>
// // //         <ContactAdmin />
// // //       </MemoryRouter>
// // //     );

// // //     const nameInput = screen.getByLabelText(/name/i);
// // //     const emailInput = screen.getByLabelText(/email/i);
// // //     const messageInput = screen.getByLabelText(/message/i);
// // //     const sendButton = screen.getByRole('button', { name: /send/i });

// // //     fireEvent.change(nameInput, { target: { value: 'Alice' } });
// // //     fireEvent.change(emailInput, { target: { value: 'alice@example.com' } });
// // //     fireEvent.change(messageInput, { target: { value: 'Hi, I have a question.' } });

// // //     fireEvent.click(sendButton);

// // //     const confirmation = screen.getByText(/thank you for your message/i);
// // //     expect(confirmation).toBeInTheDocument();
// // //   });
// // // });
// // import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// // import ContactAdmin from './ContactAdmin';
// // import { httpsCallable } from 'firebase/functions';
// // import { MemoryRouter } from 'react-router-dom';

// // jest.mock('firebase/functions', () => ({
// //   httpsCallable: jest.fn(),
// // }));

// // test('submits the form and shows confirmation', async () => {
// //   const mockSubmit = jest.fn().mockResolvedValue();
// //   httpsCallable.mockReturnValue(mockSubmit);

// //   render(
// //     <MemoryRouter>
// //       <ContactAdmin />
// //     </MemoryRouter>
// //   );

// //   fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Alice' } });
// //   fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'alice@example.com' } });
// //   fireEvent.change(screen.getByLabelText(/Message:/i), { target: { value: 'Hi' } });
// //   fireEvent.click(screen.getByText(/Send/i));

// //   expect(await screen.findByText(/Thank you for your message/i)).toBeInTheDocument();
// // });

// // test('shows error alert when submission fails', async () => {
// //   const mockSubmit = jest.fn().mockRejectedValue(new Error('fail'));
// //   httpsCallable.mockReturnValue(mockSubmit);
// //   window.alert = jest.fn();

// //   render(
// //     <MemoryRouter>
// //       <ContactAdmin />
// //     </MemoryRouter>
// //   );

// //   fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Bob' } });
// //   fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'bob@example.com' } });
// //   fireEvent.change(screen.getByLabelText(/Message:/i), { target: { value: 'Issue' } });
// //   fireEvent.click(screen.getByText(/Send/i));

// //   await waitFor(() => {
// //     expect(window.alert).toHaveBeenCalledWith('Failed to send your message. Please try again.');
// //   });
// // });
// // src/pages/About/ContactAdmin.test.js
// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import ContactAdmin from './ContactAdmin';
// import { httpsCallable } from 'firebase/functions';

// jest.mock('../../firebase', () => ({
//   functions: {},
// }));

// jest.mock('firebase/functions', () => ({
//   httpsCallable: jest.fn(),
// }));

// describe('ContactAdmin', () => {
//   beforeEach(() => {
//     httpsCallable.mockClear();
//   });

//   test('renders form fields correctly', () => {
//     render(<ContactAdmin />);
//     expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
//   });

//   test('updates form values correctly', () => {
//     render(<ContactAdmin />);
//     fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John' } });
//     fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
//     fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Hello Admin' } });

//     expect(screen.getByLabelText(/Name/i).value).toBe('John');
//     expect(screen.getByLabelText(/Email/i).value).toBe('john@example.com');
//     expect(screen.getByLabelText(/Message/i).value).toBe('Hello Admin');
//   });

//   test('submits form successfully and shows confirmation', async () => {
//     const mockSubmit = jest.fn().mockResolvedValue({});
//     httpsCallable.mockReturnValue(mockSubmit);

//     render(<ContactAdmin />);
//     fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane' } });
//     fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
//     fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Need help' } });

//     fireEvent.click(screen.getByText(/Send/i));

//     await waitFor(() => {
//       expect(mockSubmit).toHaveBeenCalledWith({
//         name: 'Jane',
//         email: 'jane@example.com',
//         message: 'Need help',
//       });
//     });

//     // ✅ Wait for confirmation text to appear
//     await waitFor(() => {
//       expect(
//         screen.getByText(/Thank you for your message/i)
//       ).toBeInTheDocument();
//     });
//   });
// });
// src/pages/About/ContactAdmin.test.js
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

