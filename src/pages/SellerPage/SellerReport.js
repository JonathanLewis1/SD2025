import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { exportToCSV } from './exportCSV';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import TableWrapper from '../../components/common/TableWrapper';
import Button from '../../components/common/Button';

export default function SellerReport({ userEmail }) {
  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    if (userEmail) fetchData();
  }, [userEmail]);

  const fetchData = async () => {
    const snap = await getDocs(
      query(collection(db, 'products'), where('email', '==', userEmail))
    );
    setInventoryData(snap.docs.map(d => d.data()));
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'stock', label: 'Quantity' },
    { key: 'price', label: 'Price (R)' },
    { key: 'description', label: 'Description' }
  ];

  return (
    <Container styleProps={{maxWidth: 1000, margin: '0 auto' }}>
      <Header level={2}>Inventory Status</Header>
      <TableWrapper>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ border: '1px solid #ccc', padding: 8, background: '#f0f0f0' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((p, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key} style={{ border: '1px solid #ccc', padding: 8 }}>
                    {p[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrapper>
      <Button
        onClick={() =>
          exportToCSV(
            inventoryData.map(p => ({
              Name: p.name,
              Quantity: p.stock,
              'Price (R)': p.price,
              Description: p.description
            })),
            `${userEmail}_INVENTORY`
          )
        }
        styleProps={{ marginTop: 8 }}
      >
        Export CSV
      </Button>
    </Container>
  );
}
