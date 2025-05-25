// src/pages/BuyersOrders/BuyersOrders.test.js

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import BuyersOrders from './BuyersOrders'
import { auth } from '../../firebase'
import { getDocs } from 'firebase/firestore'

jest.mock('../../firebase', () => ({
  auth: { onAuthStateChanged: jest.fn() },
  db: {}
}))
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query:      jest.fn(),
  where:      jest.fn(),
  getDocs:    jest.fn()
}))

describe('BuyersOrders Component (Given-When-Then)', () => {
  const user = { email: 'u@x.com' }
  const unsub = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // onAuthStateChanged returns unsubscribe
    auth.onAuthStateChanged.mockImplementation(cb => {
      setTimeout(() => cb(user), 0)
      return unsub
    })
  })

  test('Given an authenticated user with no orders, When the component mounts, Then it shows loading then "You have no orders."', async () => {
    // Given no Firestore documents for orders
    getDocs.mockResolvedValue({ docs: [] })

    // When rendering the component
    render(<BuyersOrders />)

    // Then initial loading indicator appears
    expect(screen.getByText(/Loading…/i)).toBeInTheDocument()

    // And after fetch, "You have no orders." is shown
    await waitFor(() => {
      expect(screen.getByText(/You have no orders\./i)).toBeInTheDocument()
    })
  })

  test('Given no authenticated user, When the component mounts, Then it shows loading then "You have no orders."', async () => {
    // Given onAuthStateChanged yields null (no user)
    auth.onAuthStateChanged.mockImplementation(cb => {
      setTimeout(() => cb(null), 0)
      return unsub
    })

    // When rendering the component
    render(<BuyersOrders />)

    // Then initial loading indicator appears
    expect(screen.getByText(/Loading…/i)).toBeInTheDocument()

    // And after auth resolves, "You have no orders." is shown
    await waitFor(() => {
      expect(screen.getByText(/You have no orders\./i)).toBeInTheDocument()
    })
  })
})
