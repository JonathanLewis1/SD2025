// OrderReport.js
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { exportToCSV } from './exportCSV';

const OrderReport = ({ userEmail }) => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sales, setSales] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userEmail) loadOrders();
  }, [userEmail]);

  const loadOrders = async () => {
    try {
      // Fetch all orders and filter client-side to avoid permission issues on query
      const snap = await getDocs(collection(db, 'orders'));
      const items = [];
      const daily = {};

      snap.docs.forEach(docSnap => {
        const d = docSnap.data();
        const { products, quantity, Price, sellersEmails, timestamp, DeliveryStatus } = d;
        sellersEmails.forEach((email, i) => {
          if (email === userEmail) {
            const orderItem = {
              id: `${docSnap.id}-${i}`,
              product: d.productNames?.[i] || products[i],
              quantity: quantity[i],
              price: Price[i],
              status: DeliveryStatus,
              date: new Date(timestamp).toLocaleDateString(),
            };
            items.push(orderItem);
            daily[orderItem.date] = (daily[orderItem.date] || 0) + orderItem.quantity;
          }
        });
      });

      setOrders(items);
      setFiltered(items);
      setSales(Object.entries(daily).map(([date, qty]) => ({ date, qty })));
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load orders. Check your Firestore rules and authentication.');
    }
  };

  const applyFilter = status => {
    setStatusFilter(status);
    setFiltered(status === 'All' ? orders : orders.filter(o => o.status === status));
  };

  const renderCards = items => (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))' }}>
      {items.map(o => (
        <div key={o.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, background: '#fff' }}>
          <h4>{o.product}</h4>
          <p><strong>Qty:</strong> {o.quantity}</p>
          <p><strong>Price:</strong> R{o.price}</p>
          <p><strong>Status:</strong> {o.status}</p>
          <p><strong>Date:</strong> {o.date}</p>
        </div>
      ))}
    </div>
  );

  const renderTable = (data, cols) => (
    <table border="1" cellPadding="8" style={styles.table}>
      <thead><tr>{cols.map(c => <th style={styles.headerCell} key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>{cols.map(c => <td style={styles.cell} key={c}>{row[c.toLowerCase()] ?? row[c]}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );

  if (error) return <p style={{ color: 'red', marginTop: 32 }}>{error}</p>;

  return (
    <div id="order-report" style={{ marginTop: 32, width: '100%' }}>
      <h2 style={styles.heading}>Seller Orders Report</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('orders')}>Orders</button>
        <button onClick={() => setTab('sales')}>Sales Trends</button>
        <button onClick={() => setTab('custom')}>Custom View</button>
      </div>

      {tab === 'orders' && (
        <>
          <div style={{ marginBottom: 8 }}>
            {['All','Pending','Delivered','Cancelled'].map(s => (
              <button key={s} onClick={() => applyFilter(s)} style={{ marginRight: 8 }}>{s}</button>
            ))}
            <button onClick={() => exportToCSV(filtered, `${userEmail}_Orders`)}>Export Orders CSV</button>
          </div>
          {filtered.length ? renderCards(filtered) : <p>No orders to display.</p>}
        </>
      )}

      {tab === 'sales' && (
        <div>
          <h3>Sales Trends (by day)</h3>
          {sales.length
            ? (
              <>
                {renderTable(sales, ['date','qty'])}
                <button style={styles.button}onClick={() => exportToCSV(sales, `${userEmail}_Sales`)} >Export Sales CSV</button>
              </>
            )
            : <p>No sales data.</p>
          }
        </div>
      )}

      {tab === 'custom' && (
        <div>
          <h3>Custom View</h3>
          <p>Coming soon: add date‐range or product filters here.</p>
        </div>
      )}
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

export default OrderReport;
