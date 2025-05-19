import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotFoundPage from './NotFoundPage';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NotFoundPage Component', () => {
  test('Given 404 page, When Go Back Home clicked, Then navigate("/")', () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /Go Back Home/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
