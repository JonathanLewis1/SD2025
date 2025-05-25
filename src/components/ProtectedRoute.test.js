import React from 'react'
import { render, waitFor } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'
import { Navigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'

// mock firebase/auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  auth: {}
}))

// mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn()
}))

// mock our firebase export
jest.mock('../firebase', () => ({ auth: {}, db: {} }))

// spy on Navigate
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom')
  return {
    ...original,
    Navigate: ({ to }) => <div data-testid="nav" data-to={to} />
  }
})

describe('ProtectedRoute Component (Given-When-Then)', () => {
  const mockUser = { uid: 'u1', emailVerified: true }

  beforeEach(() => {
    jest.resetAllMocks()
    onAuthStateChanged.mockImplementation((_, cb) => {
      cb(mockUser)
      return jest.fn()
    })
  })

  test('Given no authenticated user or unverified email, when ProtectedRoute is rendered with allowedRoles, then it should redirect to "/login"', async () => {
    onAuthStateChanged.mockImplementation((_, cb) => {
      cb(null)
      return jest.fn()
    })

    const { getByTestId } = render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>OK</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(getByTestId('nav').dataset.to).toBe('/login')
    })
  })

  test('Given an authenticated user whose role is not in allowedRoles, when ProtectedRoute is rendered, then it should redirect to "/login"', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'buyer' }) })

    const { getByTestId } = render(
      <ProtectedRoute allowedRoles={['admin']}>
        <div>OK</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(getByTestId('nav').dataset.to).toBe('/login')
    })
  })

  test('Given an authenticated user whose role is in allowedRoles, when ProtectedRoute is rendered, then it should render its children', async () => {
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: 'seller' }) })

    const { queryByTestId, getByText } = render(
      <ProtectedRoute allowedRoles={['seller']}>
        <div data-testid="child">Secret</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(queryByTestId('nav')).toBeNull()
      expect(getByText('Secret')).toBeInTheDocument()
    })
  })

  test('Given a Firestore error occurs during role lookup, when ProtectedRoute is rendered, then it should redirect to "/error"', async () => {
    getDoc.mockRejectedValue(new Error('oops'))

    const { getByTestId } = render(
      <ProtectedRoute allowedRoles={['seller']}>
        <div>OK</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(getByTestId('nav').dataset.to).toBe('/error')
    })
  })
})
