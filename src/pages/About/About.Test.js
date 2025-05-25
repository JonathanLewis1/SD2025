// src/pages/About/About.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import About from './About';

describe('About Component — Given/When/Then', () => {
  beforeEach(() => {
    render(<About />);
  });

  test('Given About rendered, When viewed, Then the main heading "About Us" is displayed', () => {
    // Then
    expect(screen.getByRole('heading', { level: 1, name: /about us/i })).toBeInTheDocument();
  });

  test('Given About rendered, When viewed, Then the team members paragraph mentions "Jacob Boner"', () => {
    // Then
    expect(
      screen.getByText(/we are five friends — Jacob Boner, Jake Shapiro, Jonathan Lewis, Aharon Zagnoev, and Carl Germishuys/i)
    ).toBeInTheDocument();
  });

  test('Given About rendered, When viewed, Then the final welcome message "Welcome to CraftNest — where craft meets community." is displayed', () => {
    // Then
    expect(
      screen.getByText(/welcome to craftnest — where craft meets community\./i)
    ).toBeInTheDocument();
  });
});
