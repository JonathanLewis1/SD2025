// // src/pages/SellerPage/SellerPage.test.js

// import React from 'react';
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import SellerPage from './SellerPage';
// import { BrowserRouter } from 'react-router-dom';

// jest.mock('../../firebase', () => ({
//   auth: {},
//   db: {},
// }));

// const mockAddDoc = jest.fn();
// const mockDeleteDoc = jest.fn();
// const mockUpdateDoc = jest.fn();
// const mockGetDocs = jest.fn();
// const mockOnAuthStateChanged = jest.fn();

// jest.mock('firebase/auth', () => ({
//   onAuthStateChanged: (auth, cb) => {
//     mockOnAuthStateChanged(auth, cb);
//     return () => {};
//   },
// }));

// jest.mock('firebase/firestore', () => ({
//   collection: jest.fn(),
//   query: jest.fn(),
//   where: jest.fn(),
//   doc: jest.fn(() => ({})),
//   getDocs: (...args) => mockGetDocs(...args),
//   addDoc: (...args) => mockAddDoc(...args),
//   deleteDoc: (...args) => mockDeleteDoc(...args),
//   updateDoc: (...args) => mockUpdateDoc(...args),
// }));

// const renderWithRouter = ui => render(<BrowserRouter>{ui}</BrowserRouter>);

// // default: seller logged in, no products
// beforeEach(() => {
//   jest.clearAllMocks();
//   mockGetDocs.mockResolvedValue({ docs: [] });
//   mockOnAuthStateChanged.mockImplementation((auth, cb) =>
//     cb({ email: 'seller@example.com' })
//   );
// });

// test('Given seller is not logged in, When clicking Add Product, Then show login error', async () => {
//   mockOnAuthStateChanged.mockImplementation((auth, cb) => cb(null));
//   renderWithRouter(<SellerPage />);

//   fireEvent.click(screen.getByRole('button', { name: /add product/i }));

//   expect(await screen.findByText(/please log in first\./i)).toBeInTheDocument();
// });

// test('Given form missing name, When submitting, Then show "All fields are required."', async () => {
//   renderWithRouter(<SellerPage />);

//   // fill only some fields
//   fireEvent.change(screen.getByPlaceholderText(/price/i), {
//     target: { value: '100' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/description/i), {
//     target: { value: 'desc' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/image url/i), {
//     target: { value: 'url' },
//   });
//   fireEvent.click(screen.getByRole('button', { name: /add product/i }));

//   expect(await screen.findByText(/all fields are required\./i)).toBeInTheDocument();
// });

// test('Given valid form, When submitting, Then addDoc is called and form clears', async () => {
//   mockAddDoc.mockResolvedValue();
//   renderWithRouter(<SellerPage />);

//   fireEvent.change(screen.getByPlaceholderText(/name/i), {
//     target: { value: 'Item' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/price/i), {
//     target: { value: '10' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/description/i), {
//     target: { value: 'info' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/image url/i), {
//     target: { value: 'img' },
//   });

//   // select category via combobox role
//   const combo = screen.getByRole('combobox');
//   fireEvent.change(combo, { target: { value: 'Jewelry' } });

//   fireEvent.click(screen.getByRole('button', { name: /add product/i }));

//   await waitFor(() => expect(mockAddDoc).toHaveBeenCalled());
//   // and form should reset to empty—e.g. name input becomes ''
//   expect(screen.getByPlaceholderText(/name/i).value).toBe('');
// });

// test('Given addDoc fails, When submitting product, Then show failure error', async () => {
//   mockAddDoc.mockRejectedValue(new Error('Firestore error'));
//   renderWithRouter(<SellerPage />);

//   fireEvent.change(screen.getByPlaceholderText(/name/i), {
//     target: { value: 'FailItem' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/price/i), {
//     target: { value: '50' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/description/i), {
//     target: { value: 'X' },
//   });
//   fireEvent.change(screen.getByPlaceholderText(/image url/i), {
//     target: { value: 'x.jpg' },
//   });
//   fireEvent.change(screen.getByRole('combobox'), {
//     target: { value: 'Clothing' },
//   });
//   fireEvent.click(screen.getByRole('button', { name: /add product/i }));

//   expect(
//     await screen.findByText(/failed to add product: firestore error/i)
//   ).toBeInTheDocument();
// });

// test('Given product in list, When delete succeeds, Then deleteDoc is called', async () => {
//   mockGetDocs.mockResolvedValue({
//     docs: [
//       {
//         id: '1',
//         data: () => ({
//           name: 'Item',
//           price: 10,
//           description: 'desc',
//           image: 'img',
//           category: 'Jewelry',
//           email: 'seller@example.com',
//         }),
//       },
//     ],
//   });
//   mockDeleteDoc.mockResolvedValue();

//   renderWithRouter(<SellerPage />);

//   fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

//   await waitFor(() => expect(mockDeleteDoc).toHaveBeenCalled());
// });

// test('Given deleteDoc fails, When deleting, Then show failure error', async () => {
//   mockGetDocs.mockResolvedValue({
//     docs: [
//       {
//         id: '1',
//         data: () => ({
//           name: 'ErrorItem',
//           price: 1,
//           description: 'fail',
//           image: 'img',
//           category: 'Woodwork',
//           email: 'seller@example.com',
//         }),
//       },
//     ],
//   });
//   mockDeleteDoc.mockRejectedValue(new Error('fail'));

