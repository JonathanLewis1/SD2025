import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SellerReport from './SellerReport';
import { getDocs } from 'firebase/firestore';
import { exportToCSV } from './exportCSV';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../firebase', () => ({
  db: {},
}));

jest.mock('./exportCSV', () => ({
  exportToCSV: jest.fn(),
}));

const fakeOrders = [
  { timestamp: '2024-01-01T12:00:00Z', quantity: 2 },
  { timestamp: '2024-01-01T13:00:00Z', quantity: 1 },
  { timestamp: '2024-01-02T14:00:00Z', quantity: 3 },
];

const fakeProducts = [
  { name: 'Item A', stock: 4, price: 100, description: 'Nice item', image: 'img.jpg' },
  { name: 'Item B', stock: 2, price: 50, description: 'Great item', image: 'img2.jpg' },
];

describe('SellerReport Component', () => {
  test('Given order data, When Sales Trends tab is loaded and Export clicked, Then sales data is shown and exported', async () => {
    getDocs.mockResolvedValueOnce({ docs: fakeOrders.map((d) => ({ data: () => d })) }); // orders
    getDocs.mockResolvedValueOnce({ docs: [] }); // products

    render(<SellerReport userEmail="seller@example.com" />);

    expect(screen.getByText(/Dashboard Reports/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Sales Trends/i)).toBeInTheDocument();
      expect(screen.getByText('2024-01-01')).toBeInTheDocument();
      expect(screen.getAllByText('3').length).toBeGreaterThan(0); // quantity 2 + 1
      expect(screen.getByText('2024-01-02')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Export as CSV/i));
    expect(exportToCSV).toHaveBeenCalled();
  });

  test('Given product data, When Inventory Status tab is selected and Export clicked, Then product details are shown and exported', async () => {
    getDocs.mockResolvedValueOnce({ docs: [] }); // orders
    getDocs.mockResolvedValueOnce({ docs: fakeProducts.map((d) => ({ data: () => d })) }); // products

    render(<SellerReport userEmail="seller@example.com" />);
    fireEvent.click(screen.getByText(/Inventory Status/i));

    await waitFor(() => {
      expect(screen.getByText('Item A')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Item B')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Export as CSV/i));
    expect(exportToCSV).toHaveBeenCalled();
  });

  test('Given no interaction, When Custom View tab is clicked, Then filter options should be visible', () => {
    render(<SellerReport userEmail="seller@example.com" />);
    fireEvent.click(screen.getByText(/Custom View/i));
    expect(screen.getByText(/filter by category/i)).toBeInTheDocument();
  });

  test('Given fetch failure, When component loads, Then it logs error without crashing', async () => {
    console.error = jest.fn();
    getDocs.mockRejectedValue(new Error('Failed to fetch'));

    render(<SellerReport userEmail="seller@example.com" />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error fetching sales:', 'Failed to fetch');
    });
  });
});
