import { render, screen, waitFor } from '@testing-library/react';
import ProductDetail from './ProductDetail';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('../../firebase', () => ({
  db: {},
}));

const renderWithRouter = (ui, { route = '/product/123' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/product/:productId" element={ui} />
      </Routes>
    </BrowserRouter>
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

  renderWithRouter(<ProductDetail />);
  expect(await screen.findByText(/Elegant Vase/i)).toBeInTheDocument();
  expect(screen.getByText(/R250/i)).toBeInTheDocument();
  expect(screen.getByText(/Handmade ceramic vase/i)).toBeInTheDocument();
});

// test('Given a product with low stock, when it loads, then warning is displayed', async () => {
//   getDoc.mockResolvedValue({ exists: () => true, data: () => ({ ...product, stock: 3 }) });
//   renderWithRouter(<ProductDetail />);
//   await waitFor(() => {
//     expect(screen.getByText(/less than 5/i)).toBeInTheDocument();
//   });
// });

// test('Given a product with 0 stock, when it loads, then out of stock message shows and button is hidden', async () => {
//   getDoc.mockResolvedValue({ exists: () => true, data: () => ({ ...product, stock: 0 }) });
//   renderWithRouter(<ProductDetail />);
//   await waitFor(() => {
//     expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
//     expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
//   });
// });
