import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

test('renders footer links and social icons', () => {
  renderWithRouter(<Footer />);
  expect(screen.getByText('About')).toBeInTheDocument();
  expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  expect(screen.getByText('Terms')).toBeInTheDocument();
  expect(screen.getByText('Contact')).toBeInTheDocument();

  expect(screen.getByText('🐦')).toBeInTheDocument();
  expect(screen.getByText('📘')).toBeInTheDocument();
  expect(screen.getByText('📸')).toBeInTheDocument();

  expect(screen.getByText('Craft Nest')).toBeInTheDocument();
  expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument();
});
