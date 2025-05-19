// src/pages/SellerPage/SellerPage.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SellerPage from './SellerPage';
import { BrowserRouter } from 'react-router-dom';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Firebase module mocks
jest.mock('../../firebase', () => ({
  auth: {},
  db: {},
}));

const mockAddDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockOnAuthStateChanged = jest.fn();

jest.mock('firebase/auth', () => {
  const original = jest.requireActual('firebase/auth');
  return {
    ...original,
    onAuthStateChanged: (auth, cb) => {
      mockOnAuthStateChanged(auth, cb);
      return () => {};
    },
  };
});

jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    doc: jest.fn(() => ({})),
    getDocs: (...args) => mockGetDocs(...args),
    addDoc: (...args) => mockAddDoc(...args),
    deleteDoc: (...args) => mockDeleteDoc(...args),
    updateDoc: (...args) => mockUpdateDoc(...args),
  };
});

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

// Setup default: logged-in seller, no products
beforeEach(() => {
  mockGetDocs.mockResolvedValue({ docs: [] });
  mockOnAuthStateChanged.mockImplementation((auth, cb) =>
    cb({ email: 'seller@email.com' })
  );
});

test('Given seller is not logged in, When clicking Add Product, Then show login error', async () => {
  // Given
  mockOnAuthStateChanged.mockImplementation((auth, cb) => cb(null));
  renderWithRouter(<SellerPage />);

  // When
  fireEvent.click(screen.getByRole('button', { name: /add product/i }));

  // Then
  expect(
    await screen.findByText(/you must be logged in to add a product/i)
  ).toBeInTheDocument();
});

test('Given form missing name, When submitting, Then show "All fields are required"', async () => {
  // Given
  renderWithRouter(<SellerPage />);

  // When
  fireEvent.change(screen.getByPlaceholderText(/price/i), {
    target: { value: '100' },
  });
  fireEvent.change(screen.getByPlaceholderText(/description/i), {
    target: { value: 'desc' },
  });
  fireEvent.change(screen.getByPlaceholderText(/image url/i), {
    target: { value: 'url' },
  });
  fireEvent.click(screen.getByRole('button', { name: /add product/i }));

  // Then
  expect(
    await screen.findByText(/all fields are required/i)
  ).toBeInTheDocument();
});

test('Given valid form, When submitting, Then addDoc is called and form clears', async () => {
  // Given
  mockAddDoc.mockResolvedValue();
  renderWithRouter(<SellerPage />);

  // When
  fireEvent.change(screen.getByPlaceholderText(/name/i), {
    target: { value: 'Item' },
  });
  fireEvent.change(screen.getByPlaceholderText(/price/i), {
    target: { value: '10' },
  });
  fireEvent.change(screen.getByPlaceholderText(/description/i), {
    target: { value: 'info' },
  });
  fireEvent.change(screen.getByPlaceholderText(/image url/i), {
    target: { value: 'img' },
  });
  fireEvent.change(screen.getByDisplayValue(/select a category/i), {
    target: { value: 'Jewelry' },
  });
  fireEvent.click(screen.getByRole('button', { name: /add product/i }));

  // Then
  await waitFor(() => expect(mockAddDoc).toHaveBeenCalled());
});

test('Given addDoc fails, When submitting product, Then alert with failure', async () => {
  // Given
  mockAddDoc.mockRejectedValue(new Error('Firestore error'));
  window.alert = jest.fn();
  renderWithRouter(<SellerPage />);

  // When
  fireEvent.change(screen.getByPlaceholderText(/name/i), {
    target: { value: 'FailItem' },
  });
  fireEvent.change(screen.getByPlaceholderText(/price/i), {
    target: { value: '50' },
  });
  fireEvent.change(screen.getByPlaceholderText(/description/i), {
    target: { value: 'X' },
  });
  fireEvent.change(screen.getByPlaceholderText(/image url/i), {
    target: { value: 'x.jpg' },
  });
  fireEvent.change(screen.getByDisplayValue(/select a category/i), {
    target: { value: 'Clothing' },
  });
  fireEvent.click(screen.getByRole('button', { name: /add product/i }));

  // Then
  await waitFor(() =>
    expect(window.alert).toHaveBeenCalledWith(
      'Failed to add product: Firestore error'
    )
  );
});

test('Given product in list, When delete succeeds, Then deleteDoc is called', async () => {
  // Given
  mockGetDocs.mockResolvedValue({
    docs: [
      {
        id: '1',
        data: () => ({
          name: 'Item',
          price: 10,
          description: 'desc',
          image: 'img',
          category: 'Jewelry',
          email: 'seller@email.com',
        }),
      },
    ],
  });
  mockDeleteDoc.mockResolvedValue();

  renderWithRouter(<SellerPage />);

  // When
  fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

  // Then
  await waitFor(() => expect(mockDeleteDoc).toHaveBeenCalled());
});

test('Given deleteDoc fails, When deleting, Then log error', async () => {
  // Given
  mockGetDocs.mockResolvedValue({
    docs: [
      {
        id: '1',
        data: () => ({
          name: 'ErrorItem',
          price: 1,
          description: 'fail',
          image: 'img',
          category: 'Woodwork',
          email: 'seller@email.com',
        }),
      },
    ],
  });
  mockDeleteDoc.mockRejectedValue(new Error('fail'));
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  renderWithRouter(<SellerPage />);

  // When
  fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

  // Then
  await waitFor(() =>
    expect(errorSpy).toHaveBeenCalledWith(
      'Error deleting product:',
      expect.any(String)
    )
  );
});

test('Given stock field present, When save clicked, Then updateDoc is called', async () => {
  // Given
  mockGetDocs.mockResolvedValue({
    docs: [
      {
        id: '1',
        data: () => ({
          name: 'A',
          price: 10,
          description: 'x',
          image: 'img',
          stock: 3,
          category: 'Jewelry',
          email: 'seller@email.com',
        }),
      },
    ],
  });
  mockUpdateDoc.mockResolvedValue();

  renderWithRouter(<SellerPage />);

  // When
  fireEvent.change(await screen.findByDisplayValue('3'), {
    target: { value: '7' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  // Then
  await waitFor(() => expect(mockUpdateDoc).toHaveBeenCalled());
});

test('Given updateDoc fails, When saving stock, Then log error', async () => {
  // Given
  mockGetDocs.mockResolvedValue({
    docs: [
      {
        id: '1',
        data: () => ({
          name: 'B',
          price: 5,
          description: 'x',
          image: 'img',
          stock: 2,
          category: 'Woodwork',
          email: 'seller@email.com',
        }),
      },
    ],
  });
  mockUpdateDoc.mockRejectedValue(new Error('fail'));
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  renderWithRouter(<SellerPage />);

  // When
  fireEvent.change(await screen.findByDisplayValue('2'), {
    target: { value: '9' },
  });
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  // Then
  await waitFor(() =>
    expect(errorSpy).toHaveBeenCalledWith(
      'Error updating stock:',
      expect.any(String)
    )
  );
});
