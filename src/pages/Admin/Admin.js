


import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../../firebase';
import { doc } from 'firebase/firestore';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import Section from '../../components/common/Section';
import Card from '../../components/common/Card';
import TableWrapper from '../../components/common/TableWrapper';
import Button from '../../components/common/Button';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchComplaints();
  }, []);

  const fetchUsers = async () => {
    const getAllUsers = httpsCallable(functions, 'getAllUsersv2');
    const response = await getAllUsers();
    setUsers(response.data);
  };

  const fetchComplaints = async () => {
    const getAllComplaints = httpsCallable(functions, 'getAllComplaintsv2');
    const response = await getAllComplaints();
    setComplaints(response.data);
  };

  const banUser = async (userId, email) => {
    try {
      const banUserFn = httpsCallable(functions, 'banUser');
      await banUserFn({ userId, email });
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      setError('Error banning user: ' + error.message);
      console.error('Error banning user:', error);
    }
  };

  const makeAdmin = async (userId) => {
    try {
      const makeAdminFn = httpsCallable(functions, 'makeAdmin');
      await makeAdminFn({ userId });
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role: 'admin' } : user
      ));
    } catch (error) {
      setError('Error making user admin: ' + error.message);
      console.error('Error making user admin:', error);
    }
  };

  return (
    <Container>
      <Section styleProps={{ display: 'flex', justifyContent: 'center' }}>
        <Header level={1} styleProps={{ textAlign: 'center' }}>
          Admin Dashboard
        </Header>
      </Section>

      {error && (
        <Section>
          <Card styleProps={{ backgroundColor: '#fee2e2', color: '#dc2626', textAlign: 'center' }}>
            {error}
          </Card>
        </Section>
      )}

      <Section>
        <Header level={2}>Users</Header>
        <Card>
          <TableWrapper>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={styles.headerCell}>First Name</th>
                  <th style={styles.headerCell}>Last Name</th>
                  <th style={styles.headerCell}>Email</th>
                  <th style={styles.headerCell}>Role</th>
                  <th style={styles.headerCell}>Ban Account</th>
                  <th style={styles.headerCell}>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={styles.cell}>{user.firstName}</td>
                    <td style={styles.cell}>{user.lastName}</td>
                    <td style={styles.cell}>{user.email}</td>
                    <td style={styles.cell}>{user.role}</td>
                    <td style={styles.cell}>
                      <button
                        onClick={() => banUser(user.id, user.email)}
                        style={styles.button}
                        disabled={user.role === 'admin'}
                      >
                        Ban
                      </button>
                    </td>
                    <td style={styles.cell}>
                      <button
                        onClick={() => makeAdmin(user.id)}
                        style={styles.button2}
                        disabled={user.role === 'admin'}
                      >
                        Make Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        </Card>
      </Section>

      <Section>
        <Header level={2}>Complaints</Header>
        <Card>
          <TableWrapper>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={styles.headerCell}>Name</th>
                  <th style={styles.headerCell}>Email</th>
                  <th style={styles.headerCell}>Message</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, index) => (
                  <tr key={index}>
                    <td style={styles.cell}>{c.name}</td>
                    <td style={styles.cell}>{c.email}</td>
                    <td style={styles.cell}>{c.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        </Card>
      </Section>
    </Container>
  );
}

const styles = {
  headerCell: {
    border: '1px solid #ccc',
    padding: '10px 14px',
    textAlign: 'left',
    backgroundColor: '#f0f0f0',
    fontWeight: '600'
  },
  cell: {
    border: '1px solid #ccc',
    padding: '10px 14px',
    textAlign: 'left'
  },
  button: {
    backgroundColor: '#f97316',
    color: '#ffffff',
    padding: '8px 12px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: '500'
  },
  button2: {
    backgroundColor: '#008000',
    color: '#ffffff',
    padding: '8px 12px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: '500'
  }
};
