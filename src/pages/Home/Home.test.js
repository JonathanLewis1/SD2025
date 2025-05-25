import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';
import { BrowserRouter } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../firebase', () => ({
  db: {},
}));

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

const fakeProducts = [
  { id: '1', name: 'Wood Chair', price: 150, category: 'Woodwork', image: 'img1.jpg' },
  { id: '2', name: 'Gold Ring', price: 500, category: 'Jewelry', image: 'img2.jpg' },
];

beforeEach(() => {
  getDocs.mockResolvedValue({
    docs: fakeProducts.map((product) => ({
      id: product.id,
      data: () => product,
    })),
  });
});

test('Given a user visits home, when products are loaded, then all products are displayed', async () => {
  renderWithRouter(<Home />);
  expect(await screen.findByText(/Wood Chair/i)).toBeInTheDocument();
  expect(screen.getByText(/Gold Ring/i)).toBeInTheDocument();
});

test('Given a user searches a keyword, when matching product exists, then it is shown', async () => {
  renderWithRouter(<Home />);
  await screen.findByText(/Wood Chair/i);

  // use the exact placeholder from the component
  fireEvent.change(screen.getByPlaceholderText(/Search…/i), { target: { value: 'gold' } });

  expect(screen.getByText(/Gold Ring/i)).toBeInTheDocument();
  expect(screen.queryByText(/Wood Chair/i)).not.toBeInTheDocument();
});

test('Given a category is selected, when products match, then only those are displayed', async () => {
  renderWithRouter(<Home />);
  await screen.findByText(/Gold Ring/i);

  // select by visible text "All" initially
  const categorySelect = screen.getByDisplayValue('All');
  fireEvent.change(categorySelect, { target: { value: 'Woodwork' } });

  expect(screen.getByText(/Wood Chair/i)).toBeInTheDocument();
  expect(screen.queryByText(/Gold Ring/i)).not.toBeInTheDocument();
});

test('Given a price range, when products match, then they are shown', async () => {
  renderWithRouter(<Home />);
  await screen.findByText(/Gold Ring/i);

  fireEvent.change(screen.getByPlaceholderText(/Min Price/i), { target: { value: '200' } });
  fireEvent.change(screen.getByPlaceholderText(/Max Price/i), { target: { value: '600' } });

  expect(screen.getByText(/Gold Ring/i)).toBeInTheDocument();
  expect(screen.queryByText(/Wood Chair/i)).not.toBeInTheDocument();
});

test('Given filters are set, when reset is clicked, then all products reappear', async () => {
  renderWithRouter(<Home />);
  await screen.findByText(/Wood Chair/i);

  // narrow by category first
  fireEvent.change(screen.getByDisplayValue('All'), { target: { value: 'Jewelry' } });
  fireEvent.click(screen.getByText(/Reset Filters/i));

  expect(screen.getByText(/Wood Chair/i)).toBeInTheDocument();
  expect(screen.getByText(/Gold Ring/i)).toBeInTheDocument();
});
