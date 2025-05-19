import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

describe('CartContext UAT tests', () => {
  const item = { id: '1', name: 'Test Product', price: 100 };

  test('Given a new item, When addToCart is called, Then it should be added to the cart with quantity 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(item);
    });

    expect(result.current.cart).toEqual([{ ...item, quantity: 1 }]);
  });

  test('Given an existing item in cart, When addToCart is called again, Then its quantity should increment', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(item);
      result.current.addToCart(item);
    });

    expect(result.current.cart[0].quantity).toBe(2);
  });

  test('Given an item in the cart, When removeFromCart is called, Then it should be removed', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(item);
      result.current.removeFromCart(item.id);
    });

    expect(result.current.cart).toEqual([]);
  });

  test('Given an item in the cart, When updateQuantity is called, Then its quantity should change', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(item);
      result.current.updateQuantity(item.id, 5);
    });

    expect(result.current.cart[0].quantity).toBe(5);
  });

  test('Given items in the cart, When clearCart is called, Then all items should be removed', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(item);
      result.current.clearCart();
    });

    expect(result.current.cart).toEqual([]);
  });

  test('Given items with price and quantity, When getTotal is called, Then it should return the correct total price', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(item); //qty 1=100
      result.current.addToCart(item); //qty 2=200
    });

    expect(result.current.getTotal()).toBe(200);
  });

  test('Given no provider, When useCart is called, Then it should throw an error', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {}); //Suppress expected React error

    expect(() => {
      renderHook(() => useCart()); // missing provider
    }).toThrow('useCart must be used within a CartProvider');

    consoleError.mockRestore();
  });

  test('Given cart state changes, When component unmounts, Then it should persist to localStorage', () => {
    const { result, unmount } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(item);
    });

    unmount();

    const stored = JSON.parse(localStorage.getItem('cart'));
    expect(stored).toEqual([{ ...item, quantity: 1 }]);
  });
});
