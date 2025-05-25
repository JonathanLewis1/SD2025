import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { exportToCSV } from './exportCSV';

import Container from '../../components/common/Container';
import Header from '../../components/common/Header';
import Section from '../../components/common/Section';
import TableWrapper from '../../components/common/TableWrapper';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';

export default function OrderReport({ userEmail }) {
  const [items, setItems] = useState([]);
  const [salesTrends, setSalesTrends] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [searchProduct, setSearchProduct] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  useEffect(() => {
    const fetchAndFlatten = async () => {
      if (!userEmail) return;
      const snap = await getDocs(
        query(collection(db, 'orders'), where('sellersEmails', 'array-contains', userEmail))
      );
      const all = [];
      snap.docs.forEach(d => {
        const o = d.data();
        const {
          products = [], quantity = [], Price = [], sellersEmails = [],
          DeliveryStatus: status, DeliveryType: type,
          StreetName: street, suburb, postalCode: postal,
          city, timestamp
        } = o;
        const tsISO = timestamp?.seconds
          ? new Date(timestamp.seconds * 1000).toISOString()
          : '';
        products.forEach((prod, i) => {
          if (sellersEmails[i] !== userEmail) return;
          const unit = Number(Price[i] || 0), qty = Number(quantity[i] || 0);
          all.push({
            ID: d.id,
            TIMESTAMP: tsISO.replace('T', ' ').slice(0, 19),
            PRODUCT: prod,
            UNITPRICE: unit,
            QUANTITY: qty,
            SUBTOTAL: unit * qty,
            DELIVERYSTATUS: status,
            DELIVERYTYPE: type,
            STREETNAME: street,
            POSTALCODE: postal,
            SUBURB: suburb,
            CITY: city
          });
        });
      });
      setItems(all);
    };
    fetchAndFlatten();
  }, [userEmail]);

  useEffect(() => {
    const byDay = {};
    items.forEach(it => {
      const day = it.TIMESTAMP.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + it.SUBTOTAL;
    });
    setSalesTrends(
      Object.entries(byDay)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
  }, [items]);

  const statuses = ['All', ...new Set(items.map(i => i.DELIVERYSTATUS))];
  const types = ['All', ...new Set(items.map(i => i.DELIVERYTYPE))];

  const filtered = items.filter(i => {
    if (filterStatus !== 'All' && i.DELIVERYSTATUS !== filterStatus) return false;
    if (filterType   !== 'All' && i.DELIVERYTYPE   !== filterType)   return false;
    if (searchProduct && !i.PRODUCT.toLowerCase().includes(searchProduct.toLowerCase())) return false;
    if (filterStart && i.TIMESTAMP.slice(0,10) < filterStart) return false;
    if (filterEnd   && i.TIMESTAMP.slice(0,10) > filterEnd)   return false;
    return true;
  });

  const renderTable = (data, columns) => (
    <TableWrapper>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ border: '1px solid #ccc', padding: 8, background: '#f0f0f0' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key} style={{ border: '1px solid #ccc', padding: 8 }}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  // Slim auto-width style
  const slim = { padding: '4px 8px', borderRadius: 4, fontSize: 14, width: 'auto' };

  return (
    <Container styleProps={{ maxWidth: 1000, margin: '0 auto' }}>
      <Header level={2}>Sales Trends</Header>
      {salesTrends.length > 0 ? (
        <>
          {renderTable(salesTrends, [
            { key: 'date',  label: 'Date' },
            { key: 'total', label: 'Total (R)' }
          ])}
          <Button onClick={() =>
            exportToCSV(
              salesTrends.map(r => ({ Date: r.date, Total: r.total })),
              `${userEmail}_SALES_TRENDS`
            )
          } styleProps={{ marginTop: 8 }}>
            Export CSV
          </Button>
        </>
      ) : (
        <p>No sales data yet.</p>
      )}

      <Header level={2} styleProps={{ marginTop: 55 }}>Custom View</Header>
      <Section styleProps={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        marginBottom: 16
      }}>
        <TextInput
          as="select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          styleProps={slim}
        >
          {statuses.map(s => <option key={s}>{s}</option>)}
        </TextInput>
        <TextInput
          as="select"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          styleProps={slim}
        >
          {types.map(t => <option key={t}>{t}</option>)}
        </TextInput>
        <TextInput
          placeholder="Search product..."
          value={searchProduct}
          onChange={e => setSearchProduct(e.target.value)}
          styleProps={{ ...slim, minWidth: 80 }}
        />
        <TextInput
          type="date"
          value={filterStart}
          onChange={e => setFilterStart(e.target.value)}
          styleProps={slim}
        />
        <TextInput
          type="date"
          value={filterEnd}
          onChange={e => setFilterEnd(e.target.value)}
          styleProps={slim}
        />
      </Section>

      {filtered.length > 0 ? (
        <>
          {renderTable(filtered, [
            { key: 'ID',         label: 'ID' },
            { key: 'TIMESTAMP',  label: 'Timestamp' },
            { key: 'PRODUCT',    label: 'Product' },
            { key: 'UNITPRICE',  label: 'UnitPrice (R)' },
            { key: 'QUANTITY',   label: 'Quantity' },
            { key: 'SUBTOTAL',   label: 'Subtotal (R)' },
            { key: 'DELIVERYSTATUS', label: 'DeliveryStatus' },
            { key: 'DELIVERYTYPE',   label: 'DeliveryType' },
            { key: 'STREETNAME', label: 'StreetName' },
            { key: 'POSTALCODE', label: 'PostalCode' },
            { key: 'SUBURB',     label: 'Suburb' },
            { key: 'CITY',       label: 'City' }
          ])}
          <Button onClick={() =>
            exportToCSV(
              filtered.map(i => ({
                ID: i.ID,
                Timestamp: i.TIMESTAMP,
                Product: i.PRODUCT,
                'UnitPrice (R)': i.UNITPRICE,
                Quantity: i.QUANTITY,
                'Subtotal (R)': i.SUBTOTAL,
                DeliveryStatus: i.DELIVERYSTATUS,
                DeliveryType: i.DELIVERYTYPE,
                StreetName: i.STREETNAME,
                PostalCode: i.POSTALCODE,
                Suburb: i.SUBURB,
                City: i.CITY
              })),
              `${userEmail}_CUSTOM_ORDERS`
            )
          } styleProps={{ marginTop: 8 }}>
            Export CSV
          </Button>
        </>
      ) : (
        <p>No matching items.</p>
      )}
    </Container>
  );
}

