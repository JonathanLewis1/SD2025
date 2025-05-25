import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
//import { getAllUsersv2 } from '../../../functions';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);

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
  const banUserFn = httpsCallable(functions, 'banUser');
  await banUserFn({ userId, email });
  setUsers(prev => prev.filter(user => user.id !== userId));
};

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Admin Dashboard</h1>

      <section style={styles.panel}>
        <h2 style={styles.subheading}>Users</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.headerCell}>First Name</th>
              <th style={styles.headerCell}>Last Name</th>
              <th style={styles.headerCell}>Email</th>
              <th style={styles.headerCell}>Role</th>
              <th style={styles.headerCell}>Action</th>
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
                  <button onClick={() => banUser(user.id, user.email)} style={styles.button}>
                    Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.subheading}>Complaints</h2>
        <table style={styles.table}>
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
      </section>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#feffdf',
    minHeight: '100vh',
    padding: 32,
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#3b82f6',
    textAlign: 'center'
  },
  subheading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12
  },
  panel: {
    marginBottom: 48,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    overflowX: 'auto',
  },
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
  }
};

export default Admin;
