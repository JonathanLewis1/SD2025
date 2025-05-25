import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';
import { BrowserRouter } from 'react-router-dom';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (ui) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe('ProductCard Component Given/When/Then', () => {
  const product = {
    id: 'abc123',
    name: 'Test Product',
    price: 99.99,
    image: '/path/to/image.jpg',
  };

  test('Given a product, When rendered, Then show image, name, and price', () => {
    renderWithRouter(<ProductCard product={product} />);

    //Image renders with correct src and alt
    const img = screen.getByRole('img', { name: /test product/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', product.image);
    expect(img).toHaveAttribute('alt', product.name);

    //Name renders (inside a <section>)
    expect(screen.getByText(product.name)).toBeInTheDocument();

    //Price renders with R prefix
    expect(screen.getByText(`R${product.price}`)).toBeInTheDocument();
  });

  test('Given the card, When clicked, Then navigate to product detail page', () => {
    renderWithRouter(<ProductCard product={product} />);

    //The clickable container is the Card's root <section>
    const cardSection = screen
      .getByText(product.name)
      .closest('section');

    fireEvent.click(cardSection);

    expect(mockNavigate).toHaveBeenCalledWith(`/product/${product.id}`);
  });
});
