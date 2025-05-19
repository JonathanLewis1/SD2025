//  Silence those React Router future-flag warnings:
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Checkout from './Checkout';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Mock out CartContext:
jest.mock('../context/CartContext', () => ({
  useCart: jest.fn(),
}));

// Stub PayPalButtons to render real buttons we can click:
jest.mock('@paypal/react-paypal-js', () => ({
  PayPalButtons: ({ createOrder, onApprove, onError, onCancel }) => (
    <div>
      <button onClick={() => createOrder(null, { order: {} })}>create</button>
      <button
        onClick={() =>
          onApprove(
            { orderID: 'X' },
            { order: { capture: () => Promise.resolve({}) } }
          )
        }
      >
        approve
      </button>
      <button onClick={() => onError(new Error('err'))}>error</button>
      <button onClick={() => onCancel()}>cancel</button>
    </div>
  ),
}));

// Stub useNavigate once for all tests:
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

describe('Checkout Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    // now that useNavigate is a jest.fn(), give it our implementation:
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('Given empty cart, When rendered, Then shows empty message and Continue Shopping button', () => {
    useCart.mockReturnValue({ cart: [], clearCart: jest.fn() });

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue Shopping/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('Given items in cart, When rendered, Then displays summary and PayPalButtons', () => {
    useCart.mockReturnValue({
      cart: [{ id: '1', name: 'A', price: 2, quantity: 3 }],
      clearCart: jest.fn(),
    });

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    // There should be two "$6.00" elements: one in the line item, one in the total.
    const prices = screen.getAllByText('$6.00');
    expect(prices).toHaveLength(2);

    // Our stub buttons should render:
    ['create', 'approve', 'error', 'cancel'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('Given PayPal approve, When clicked, Then clearCart, navigate, and alert fire', async () => {
    const clearCart = jest.fn();
    window.alert = jest.fn();
    useCart.mockReturnValue({
      cart: [{ id: '1', name: 'A', price: 2, quantity: 1 }],
      clearCart,
    });

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('approve'));
    await waitFor(() => {
      expect(clearCart).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home');
      expect(window.alert).toHaveBeenCalledWith(
        'Payment successful! Thank you for your purchase.'
      );
    });
  });

  test('Given PayPal error, When error triggered, Then error message shown', async () => {
    useCart.mockReturnValue({
      cart: [{ id: '1', name: 'A', price: 2, quantity: 1 }],
      clearCart: jest.fn(),
    });

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('error'));
    expect(await screen.findByText(/Payment failed: err/i)).toBeInTheDocument();
  });

  test('Given PayPal cancel, When cancel triggered, Then cancellation message shown', async () => {
    useCart.mockReturnValue({
      cart: [{ id: '1', name: 'A', price: 2, quantity: 1 }],
      clearCart: jest.fn(),
    });

    render(
      <MemoryRouter>
        <Checkout />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('cancel'));
    expect(
      await screen.findByText(
        /Payment was cancelled\. Please try again if you wish to complete your purchase\./i
      )
    ).toBeInTheDocument();
  });
});
