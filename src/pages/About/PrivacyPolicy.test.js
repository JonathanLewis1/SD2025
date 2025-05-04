import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivacyPolicy from './PrivacyPolicy';
import { MemoryRouter } from 'react-router-dom';

describe('PrivacyPolicy Page', () => {
  test('Given I am on the Privacy Policy page, when the component renders, then I should see the heading and some policy text', () => {
    render(
      <MemoryRouter>
        <PrivacyPolicy />
      </MemoryRouter>
    );

    const heading = screen.getByRole('heading', { name: /privacy policy/i });
    const paragraph = screen.getByText(/how user data is collected/i);

    expect(heading).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });
});
