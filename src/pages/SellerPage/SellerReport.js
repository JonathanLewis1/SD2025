// SellerReport.js
import React, { useState, useEffect, forwardRef } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { exportToCSV } from './exportCSV';

const SellerReport = forwardRef(({ userEmail }, ref) => {
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    if (userEmail) fetchInventoryData();
  }, [userEmail]);

  const fetchInventoryData = async () => {
    try {
      const q = query(collection(db, 'products'), where('email', '==', userEmail));
      const snapshot = await getDocs(q);
      setInventoryData(snapshot.docs.map(doc => doc.data()));
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
    }
  };

  const renderTable = (data, headers) => (
    <table border="1" cellPadding="8" style={styles.table}>
      <thead><tr>{headers.map(h => <th style={styles.headerCell} key={h}>{h}</th>)}</tr></thead>
      <tbody>{data.map((row, i) => (
        <tr key={i}>{headers.map(h => <td style={styles.cell} key={h}>{row[h]}</td>)}</tr>
      ))}</tbody>
    </table>
  );

  return (
    <div ref={ref} id="seller-report" style={styles.container}>
      <h2 style={styles.heading}>Dashboard Reports</h2>
      <h3 style={styles.heading}>Inventory Status</h3>
      {renderTable(
        inventoryData.map(p => ({
          name: p.name,
          quantity: p.stock,
          price: p.price,
          description: p.description
        })),
        ['name', 'quantity', 'price', 'description']
      )}
      <button style={styles.button}onClick={() => exportToCSV(
        inventoryData.map(p => ({
          name: p.name,
          quantity: p.stock,
          price: p.price,
          description: p.description,
          imageUrl: p.image
        })),
        `${userEmail}_Inventory`
      )}>Export as CSV</button>
    </div>
  );
});

const styles = {
  container: {
    backgroundColor: '#feffdf',
    minHeight: '100vh',
    padding: 32,
    textAlign: 'center',
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

export default SellerReport;
