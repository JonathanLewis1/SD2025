import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Checkout from './Checkout'
import { httpsCallable } from 'firebase/functions'
import { functions, auth } from '../../firebase'
import { BrowserRouter } from 'react-router-dom'

// mock CartContext
jest.mock('../../context/CartContext', () => ({
  useCart: () => ({ clearCart: jest.fn() })
}))

jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn()
}))

jest.mock('../../firebase', () => ({
  functions: {},
  auth: { currentUser: { uid: 'u1' } }
}))

describe('Checkout Component', () => {
  let originalLocalStorage, closeSpy

  beforeEach(() => {
    originalLocalStorage = { ...window.localStorage }
    window.localStorage.clear()
    jest.clearAllMocks()
    closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {})
  })

  afterEach(() => {
    window.localStorage.clear()
    Object.assign(window.localStorage, originalLocalStorage)
    closeSpy.mockRestore()
  })

  function renderWithRouter() {
    return render(
      <BrowserRouter>
        <Checkout />
      </BrowserRouter>
    )
  }

  test('Given no cart data, when component mounts, then show "Your cart is empty"', () => {
    renderWithRouter()
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Close Window/i })).toBeInTheDocument()
  })


  test('Given cart items but invalid card number, when user submits, then show card validation error', async () => {
    const cartItems = [{ name: 'Item1', quantity: 1, price: 10 }]
    window.localStorage.setItem('checkoutCart', JSON.stringify(cartItems))
    renderWithRouter()

    fireEvent.change(screen.getByPlaceholderText(/Card Number/i), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText(/CVV/i), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText(/MM\/YY/i), { target: { value: '12/30' } })
    fireEvent.change(screen.getByPlaceholderText(/Street/i), { target: { value: '123 Main' } })
    fireEvent.change(screen.getByPlaceholderText(/Suburb/i), { target: { value: 'Downtown' } })
    fireEvent.change(screen.getByPlaceholderText(/City/i), { target: { value: 'City' } })
    fireEvent.change(screen.getByPlaceholderText(/Postal Code/i), { target: { value: '0000' } })
    fireEvent.click(screen.getByRole('button', { name: /Submit Payment/i }))

    expect(await screen.findByText(/Card number must be 16 digits\./i)).toBeInTheDocument()
  })

  test('Given valid form but no user logged in, when user submits, then show "User not logged in."', async () => {
    delete auth.currentUser
    const cartItems = [{ name: 'Item1', quantity: 1, price: 10 }]
    window.localStorage.setItem('checkoutCart', JSON.stringify(cartItems))
    renderWithRouter()

    fireEvent.change(screen.getByPlaceholderText(/Card Number/i), { target: { value: '1'.repeat(16) } })
    fireEvent.change(screen.getByPlaceholderText(/CVV/i), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText(/MM\/YY/i), { target: { value: '12/50' } })
    fireEvent.change(screen.getByPlaceholderText(/Street/i), { target: { value: '123 Main' } })
    fireEvent.change(screen.getByPlaceholderText(/Suburb/i), { target: { value: 'Downtown' } })
    fireEvent.change(screen.getByPlaceholderText(/City/i), { target: { value: 'City' } })
    fireEvent.change(screen.getByPlaceholderText(/Postal Code/i), { target: { value: '0000' } })
    fireEvent.click(screen.getByRole('button', { name: /Submit Payment/i }))

    expect(await screen.findByText(/User not logged in\./i)).toBeInTheDocument()
  })

  test('Given valid form and user, when processCheckout succeeds, then window.close is called', async () => {
    auth.currentUser = { uid: 'u1' }
    const mockFn = jest.fn().mockResolvedValue({})
    httpsCallable.mockReturnValue(mockFn)

    const cartItems = [{ name: 'Item1', quantity: 2, price: 5 }]
    window.localStorage.setItem('checkoutCart', JSON.stringify(cartItems))
    renderWithRouter()

    fireEvent.change(screen.getByPlaceholderText(/Card Number/i), { target: { value: '1'.repeat(16) } })
    fireEvent.change(screen.getByPlaceholderText(/CVV/i), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText(/MM\/YY/i), { target: { value: '12/50' } })
    fireEvent.change(screen.getByPlaceholderText(/Street/i), { target: { value: '123 Main' } })
    fireEvent.change(screen.getByPlaceholderText(/Suburb/i), { target: { value: 'Downtown' } })
    fireEvent.change(screen.getByPlaceholderText(/City/i), { target: { value: 'City' } })
    fireEvent.change(screen.getByPlaceholderText(/Postal Code/i), { target: { value: '0000' } })
    fireEvent.click(screen.getByRole('button', { name: /Submit Payment/i }))

    await waitFor(() => {
      expect(mockFn).toHaveBeenCalledWith({
        cart: cartItems,
        deliveryType: 'standard',
        address: expect.objectContaining({
          street: '123 Main',
          suburb: 'Downtown',
          city: 'City',
          postalCode: '0000'
        })
      })
      expect(closeSpy).toHaveBeenCalled()
    })
  })

  test('Given processCheckout fails, when user submits, then show processing error', async () => {
    auth.currentUser = { uid: 'u1' }
    const mockFn = jest.fn().mockRejectedValue(new Error('fail'))
    httpsCallable.mockReturnValue(mockFn)

    const cartItems = [{ name: 'Item1', quantity: 1, price: 5 }]
    window.localStorage.setItem('checkoutCart', JSON.stringify(cartItems))
    renderWithRouter()

    fireEvent.change(screen.getByPlaceholderText(/Card Number/i), { target: { value: '1'.repeat(16) } })
    fireEvent.change(screen.getByPlaceholderText(/CVV/i), { target: { value: '123' } })
    fireEvent.change(screen.getByPlaceholderText(/MM\/YY/i), { target: { value: '12/50' } })
    fireEvent.change(screen.getByPlaceholderText(/Street/i), { target: { value: '123 Main' } })
    fireEvent.change(screen.getByPlaceholderText(/Suburb/i), { target: { value: 'Downtown' } })
    fireEvent.change(screen.getByPlaceholderText(/City/i), { target: { value: 'City' } })
    fireEvent.change(screen.getByPlaceholderText(/Postal Code/i), { target: { value: '0000' } })
    fireEvent.click(screen.getByRole('button', { name: /Submit Payment/i }))

    expect(await screen.findByText(/Order processing failed: fail/i)).toBeInTheDocument()
  })
})
