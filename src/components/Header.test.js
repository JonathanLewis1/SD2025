import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './Header';
import { useCart } from '../context/CartContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../context/CartContext');
jest.mock('firebase/auth', () => ({ signOut: jest.fn() }));
jest.mock('firebase/firestore', () => ({ getDoc: jest.fn(), doc: jest.fn() }));
jest.mock('../firebase', () => ({ auth: { currentUser: { uid: 'u1' } }, db: {} }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children }) => <span>{children}</span>
}));

describe('Header Component', () => {
  beforeEach(() => {
    useCart.mockReturnValue({ cart: [{ id: '1' }] });
  });

  test('Given cart has items, Then cart count is shown', () => {
    render(<BrowserRouter><Header /></BrowserRouter>);
    expect(screen.getByText(/Cart 🛒/)).toHaveTextContent('(1)');
  });

  test('Given logout clicked, Then signOut and navigate("/login")', async () => {
    render(<BrowserRouter><Header /></BrowserRouter>);
    fireEvent.click(screen.getByText(/Logout/i));
    await waitFor(() => expect(signOut).toHaveBeenCalledWith(auth));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('Given user role seller, When My Products clicked, Then navigate("/sellerpage")', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'seller' }) });
    render(<BrowserRouter><Header /></BrowserRouter>);
    fireEvent.click(screen.getByText(/My Products/i));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/sellerpage'));
  });

  test('Given user role buyer, When My Products clicked, Then alert is shown', async () => {
    window.alert = jest.fn();
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'buyer' }) });
    render(<BrowserRouter><Header /></BrowserRouter>);
    fireEvent.click(screen.getByText(/My Products/i));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Only registered sellers may add products"));
  });
});
