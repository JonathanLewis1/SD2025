import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Admin from './Admin'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../firebase'
import { BrowserRouter } from 'react-router-dom'

jest.mock('firebase/functions', () => ({
  httpsCallable: jest.fn()
}))

jest.mock('../../firebase', () => ({
  functions: {}
}))

const wrap = ui => render(<BrowserRouter>{ui}</BrowserRouter>)

describe('Admin Component', () => {
  const usersMock = [
    { id: 'u1', firstName: 'Alice', lastName: 'A', email: 'a@x.com', role: 'buyer' },
    { id: 'u2', firstName: 'Bob', lastName: 'B', email: 'b@x.com', role: 'seller' }
  ]
  const complaintsMock = [
    { name: 'Carol', email: 'c@x.com', message: 'Issue 1' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Given Admin mounts, when fetchUsers and fetchComplaints resolve, then users and complaints tables populate', async () => {
    const getAllUsers = jest.fn().mockResolvedValue({ data: usersMock })
    const getAllComplaints = jest.fn().mockResolvedValue({ data: complaintsMock })
    httpsCallable
      .mockReturnValueOnce(getAllUsers)
      .mockReturnValueOnce(getAllComplaints)

    wrap(<Admin />)

    for (let u of usersMock) {
      expect(await screen.findByText(u.firstName)).toBeInTheDocument()
      expect(screen.getByText(u.email)).toBeInTheDocument()
    }
    expect(await screen.findByText(complaintsMock[0].message)).toBeInTheDocument()
  })

  test('Given Ban clicked, when banUser succeeds, then that row is removed', async () => {
    const getAllUsers = jest.fn().mockResolvedValue({ data: usersMock })
    const getAllComplaints = jest.fn().mockResolvedValue({ data: [] })
    const banUserFn = jest.fn().mockResolvedValue({})
    httpsCallable
      .mockReturnValueOnce(getAllUsers)
      .mockReturnValueOnce(getAllComplaints)
      .mockReturnValueOnce(banUserFn)

    wrap(<Admin />)
    await screen.findByText('Alice')

    fireEvent.click(screen.getAllByRole('button', { name: /Ban/i })[0])

    await waitFor(() => {
      expect(banUserFn).toHaveBeenCalledWith({ userId: 'u1', email: 'a@x.com' })
      expect(screen.queryByText('Alice')).toBeNull()
    })
  })

  test('Given Ban clicked but fails, then error card shows', async () => {
    const getAllUsers = jest.fn().mockResolvedValue({ data: usersMock })
    const getAllComplaints = jest.fn().mockResolvedValue({ data: [] })
    const banUserFn = jest.fn().mockRejectedValue(new Error('fail-ban'))
    httpsCallable
      .mockReturnValueOnce(getAllUsers)
      .mockReturnValueOnce(getAllComplaints)
      .mockReturnValueOnce(banUserFn)

    wrap(<Admin />)
    await screen.findByText('Alice')

    fireEvent.click(screen.getAllByRole('button', { name: /Ban/i })[0])

    expect(await screen.findByText(/Error banning user: fail-ban/i)).toBeInTheDocument()
  })

  test('Given Make Admin clicked, when makeAdmin succeeds, then role cell updates', async () => {
    const getAllUsers = jest.fn().mockResolvedValue({ data: usersMock })
    const getAllComplaints = jest.fn().mockResolvedValue({ data: [] })
    const makeAdminFn = jest.fn().mockResolvedValue({})
    httpsCallable
      .mockReturnValueOnce(getAllUsers)
      .mockReturnValueOnce(getAllComplaints)
      .mockReturnValueOnce(makeAdminFn)

    wrap(<Admin />)
    await screen.findByText('Bob')

    fireEvent.click(screen.getAllByRole('button', { name: /Make Admin/i })[1])

    await waitFor(() => {
      expect(makeAdminFn).toHaveBeenCalledWith({ userId: 'u2' })
      // after update, Bob's role cell text should now be "admin"
      const roleCells = screen.getAllByRole('cell', { name: /admin/i })
      expect(roleCells.length).toBeGreaterThan(0)
    })
  })

  test('Given Make Admin clicked but fails, then error card shows', async () => {
    const getAllUsers = jest.fn().mockResolvedValue({ data: usersMock })
    const getAllComplaints = jest.fn().mockResolvedValue({ data: [] })
    const makeAdminFn = jest.fn().mockRejectedValue(new Error('fail-make'))
    httpsCallable
      .mockReturnValueOnce(getAllUsers)
      .mockReturnValueOnce(getAllComplaints)
      .mockReturnValueOnce(makeAdminFn)

    wrap(<Admin />)
    await screen.findByText('Bob')

    fireEvent.click(screen.getAllByRole('button', { name: /Make Admin/i })[1])

    expect(await screen.findByText(/Error making user admin: fail-make/i)).toBeInTheDocument()
  })
})
