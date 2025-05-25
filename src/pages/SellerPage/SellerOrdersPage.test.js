// src/pages/SellerPage/SellerOrdersPage.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SellerOrdersPage from './SellerOrdersPage';

import { auth } from '../../firebase';
import { getDocs } from 'firebase/firestore';

jest.mock('../../firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn()
  },
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn()
}));

describe('SellerOrdersPage — Given/When/Then', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Given first render, When auth state not yet resolved, Then the Loading… message is shown', () => {
    auth.onAuthStateChanged.mockImplementation(cb => {
      setTimeout(() => cb(null), 0);
      return () => {};
    });

    render(<SellerOrdersPage />);
    expect(screen.getByText(/loading…/i)).toBeInTheDocument();
  });

  test('Given no orders in Firestore, When auth returns no user, Then "You have no orders." is displayed', async () => {
    const fakeUser = { email: 'seller@example.com' };
    auth.onAuthStateChanged.mockImplementation(cb => {
      setTimeout(() => cb(fakeUser), 0);
      return () => {};
    });
    getDocs.mockResolvedValue({ docs: [] });

    render(<SellerOrdersPage />);
    jest.runAllTimers();

    expect(await screen.findByText(/you have no orders\./i)).toBeInTheDocument();
  });

  test('Given existing orders in Firestore, When auth returns user and getDocs returns data, Then table with headers and rows is displayed', async () => {
    const fakeUser = { email: 'seller@example.com' };
    auth.onAuthStateChanged.mockImplementation(cb => {
      setTimeout(() => cb(fakeUser), 0);
      return () => {};
    });

    const docData = {
      timestamp: { seconds: 1650000000 },
      products: ['Widget'],
      image: ['https://example.com/img.png'],
      Price: [100],
      quantity: [2],
      DeliveryStatus: 'Shipped',
      DeliveryType: 'Standard',
      StreetName: '123 Main St',
      suburb: 'Central',
      postalCode: '2000',
      city: 'Johannesburg'
    };
    getDocs.mockResolvedValue({ docs: [{ data: () => docData }] });

    render(<SellerOrdersPage />);
    jest.runAllTimers();

    // Wait for headers to render
    await waitFor(() => {
      expect(screen.getByText('Timestamp')).toBeInTheDocument();
      expect(screen.getByText('Product')).toBeInTheDocument();
    });

    // Then: verify row values
    expect(await screen.findByText(/2022-04-15T05:20:00/)).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    // use alt text since alt="" images are presentational
    expect(screen.getByAltText('')).toHaveAttribute('src', 'https://example.com/img.png');
    expect(screen.getByText('100.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('200.00')).toBeInTheDocument();
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Central')).toBeInTheDocument();
    expect(screen.getByText('2000')).toBeInTheDocument();
    expect(screen.getByText('Johannesburg')).toBeInTheDocument();
  });
});
