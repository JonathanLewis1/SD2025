// // src/components/Header.test.js
// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import { BrowserRouter } from 'react-router-dom';
// import Header from './Header'; // use default import
// import { getDoc } from 'firebase/firestore';
// import { signOut, onAuthStateChanged } from 'firebase/auth';

// // mocks
// jest.mock('firebase/firestore', () => ({
//   getDoc: jest.fn()
// }));
// jest.mock('firebase/auth', () => ({
//   signOut: jest.fn(),
//   onAuthStateChanged: jest.fn()
// }));
// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   useNavigate: () => jest.fn()
// }));

// describe('Header', () => {
//   test('renders header with cart icon', () => {
//     render(<BrowserRouter><Header /></BrowserRouter>);
//     expect(screen.getByText(/Cart 🛒/i)).toBeInTheDocument();
//   });

//   test('logs out on logout click', async () => {
//     signOut.mockResolvedValue();
//     render(<BrowserRouter><Header /></BrowserRouter>);
//     fireEvent.click(screen.getByText(/Logout/i));
//     await waitFor(() => expect(signOut).toHaveBeenCalled());
//   });
// });
test.todo('Test need to be done');
