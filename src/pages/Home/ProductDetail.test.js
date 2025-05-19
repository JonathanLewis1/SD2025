// src/pages/Home/ProductDetail.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetail from './ProductDetail';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { CartProvider } from '../../context/CartContext';

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('../../firebase', () => ({
  db: {},
}));

const renderWithProviders = (ui, { route = '/product/123' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/product/:productId" element={ui} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

const product = {
  name: 'Elegant Vase',
  price: 250,
  description: 'Handmade ceramic vase',
  image: 'vase.jpg',
  stock: 2,
};

test('Given a product ID, when detail page loads, then product info is shown', async () => {
  getDoc.mockResolvedValue({ exists: () => true, data: () => product });

  renderWithProviders(<ProductDetail />);
  
  // verify all the main fields appear
  expect(await screen.findByText(/Elegant Vase/i)).toBeInTheDocument();
  expect(screen.getByText(/R250/i)).toBeInTheDocument();
  expect(screen.getByText(/Handmade ceramic vase/i)).toBeInTheDocument();
});
