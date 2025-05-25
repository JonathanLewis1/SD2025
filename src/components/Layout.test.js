import React from 'react'
import { render, screen } from '@testing-library/react'
import Layout from './Layout'
import Header from './Header'
import Footer from './Footer'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

jest.mock('./Header', () => () => <div data-testid="hdr">H</div>)
jest.mock('./Footer', () => () => <div data-testid="ftr">F</div>)

describe('Layout Component (Given-When-Then)', () => {
  test('Given a user is on any route matching "/", when Layout is rendered, then Header and Footer should be shown along with page content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/*" element={<Layout><div>Page</div></Layout>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('hdr')).toBeInTheDocument()
    expect(screen.getByTestId('ftr')).toBeInTheDocument()
    expect(screen.getByText('Page')).toBeInTheDocument()
  })

  test('Given a user is on the "/login" route, when Layout is rendered, then Header and Footer should be hidden and page content should be shown', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/*" element={<Layout><div>Page</div></Layout>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByTestId('hdr')).toBeNull()
    expect(screen.queryByTestId('ftr')).toBeNull()
    expect(screen.getByText('Page')).toBeInTheDocument()
  })
})
