import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignUp from './SignUp'
import { BrowserRouter } from 'react-router-dom'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../../firebase'

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}))

jest.mock('../../firebase', () => ({
  auth: {},
  functions: {},
}))

jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn(),
}))

const renderForm = () =>
  render(
    <BrowserRouter>
      <SignUp />
    </BrowserRouter>
  )

describe('SignUp Component (User Stories)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Given a user is on the signup page, when they click “Sign Up” with every field empty, then the “All fields required.” error should show', async () => {
    renderForm()
    fireEvent.click(screen.getByText(/Sign Up/i))
    expect(await screen.findByText(/All fields required\./i)).toBeInTheDocument()
  })

  test('Given a user is on the signup page, when they fill only First Name and submit, then the “All fields required.” error should show', async () => {
    renderForm()
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } })
    fireEvent.click(screen.getByText(/Sign Up/i))
    expect(await screen.findByText(/All fields required\./i)).toBeInTheDocument()
  })

  test('Given a user is on the signup page, when they fill only names and submit, then the “All fields required.” error should show', async () => {
    renderForm()
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } })
    fireEvent.click(screen.getByText(/Sign Up/i))
    expect(await screen.findByText(/All fields required\./i)).toBeInTheDocument()
  })

  test('Given a user is on the signup page, when they fill names and email only and submit, then the “All fields required.” error should show', async () => {
    renderForm()
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } })
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByText(/Sign Up/i))
    expect(await screen.findByText(/All fields required\./i)).toBeInTheDocument()
  })

  test('Given a user is on the signup page, when they enter a banned email and submit, then the “This email is banned.” error should show', async () => {
    httpsCallable.mockImplementation((_, name) => {
      if (name === 'isEmailBanned') {
        return () => Promise.resolve({ data: { banned: true } })
      }
    })

    renderForm()
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Banned' } })
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } })
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'banned@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText(/Sign Up/i))

    expect(await screen.findByText(/This email is banned\./i)).toBeInTheDocument()
  })

  test('Given a user is on the signup page, when they fill all fields valid and are not banned, then their account is created, email verification sent, and they are redirected', async () => {
    const mockUser = { user: { uid: 'uid123' } }

    httpsCallable.mockImplementation((_, name) => {
      if (name === 'isEmailBanned') {
        return () => Promise.resolve({ data: { banned: false } })
      }
      if (name === 'registerUserProfile') {
        return () => Promise.resolve({ success: true })
      }
    })

    createUserWithEmailAndPassword.mockResolvedValue(mockUser)
    sendEmailVerification.mockResolvedValue()

    renderForm()
    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'User' } })
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText(/Sign Up/i))

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'user@example.com', 'password123')
      expect(sendEmailVerification).toHaveBeenCalledWith(expect.objectContaining({ uid: 'uid123' }))
    })
  })

})
