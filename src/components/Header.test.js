import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Header from './Header'
import { useCart } from '../context/CartContext'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import { getDoc, doc } from 'firebase/firestore'
import { BrowserRouter } from 'react-router-dom'

jest.mock('../context/CartContext')
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn()
}))
jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn()
}))
jest.mock('../firebase', () => ({ auth: {}, db: {} }))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ to, children }) => <a href={to}>{children}</a>
}))

describe('Header Component (Given-When-Then)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useCart.mockReturnValue({ cart: [{ id: '1' }] })
  })

  test('Given cart has items, when header renders, then cart count is shown', () => {
    onAuthStateChanged.mockImplementation((_, cb) => { cb(null); return jest.fn() })
    render(<BrowserRouter><Header /></BrowserRouter>)
    expect(screen.getByText(/Cart 🛒/)).toHaveTextContent('(1)')
  })

  test('Given logout clicked, when user clicks Logout, then signOut and navigate("/login")', async () => {
    onAuthStateChanged.mockImplementation((_, cb) => { cb(null); return jest.fn() })
    render(<BrowserRouter><Header /></BrowserRouter>)
    fireEvent.click(screen.getByText(/Logout/i))
    await waitFor(() => expect(signOut).toHaveBeenCalledWith(auth))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  test('Given user role is seller, when header renders, then seller links appear', async () => {
    onAuthStateChanged.mockImplementation((_, cb) => {
      cb({ uid: 'u1' }); return jest.fn()
    })
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'seller' }) })
    render(<BrowserRouter><Header /></BrowserRouter>)
    expect(await screen.findByText('My Products')).toBeInTheDocument()
    expect(screen.getByText('My Orders')).toBeInTheDocument()
  })

  test('Given user role is buyer, when header renders, then buyer orders link appears and seller links do not', async () => {
    onAuthStateChanged.mockImplementation((_, cb) => {
      cb({ uid: 'u2' }); return jest.fn()
    })
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'buyer' }) })
    render(<BrowserRouter><Header /></BrowserRouter>)
    expect(await screen.findByText('My Orders')).toBeInTheDocument()
    expect(screen.queryByText('My Products')).toBeNull()
  })

  test('Given user role is admin, when header renders, then admin dashboard link appears', async () => {
    onAuthStateChanged.mockImplementation((_, cb) => {
      cb({ uid: 'u3' }); return jest.fn()
    })
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'admin' }) })
    render(<BrowserRouter><Header /></BrowserRouter>)
    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument()
  })

  test('Given no user, when header renders, then no role-specific links appear', () => {
    onAuthStateChanged.mockImplementation((_, cb) => { cb(null); return jest.fn() })
    render(<BrowserRouter><Header /></BrowserRouter>)
    expect(screen.queryByText('My Products')).toBeNull()
    expect(screen.queryByText('My Orders')).toBeNull()
    expect(screen.queryByText('Admin Dashboard')).toBeNull()
  })
})
