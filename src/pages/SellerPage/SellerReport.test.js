import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import SellerReport from './SellerReport'
import { exportToCSV } from './exportCSV'

// Mock out your firebase config so that `db` is a dummy object
jest.mock('../../firebase', () => ({
  db: {}
}))

// Mock the firestore methods
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn()
}))

// Spy on exportToCSV
jest.mock('./exportCSV', () => ({
  exportToCSV: jest.fn()
}))

// Pull in the mocked getDocs
import { getDocs } from 'firebase/firestore'

describe('SellerReport Component', () => {
  const fakeDocs = [
    { data: () => ({ name: 'ItemA', stock: 5, price: 100, description: 'DescA' }) },
    { data: () => ({ name: 'ItemB', stock: 2, price:  50, description: 'DescB' }) }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Given no userEmail, Then only header row renders and export uses empty array', () => {
    // Arrange
    getDocs.mockResolvedValue({ docs: [] })

    // Act
    render(<SellerReport userEmail={null} refreshKey={0} />)

    // Assert: header
    expect(screen.getByRole('heading', { name: /inventory status/i })).toBeInTheDocument()
    // Only the <thead> row exists
    const allRows = screen.getAllByRole('row')
    expect(allRows).toHaveLength(1)

    // Export button still triggers CSV export with []
    fireEvent.click(screen.getByRole('button', { name: /export csv/i }))
    expect(exportToCSV).toHaveBeenCalledWith([], 'null_INVENTORY')
  })

  test('Given userEmail and data, When mounted, Then two body rows render and export uses that data', async () => {
    // Arrange
    getDocs.mockResolvedValue({ docs: fakeDocs })

    // Act
    render(<SellerReport userEmail="me@x.com" refreshKey={0} />)

    // Assert: wait for both items
    await waitFor(() => {
      expect(screen.getByText('ItemA')).toBeInTheDocument()
      expect(screen.getByText('ItemB')).toBeInTheDocument()
    })

    // Header + 2 data rows
    expect(screen.getAllByRole('row')).toHaveLength(3)

    // Export CSV with mapped rows
    fireEvent.click(screen.getByRole('button', { name: /export csv/i }))
    expect(exportToCSV).toHaveBeenCalledWith([
      { Name: 'ItemA', Quantity: 5, 'Price (R)': 100, Description: 'DescA' },
      { Name: 'ItemB', Quantity: 2, 'Price (R)':  50, Description: 'DescB' }
    ], 'me@x.com_INVENTORY')
  })

  test('Given refreshKey changes, When re-rendered, Then fetch is called again and table updates', async () => {
    // First render returns fakeDocs
    getDocs.mockResolvedValueOnce({ docs: fakeDocs })
    const { rerender } = render(<SellerReport userEmail="u@x.com" refreshKey={0} />)
    await waitFor(() => screen.getByText('ItemA'))

    // Next render returns newDocs
    const newDocs = [
      { data: () => ({ name: 'NewItem', stock:1, price:10, description:'NewDesc' }) }
    ]
    getDocs.mockResolvedValueOnce({ docs: newDocs })

    // Rerender with bumped refreshKey
    rerender(<SellerReport userEmail="u@x.com" refreshKey={1} />)

    // Should update to show only NewItem
    await waitFor(() => {
      expect(screen.getByText('NewItem')).toBeInTheDocument()
      expect(screen.queryByText('ItemA')).not.toBeInTheDocument()
    })
  })
})
