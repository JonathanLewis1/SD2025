// src/pages/CheckoutWindow/Cart.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cart from './Cart';
import { useCart } from '../../context/CartContext';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../context/CartContext', () => ({
  useCart: jest.fn(),
}));

describe('Cart Component — Given/When/Then', () => {
  const originalOpen = window.open;
  const originalAlert = window.alert;

  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
    window.alert = jest.fn();
    localStorage.clear();
  });

  afterAll(() => {
    window.open = originalOpen;
    window.alert = originalAlert;
  });

  function renderCart() {
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
  }

  test('Given empty cart, When rendered, Then show "Your cart is empty" and Continue Shopping button', () => {
    useCart.mockReturnValue({
      cart: [],
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      getTotal: jest.fn().mockReturnValue(0),
    });

    renderCart();

    expect(screen.getByRole('heading', { level: 2, name: /your cart is empty/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });

  test('Given cart with items, When rendered, Then show each item and total', () => {
    const item = {
      id: '1',
      name: 'Test Product',
      image: 'https://example.com/img.png',
      price: 20,
      quantity: 2,
      stock: 5,
    };
    useCart.mockReturnValue({
      cart: [item],
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      getTotal: jest.fn().mockReturnValue(40),
    });

    renderCart();

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /test product/i })).toHaveAttribute('src', item.image);
    expect(screen.getByText('R20.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/total: R40.00/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  test('Given cart with item, When clicking + within stock, Then updateQuantity is called', () => {
    const updateQuantity = jest.fn();
    const item = { id: '1', name: 'P', image: '', price: 5, quantity: 1, stock: 2 };
    useCart.mockReturnValue({
      cart: [item],
      removeFromCart: jest.fn(),
      updateQuantity,
      getTotal: jest.fn().mockReturnValue(5),
    });

    renderCart();

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(updateQuantity).toHaveBeenCalledWith(item.id, 2);
  });

  test('Given cart with item at quantity 1, When clicking -, Then updateQuantity is not called', () => {
    const updateQuantity = jest.fn();
    const item = { id: '1', name: 'P', image: '', price: 5, quantity: 1, stock: 5 };
    useCart.mockReturnValue({
      cart: [item],
      removeFromCart: jest.fn(),
      updateQuantity,
      getTotal: jest.fn().mockReturnValue(5),
    });

    renderCart();

    fireEvent.click(screen.getByRole('button', { name: '-' }));
    expect(updateQuantity).not.toHaveBeenCalled();
  });

  test('Given cart with item, When clicking Remove, Then removeFromCart is called', () => {
    const removeFromCart = jest.fn();
    const item = { id: '1', name: 'X', image: '', price: 3, quantity: 1, stock: 5 };
    useCart.mockReturnValue({
      cart: [item],
      removeFromCart,
      updateQuantity: jest.fn(),
      getTotal: jest.fn().mockReturnValue(3),
    });

    renderCart();

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(removeFromCart).toHaveBeenCalledWith(item.id);
  });

  test('Given cart with items, When clicking Proceed to Checkout succeeds, Then checkoutCart is saved and window.open is called', () => {
    const cart = [{ id: '1', name: 'A', image: '', price: 2, quantity: 1, stock: 5 }];
    useCart.mockReturnValue({
      cart,
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      getTotal: jest.fn().mockReturnValue(2),
    });

    renderCart();
    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }));

    expect(JSON.parse(localStorage.getItem('checkoutCart'))).toEqual(cart);
    expect(window.open).toHaveBeenCalledWith('/checkout', '_blank', 'width=600,height=700');
  });

  test('Given window.open throws, When clicking Proceed to Checkout, Then show an error alert', () => {
    const cart = [{ id: '1', name: 'A', image: '', price: 2, quantity: 1, stock: 5 }];
    useCart.mockReturnValue({
      cart,
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      getTotal: jest.fn().mockReturnValue(2),
    });
    window.open.mockImplementation(() => { throw new Error('failed'); });

    renderCart();
    fireEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }));

    expect(window.alert).toHaveBeenCalledWith(
      'There was an error opening the checkout window. Please try again.'
    );
  });
});
