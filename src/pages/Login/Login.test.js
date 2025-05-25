import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from './Login'
import { BrowserRouter } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../../firebase'

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(cb => { cb(null); return jest.fn() }),
  setPersistence: jest.fn().mockResolvedValue(),
  browserSessionPersistence: {}
}))

jest.mock('firebase/functions', () => ({ httpsCallable: jest.fn() }))
jest.mock('../../firebase', () => ({ auth: {}, functions: {} }))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const renderLogin = () =>
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )

describe('Login Component (User Stories)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Given a user is on the login page, when the component mounts, then it should subscribe to auth state changes', () => {
    renderLogin()
    expect(onAuthStateChanged).toHaveBeenCalledWith(auth, expect.any(Function))
  })

  test('Given a user is on the login page, when it renders with no input, then the email and password placeholders and “Sign up now” link should be visible', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByText(/sign up now/i)).toHaveAttribute('href', '/signup')
  })

  test('Given a user is on the login page, when they click “Log In” with both fields empty, then the “Email and password required.” error should show', async () => {
    renderLogin()
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/email and password required/i)).toBeInTheDocument()
  })

  test('Given a user is on the login page, when they enter wrong credentials and submit, then the “Invalid credentials.” error should show', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'x@y.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })

  test('Given a user is on the login page, when sign-in fails for any other reason, then the generic “Login failed: <message>” error should show', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'other', message: 'oops' })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/login failed: oops/i)).toBeInTheDocument()
  })

  test('Given a user is on the login page, when they submit with an unverified email, then the “Please verify your email first.” error should show and they are signed out', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: false } })
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'u@v.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/please verify your email first/i)).toBeInTheDocument()
    expect(signOut).toHaveBeenCalled()
  })

  test('Given a user is on the login page, when checkBanned returns banned, then the “Account banned.” error should show and they are signed out', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: true } })
    const banFn = jest.fn().mockResolvedValue({ data: { banned: true } })
    httpsCallable.mockReturnValueOnce(banFn)
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'ban@ned.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/account banned/i)).toBeInTheDocument()
    expect(signOut).toHaveBeenCalled()
  })

  test('Given a user is on the login page, when checkRole returns admin, then they should be redirected to "/admin"', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: true } })
    const banFn = jest.fn().mockResolvedValue({ data: { banned: false } })
    const roleFn = jest.fn().mockResolvedValue({ data: { role: 'admin' } })
    httpsCallable.mockReturnValueOnce(banFn).mockReturnValueOnce(roleFn)
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'a@d.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
  })

  test('Given a user is on the login page, when checkRole returns an unknown role, then the “Unknown role.” error should show', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: true } })
    const banFn = jest.fn().mockResolvedValue({ data: { banned: false } })
    const roleFn = jest.fn().mockResolvedValue({ data: { role: 'ghost' } })
    httpsCallable.mockReturnValueOnce(banFn).mockReturnValueOnce(roleFn)
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'g@h.com' } })
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pw' } })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(await screen.findByText(/unknown role/i)).toBeInTheDocument()
  })
})
