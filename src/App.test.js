// src/App.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { CartProvider } from './context/CartContext';

describe('App Routing — Given/When/Then', () => {
  const renderAt = (path) => {
    window.history.pushState({}, '', path);
    render(
      <CartProvider>
        <App />
      </CartProvider>
    );
  };

  test('Given App at "/" route, When rendered, Then the Login page is shown', () => {
    renderAt('/');
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('Given App at "/about" route, When rendered, Then the About Us heading is displayed', () => {
    renderAt('/about');
    expect(screen.getByRole('heading', { level: 1, name: /about us/i })).toBeInTheDocument();
  });

  test('Given App at "/contact-admin" route, When rendered, Then the Contact Admin heading is displayed', () => {
    renderAt('/contact-admin');
    expect(screen.getByRole('heading', { level: 1, name: /contact admin/i })).toBeInTheDocument();
  });

  test('Given App at unknown route, When rendered, Then the 404 page is displayed', () => {
    renderAt('/some/bogus/path');

    // Then: check for the 404 heading
    expect(screen.getByRole('heading', { level: 1, name: /404/ })).toBeInTheDocument();

    // Then: check for the "doesn't exist" text (matches straight or curly apostrophe)
    expect(screen.getByText(/doesn['’]t exist/i)).toBeInTheDocument();
  });
});
