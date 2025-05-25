import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import Section from '../../components/common/Section';
import TableWrapper from '../../components/common/TableWrapper';

export default function BuyersOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const snap = await getDocs(
        query(collection(db, 'orders'), where('buyerEmail', '==', user.email))
      );
      const list = [];
      snap.docs.forEach(docSnap => {
        const o = docSnap.data();
        const iso = o.timestamp?.seconds
          ? new Date(o.timestamp.seconds * 1000).toISOString()
          : '';
        const [date, timeWithZ] = iso.split('T');
        const time = timeWithZ ? timeWithZ.slice(0, 8) : '';
        (o.products || []).forEach((prod, i) => {
          list.push({
            orderId: docSnap.id,
            date,
            time,
            product: prod,
            image: o.image?.[i] || '',
            unitPrice: Number(o.Price?.[i] || 0),
            quantity: Number(o.quantity?.[i] || 0),
            subtotal: Number(o.Price?.[i] || 0) * Number(o.quantity?.[i] || 0),
            status: o.DeliveryStatus,
            type: o.DeliveryType,
            street: o.StreetName,
            suburb: o.suburb,
            postal: o.postalCode,
            city: o.city
          });
        });
      });
      setOrders(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <Container>
        <Header level={1}>My Orders</Header>
        <p>Loading…</p>
      </Container>
    );
  }

  return (
    <Container>
      <Header level={1}>My Orders</Header>
      <Section>
        {orders.length === 0 ? (
          <p>You have no orders.</p>
        ) : (
          <TableWrapper>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    'Order ID', 'Date', 'Time',
                    'Product', 'Image',
                    'Unit Price (R)', 'Quantity', 'Subtotal (R)',
                    'Status', 'Type', 'Street', 'Suburb', 'Postal', 'City'
                  ].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={i}>
                    <td style={td}>{o.orderId}</td>
                    <td style={td}>{o.date}</td>
                    <td style={td}>{o.time}</td>
                    <td style={td}>{o.product}</td>
                    <td style={td}>
                      {o.image && <img src={o.image} alt="" width={50} />}
                    </td>
                    <td style={td}>{o.unitPrice.toFixed(2)}</td>
                    <td style={td}>{o.quantity}</td>
                    <td style={td}>{o.subtotal.toFixed(2)}</td>
                    <td style={td}>{o.status}</td>
                    <td style={td}>{o.type}</td>
                    <td style={td}>{o.street}</td>
                    <td style={td}>{o.suburb}</td>
                    <td style={td}>{o.postal}</td>
                    <td style={td}>{o.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        )}
      </Section>
    </Container>
  );
}

const th = { border: '1px solid #ccc', padding: 8, background: '#f0f0f0' };
const td = { border: '1px solid #ccc', padding: 8 };
