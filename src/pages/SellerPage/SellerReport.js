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
    <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%' }}>
      <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{data.map((row, i) => (
        <tr key={i}>{headers.map(h => <td key={h}>{row[h]}</td>)}</tr>
      ))}</tbody>
    </table>
  );

  return (
    <div ref={ref} id="seller-report" style={{ marginTop: 32, width: '100%' }}>
      <h2>Dashboard Reports</h2>
      <h3>Inventory Status</h3>
      {renderTable(
        inventoryData.map(p => ({
          name: p.name,
          quantity: p.stock,
          price: p.price,
          description: p.description
        })),
        ['name', 'quantity', 'price', 'description']
      )}
      <button onClick={() => exportToCSV(
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

export default SellerReport;
