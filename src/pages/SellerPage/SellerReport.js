import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { exportToCSV } from './exportCSV';

const SellerReport = ({ userEmail }) => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    if (userEmail) {
      fetchSalesData();
      fetchInventoryData();
    }
  }, [userEmail]);

  const fetchSalesData = async () => {
    try {
      const q = query(collection(db, 'orders'), where('sellerEmail', '==', userEmail));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());

      const grouped = {};
      data.forEach(order => {
        const date = order.timestamp.split('T')[0];
        grouped[date] = (grouped[date] || 0) + order.quantity;
      });

      const chartData = Object.entries(grouped).map(([date, quantity]) => ({ date, quantity }));
      setSalesData(chartData);
    } catch (error) {
      console.error("Error fetching sales:", error.message);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const q = query(collection(db, 'products'), where('email', '==', userEmail));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());
      setInventoryData(data);
    } catch (error) {
      console.error("Error fetching inventory:", error.message);
    }
  };

  const renderTable = (data, headers) => (
    <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%' }}>
      <thead>
        <tr>{headers.map(header => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {headers.map(header => <td key={header}>{row[header]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const downloadPDF = () => {
    alert('PDF export coming soon!');
  };

  return (
    <div style={{ marginTop: 32, width: '100%' }}>
      <h2>Dashboard Reports</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <button onClick={() => setActiveTab('sales')}>Sales Trends</button>
        <button onClick={() => setActiveTab('inventory')}>Inventory Status</button>
        <button onClick={() => setActiveTab('custom')}>Custom View</button>
      </div>

      {activeTab === 'sales' && (
        <div>
          <h3>Sales Trends</h3>
          {renderTable(salesData, ['date', 'quantity'])}
          <button onClick={() => exportToCSV(salesData, `${userEmail}_Sales`)}>Export as CSV</button>
          <button onClick={downloadPDF}>Export as PDF</button>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div>
          <h3>Inventory Status</h3>
          {renderTable(
            inventoryData.map(prod => ({
              name: prod.name,
              quantity: prod.stock,
              price: prod.price,
              description: prod.description
            })),
            ['name', 'quantity', 'price', 'description']
          )}
          <button onClick={() =>
            exportToCSV(
              inventoryData.map(prod => ({
                name: prod.name,
                quantity: prod.stock,
                price: prod.price,
                description: prod.description,
                imageUrl: prod.image
              })),
              `${userEmail}_Inventory`
            )
          }>
            Export as CSV
          </button>
          <button onClick={downloadPDF}>Export as PDF</button>
        </div>
      )}

      {activeTab === 'custom' && (
        <div>
          <h3>Custom View</h3>
          <p>Coming soon: filter by category, date, etc.</p>
        </div>
      )}
    </div>
  );
};

export default SellerReport;