//   renderWithRouter(<SellerPage />);

//   fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

//   expect(
//     await screen.findByText(/failed to delete product: fail/i)
//   ).toBeInTheDocument();
// });

// test('Given stock field present, When Save clicked, Then updateDoc is called', async () => {
//   mockGetDocs.mockResolvedValue({
//     docs: [
//       {
//         id: '1',
//         data: () => ({
//           name: 'A',
//           price: 10,
//           description: 'x',
//           image: 'img',
//           stock: 3,
//           category: 'Jewelry',
//           email: 'seller@example.com',
//         }),
//       },
//     ],
//   });
//   mockUpdateDoc.mockResolvedValue();

//   renderWithRouter(<SellerPage />);

//   fireEvent.change(await screen.findByDisplayValue('3'), {
//     target: { value: '7' },
//   });
//   fireEvent.click(screen.getByRole('button', { name: /save/i }));

//   await waitFor(() => expect(mockUpdateDoc).toHaveBeenCalled());
// });

// test('Given updateDoc fails, When saving stock, Then show failure error', async () => {
//   mockGetDocs.mockResolvedValue({
//     docs: [
//       {
//         id: '1',
//         data: () => ({
//           name: 'B',
//           price: 5,
//           description: 'x',
//           image: 'img',
//           stock: 2,
//           category: 'Woodwork',
//           email: 'seller@example.com',
//         }),
//       },
//     ],
//   });
//   mockUpdateDoc.mockRejectedValue(new Error('fail'));

//   renderWithRouter(<SellerPage />);

//   fireEvent.change(await screen.findByDisplayValue('2'), {
//     target: { value: '9' },
//   });
//   fireEvent.click(screen.getByRole('button', { name: /save/i }));

//   expect(
//     await screen.findByText(/failed to update stock: fail/i)
//   ).toBeInTheDocument();
// });
// src/pages/SellerPage/SellerPage.test.js

import React from 'react';
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
  // simulate no user
  mockOnAuthStateChanged.mockImplementation((auth, cb) => cb(null));

  renderWithRouter(<SellerPage />);

  // fill out all fields so we get past the "all fields" validation
  fireEvent.change(screen.getByPlaceholderText(/name/i),      { target: { value: 'X' } });
  fireEvent.change(screen.getByPlaceholderText(/price/i),     { target: { value: '1' } });
  fireEvent.change(screen.getByPlaceholderText(/description/i),{ target: { value: 'D' } });
  fireEvent.change(screen.getByPlaceholderText(/image url/i), { target: { value: 'U' } });

  // pick the first combobox (product form)
  const [productCombo] = screen.getAllByRole('combobox');
  fireEvent.change(productCombo, { target: { value: 'Jewelry' } });

  fireEvent.click(screen.getByRole('button', { name: /add product/i }));

  expect(await screen.findByText(/please log in first\./i)).toBeInTheDocument();
});

test('Given form missing name, When submitting, Then show "All fields are required."', async () => {
  renderWithRouter(<SellerPage />);

  fireEvent.change(screen.getByPlaceholderText(/price/i),     { target: { value: '100' } });
  fireEvent.change(screen.getByPlaceholderText(/description/i),{ target: { value: 'desc' } });
  fireEvent.change(screen.getByPlaceholderText(/image url/i), { target: { value: 'url' } });
  fireEvent.click(screen.getByRole('button', { name: /add product/i }));

  expect(await screen.findByText(/all fields are required\./i)).toBeInTheDocument();
});

test('Given valid form, When submitting, Then addDoc is called and form clears', async () => {
  mockAddDoc.mockResolvedValue();
  renderWithRouter(<SellerPage />);

  fireEvent.change(screen.getByPlaceholderText(/name/i),      { target: { value: 'Item' } });
  fireEvent.change(screen.getByPlaceholderText(/price/i),     { target: { value: '10' } });
  fireEvent.change(screen.getByPlaceholderText(/description/i),{ target: { value: 'info' } });
  fireEvent.change(screen.getByPlaceholderText(/image url/i), { target: { value: 'img' } });

  // pick the first combobox (product form)
  const [combo] = screen.getAllByRole('combobox');
  fireEvent.change(combo, { target: { value: 'Jewelry' } });

  fireEvent.click(screen.getByRole('button', { name: /add product/i }));

  await waitFor(() => expect(mockAddDoc).toHaveBeenCalled());
});

test('Given product in list, When delete succeeds, Then deleteDoc is called', async () => {
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

  fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

  await waitFor(() => expect(mockDeleteDoc).toHaveBeenCalled());
});

test('Given deleteDoc fails, When deleting, Then show failure error', async () => {
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
  renderWithRouter(<SellerPage />);

  fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

  expect(await screen.findByText(/failed to delete product:/i)).toBeInTheDocument();
});

test('Given stock field present, When Save clicked, Then updateDoc is called', async () => {
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

  fireEvent.change(await screen.findByDisplayValue('3'), { target: { value: '7' } });
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  await waitFor(() => expect(mockUpdateDoc).toHaveBeenCalled());
});

test('Given updateDoc fails, When saving stock, Then show failure error', async () => {
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
  renderWithRouter(<SellerPage />);

  fireEvent.change(await screen.findByDisplayValue('2'), { target: { value: '9' } });
  fireEvent.click(screen.getByRole('button', { name: /save/i }));

  expect(await screen.findByText(/failed to update stock:/i)).toBeInTheDocument();
});
