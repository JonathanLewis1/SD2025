// src/pages/SellerPage/OrderReport.test.js

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OrderReport from './OrderReport'
import { exportToCSV } from './exportCSV'

// Mock firebase
jest.mock('../../firebase', () => ({ db: {} }))
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn()
}))
import { getDocs } from 'firebase/firestore'

// Mock CSV export
jest.mock('./exportCSV', () => ({ exportToCSV: jest.fn() }))

describe('OrderReport Component', () => {
  const fakeTimestamp = { seconds: 1620000000 }
  const snapDocs = [
    {
      id: 'o1',
      data: () => ({
        products: ['ProdA', 'ProdB'],
        quantity: [2, 1],
        Price: [10, 20],
        sellersEmails: ['me@x.com', 'other@x.com'],
        DeliveryStatus: 'Shipped',
        DeliveryType: 'Standard',
        StreetName: 'Main',
        suburb: 'Cent',
        postalCode: '1234',
        city: 'Town',
        timestamp: fakeTimestamp
      })
    },
    {
      id: 'o2',
      data: () => ({
        products: ['ProdC'],
        quantity: [3],
        Price: [5],
        sellersEmails: ['me@x.com'],
        DeliveryStatus: 'Pending',
        DeliveryType: 'Express',
        StreetName: '2nd',
        suburb: 'Ville',
        postalCode: '5678',
        city: 'City',
        timestamp: fakeTimestamp
      })
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Given no userEmail, Then show no data messages', async () => {
    render(<OrderReport userEmail={null} />)

    expect(await screen.findByText(/No sales data yet\./i)).toBeInTheDocument()
    expect(screen.getByText(/No matching items\./i)).toBeInTheDocument()
  })

  test('Given orders exist, When mounted, Then render sales trends and export CSV', async () => {
    getDocs.mockResolvedValue({ docs: snapDocs })
    render(<OrderReport userEmail="me@x.com" />)

    const date = new Date(fakeTimestamp.seconds * 1000)
      .toISOString()
      .slice(0, 10)

    // wait for trends row
    await waitFor(() => {
      expect(screen.getByText(date)).toBeInTheDocument()
      expect(screen.getByText('35')).toBeInTheDocument()
    })

    // grab both export buttons: [0]=trends, [1]=custom
    const buttons = screen.getAllByRole('button', { name: /Export CSV/i })
    fireEvent.click(buttons[0])

    expect(exportToCSV).toHaveBeenCalledWith(
      [{ Date: date, Total: 35 }],
      'me@x.com_SALES_TRENDS'
    )
  })

})
