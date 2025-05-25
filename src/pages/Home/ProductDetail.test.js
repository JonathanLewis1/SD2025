// src/pages/Home/ProductDetail.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetail from './ProductDetail';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn()
}));
jest.mock('../../firebase', () => ({ db: {} }));
jest.mock('../../context/CartContext', () => ({
  useCart: jest.fn()
}));

const baseProduct = {
  id: '123',
  name: 'Elegant Vase',
  price: 250,
  description: 'Handmade ceramic vase',
  image: 'vase.jpg',
  stock: 2
};

const renderPage = async (productData) => {
  getDoc.mockResolvedValue({
    exists: () => true,
    id: productData.id,
    data: () => productData
  });

  window.alert = jest.fn();
  window.history.pushState({}, '', `/product/${productData.id}`);

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/product/:productId" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  getDoc.mockReset();
  useCart.mockReset();
});

test('shows loading initially', () => {
  // mock useCart first so destructuring never fails
  useCart.mockReturnValue({ cart: [], addToCart: jest.fn() });

  // make getDoc never resolve
  getDoc.mockReturnValue(new Promise(() => {}));

  window.history.pushState({}, '', '/product/123');
  render(
    <BrowserRouter>
      <Routes>
        <Route path="/product/:productId" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );

  expect(screen.getByText(/Loading product details\.\.\./i)).toBeInTheDocument();
});

test('out of stock hides button and shows out-of-stock message', async () => {
  useCart.mockReturnValue({ cart: [], addToCart: jest.fn() });
  await renderPage({ ...baseProduct, stock: 0 });

  expect(await screen.findByText(/This product is out of stock\./i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Add to Cart/i })).toBeNull();
});

test('low stock shows warning', async () => {
  useCart.mockReturnValue({ cart: [], addToCart: jest.fn() });
  await renderPage({ ...baseProduct, stock: 3 });

  expect(await screen.findByText(/Only a few left in stock!/i)).toBeInTheDocument();
});

test('clicking Add to Cart calls addToCart and alerts', async () => {
  const pd = { ...baseProduct, stock: 5 };
  const mockAdd = jest.fn();
  useCart.mockReturnValue({ cart: [], addToCart: mockAdd });

  await renderPage(pd);
  fireEvent.click(await screen.findByRole('button', { name: /Add to Cart/i }));

  expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ id: pd.id }));
  expect(window.alert).toHaveBeenCalledWith('Product added to cart!');
});

test('cannot add more than stock', async () => {
  const pd = { ...baseProduct, stock: 2 };
  const mockAdd = jest.fn();
  useCart.mockReturnValue({
    cart: [{ id: pd.id, quantity: 2 }],
    addToCart: mockAdd
  });

  await renderPage(pd);
  fireEvent.click(await screen.findByRole('button', { name: /Add to Cart/i }));

  expect(mockAdd).not.toHaveBeenCalled();
  expect(window.alert).toHaveBeenCalledWith(
    'You cannot add more of this item. Stock limit reached.'
  );
});
