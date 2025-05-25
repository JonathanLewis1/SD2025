import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Footer from './Footer'

const renderWithRouter = ui =>
  render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  )

describe('Footer Component (Given-When-Then)', () => {
  test('Given a user is on any page, when the footer is rendered, then the links "About", "Contact", and "Home" should be visible', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  test('Given a user is on any page, when the footer is rendered, then the brand name "Craft Nest" and the current year should be visible', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByText('Craft Nest')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`${new Date().getFullYear()}`))).toBeInTheDocument()
  })
})
