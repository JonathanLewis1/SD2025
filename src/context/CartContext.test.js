import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart, cartReducer } from './CartContext';

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

// A little component that exposes everything on screen for us to assert
function TestConsumer() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal
  } = useCart();

  return (
    <div>
      <div data-testid="cart">{JSON.stringify(cart)}</div>
      <div data-testid="total">{getTotal()}</div>
      <button onClick={() => addToCart({ id: '1', price: 10, stock: 2 })}>ADD</button>
      <button onClick={() => addToCart({ id: '1', price: 10, stock: 2 })}>ADD-AGAIN</button>
      <button onClick={() => updateQuantity('1', 5)}>UPDATE</button>
      <button onClick={() => removeFromCart('1')}>REMOVE</button>
      <button onClick={() => clearCart()}>CLEAR</button>
    </div>
  );
}

describe('CartContext Given/When/Then', () => {
  test('Given no items, When I mount provider, Then cart is empty and total is 0', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(screen.getByTestId('cart')).toHaveTextContent('[]');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  test('Given I add a new item, When I click ADD, Then cart has that item with quantity 1', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      screen.getByText('ADD').click();
    });
    expect(JSON.parse(screen.getByTestId('cart').textContent)).toEqual([
      { id: '1', price: 10, quantity: 1, stock: 2 }
    ]);
    expect(screen.getByTestId('total')).toHaveTextContent('10');
  });

  test('Given item already in cart, When I add it again within stock, Then quantity increments', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      screen.getByText('ADD').click();
      screen.getByText('ADD-AGAIN').click();
    });
    expect(JSON.parse(screen.getByTestId('cart').textContent)).toEqual([
      { id: '1', price: 10, quantity: 2, stock: 2 }
    ]);
    expect(screen.getByTestId('total')).toHaveTextContent('20');
  });

  test('Given item at stock limit, When I add it again, Then it alerts and quantity does not increase', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      screen.getByText('ADD').click();
      screen.getByText('ADD-AGAIN').click(); // now at stock
      screen.getByText('ADD-AGAIN').click(); // exceed stock
    });
    expect(window.alert).toHaveBeenCalledWith('You cannot add more of this item. Stock limit reached.');
    expect(JSON.parse(screen.getByTestId('cart').textContent)).toEqual([
      { id: '1', price: 10, quantity: 2, stock: 2 }
    ]);
  });

  test('Given I update quantity above stock, When I call updateQuantity, Then it caps at stock', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      screen.getByText('ADD').click();
      screen.getByText('UPDATE').click(); // tries to set to 5
    });
    expect(JSON.parse(screen.getByTestId('cart').textContent)[0].quantity).toBe(2);
    expect(screen.getByTestId('total')).toHaveTextContent('20');
  });

  test('Given item in cart, When I update its quantity normally, Then cart reflects new quantity', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      screen.getByText('ADD').click();
      // update to within stock
      act(() => screen.getByText('UPDATE').click());
    });
    expect(JSON.parse(screen.getByTestId('cart').textContent)).toEqual([
      { id: '1', price: 10, quantity: 2, stock: 2 }
    ]);
  });

  test('Given item in cart, When I remove it, Then cart is empty again', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      screen.getByText('ADD').click();
      screen.getByText('REMOVE').click();
    });
    expect(screen.getByTestId('cart')).toHaveTextContent('[]');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  test('Given non-empty cart, When I clearCart, Then cart becomes empty', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      screen.getByText('ADD').click();
      screen.getByText('CLEAR').click();
    });
    expect(screen.getByTestId('cart')).toHaveTextContent('[]');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  test('Given localStorage has a saved cart, When provider mounts, Then it will load from localStorage', () => {
    localStorage.setItem(
      'cart',
      JSON.stringify([{ id: 'x', price: 5, quantity: 3, stock: 10 }])
    );
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    expect(JSON.parse(screen.getByTestId('cart').textContent)).toEqual([
      { id: 'x', price: 5, quantity: 3, stock: 10 }
    ]);
    expect(screen.getByTestId('total')).toHaveTextContent('15');
  });

  test('Given state change, When items change, Then localStorage is updated', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => screen.getByText('ADD').click());
    const stored = JSON.parse(localStorage.getItem('cart'));
    expect(stored).toEqual([{ id: '1', price: 10, quantity: 1, stock: 2 }]);
  });

  test('Given I throw away the provider, When I call useCart outside, Then it errors', () => {
    expect(() =>
      render(<TestConsumer />)
    ).toThrowError(/useCart must be used within a CartProvider/);
  });
});
