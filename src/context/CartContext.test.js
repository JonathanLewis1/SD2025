import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

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
      <button onClick={() => addToCart({ id: '1', price: 10 })}>ADD</button>
      <button onClick={() => addToCart({ id: '1', price: 10 })}>ADD-AGAIN</button>
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
      { id: '1', price: 10, quantity: 1 }
    ]);
    expect(screen.getByTestId('total')).toHaveTextContent('10');
  });

  test('Given item already in cart, When I add it again, Then quantity increments', () => {
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
      { id: '1', price: 10, quantity: 2 }
    ]);
    expect(screen.getByTestId('total')).toHaveTextContent('20');
  });

  test('Given item in cart, When I update its quantity, Then cart reflects new quantity', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );
    act(() => {
      screen.getByText('ADD').click();
      screen.getByText('UPDATE').click();
    });
    expect(JSON.parse(screen.getByTestId('cart').textContent)).toEqual([
      { id: '1', price: 10, quantity: 5 }
    ]);
    expect(screen.getByTestId('total')).toHaveTextContent('50');
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

  // test('Given localStorage has a saved cart, When provider mounts, Then it will load from localStorage', () => {
  //   // pre-seed localStorage
  //   localStorage.setItem(
  //     'cart',
  //     JSON.stringify([{ id: 'x', price: 5, quantity: 3 }])
  //   );
  //   render(
  //     <CartProvider>
  //       <TestConsumer />
  //     </CartProvider>
  //   );
  //   expect(JSON.parse(screen.getByTestId('cart').textContent)).toEqual([
  //     { id: 'x', price: 5, quantity: 3 }
  //   ]);
  //   expect(screen.getByTestId('total')).toHaveTextContent('15');
  // });

  test('Given I throw away the provider, When I call useCart outside, Then it errors', () => {
    // we mount the consumer without wrapping
    expect(() =>
      render(<TestConsumer />)
    ).toThrowError(/useCart must be used within a CartProvider/);
  });
});
