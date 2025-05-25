import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cart from './Cart';
import { useCart } from '../../context/CartContext';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';

jest.mock('../context/CartContext');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Cart Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  test('Given an empty cart, When rendered, Then it shows empty message and Continue Shopping button', () => {
    useCart.mockReturnValue({
      cart: [],
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      getTotal: () => 0,
    });
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue Shopping/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('Given items in cart, When quantity buttons and remove are clicked, Then handlers and total update fire', () => {
    const removeFromCart = jest.fn();
    const updateQuantity = jest.fn();
    useCart.mockReturnValue({
      cart: [{ id: '1', name: 'X', price: 5, quantity: 2, image: 'img.png' }],
      removeFromCart,
      updateQuantity,
      getTotal: () => 10,
    });
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );

    // quantity decrement
    fireEvent.click(screen.getByText('-', { selector: 'button' }));
    expect(updateQuantity).toHaveBeenCalledWith('1', 1);

    // quantity increment
    fireEvent.click(screen.getByText('+', { selector: 'button' }));
    expect(updateQuantity).toHaveBeenCalledWith('1', 3);

    // remove
    fireEvent.click(screen.getByRole('button', { name: /Remove/i }));
    expect(removeFromCart).toHaveBeenCalledWith('1');

    // total
    expect(screen.getByText(/Total: \$10\.00/i)).toBeInTheDocument();

    // checkout
    fireEvent.click(screen.getByRole('button', { name: /Proceed to Checkout/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  test('Given quantity change below 1, When minus clicked at 1, Then updateQuantity is not called', () => {
    const updateQuantity = jest.fn();
    useCart.mockReturnValue({
      cart: [{ id: '1', name: 'X', price: 5, quantity: 1, image: 'img.png' }],
      removeFromCart: jest.fn(),
      updateQuantity,
      getTotal: () => 5,
    });
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText('-', { selector: 'button' }));
    expect(updateQuantity).not.toHaveBeenCalled();
  });
});
