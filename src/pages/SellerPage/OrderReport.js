// OrderReport.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
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
      const getSellerOrders = httpsCallable(functions, 'getSellerOrders');
      const response = await getSellerOrders({ email: userEmail });
      const items = [];
      const daily = {};

      response.data.forEach(order => {
        const { products, quantity, Price, sellersEmails, timestamp, DeliveryStatus } = order;
        sellersEmails.forEach((email, i) => {
          if (email === userEmail) {
            const orderItem = {
              id: `${order.id}-${i}`,
              product: order.productNames?.[i] || products[i],
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
      setError('Unable to load orders. Please try again later.');
    }
  };

  const applyFilter = status => {
    setStatusFilter(status);
    setFiltered(status === 'All' ? orders : orders.filter(o => o.status === status));
  };

  const renderCards = items => (
    <View style={styles.cardsContainer}>
      {items.map(o => (
        <View key={o.id} style={styles.card}>
          <Text style={styles.cardTitle}>{o.product}</Text>
          <Text style={styles.cardText}><Text style={styles.bold}>Qty:</Text> {o.quantity}</Text>
          <Text style={styles.cardText}><Text style={styles.bold}>Price:</Text> R{o.price}</Text>
          <Text style={styles.cardText}><Text style={styles.bold}>Status:</Text> {o.status}</Text>
          <Text style={styles.cardText}><Text style={styles.bold}>Date:</Text> {o.date}</Text>
        </View>
      ))}
    </View>
  );

  const renderTable = (data, cols) => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        {cols.map(c => (
          <Text key={c} style={styles.headerCell}>{c}</Text>
        ))}
      </View>
      {data.map((row, i) => (
        <View key={i} style={styles.tableRow}>
          {cols.map(c => (
            <Text key={c} style={styles.cell}>{row[c.toLowerCase()] ?? row[c]}</Text>
          ))}
        </View>
      ))}
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Seller Orders Report</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'orders' && styles.activeTab]}
          onPress={() => setTab('orders')}
        >
          <Text style={styles.tabButtonText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'sales' && styles.activeTab]}
          onPress={() => setTab('sales')}
        >
          <Text style={styles.tabButtonText}>Sales Trends</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, tab === 'custom' && styles.activeTab]}
          onPress={() => setTab('custom')}
        >
          <Text style={styles.tabButtonText}>Custom View</Text>
        </TouchableOpacity>
      </View>

      {tab === 'orders' && (
        <View>
          <View style={styles.filterContainer}>
            {['All', 'Pending', 'Delivered', 'Cancelled'].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.filterButton, statusFilter === s && styles.activeFilter]}
                onPress={() => applyFilter(s)}
              >
                <Text style={styles.filterButtonText}>{s}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => exportToCSV(filtered, `${userEmail}_Orders`)}
            >
              <Text style={styles.exportButtonText}>Export Orders CSV</Text>
            </TouchableOpacity>
          </View>
          {filtered.length ? renderCards(filtered) : <Text style={styles.noData}>No orders to display.</Text>}
        </View>
      )}

      {tab === 'sales' && (
        <View>
          <Text style={styles.subheading}>Sales Trends (by day)</Text>
          {sales.length ? (
            <>
              {renderTable(sales, ['date', 'qty'])}
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => exportToCSV(sales, `${userEmail}_Sales`)}
              >
                <Text style={styles.exportButtonText}>Export Sales CSV</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noData}>No sales data.</Text>
          )}
        </View>
      )}

      {tab === 'custom' && (
        <View>
          <Text style={styles.subheading}>Custom View</Text>
          <Text style={styles.noData}>Coming soon: add date‐range or product filters here.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#feffdf',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#3b82f6',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
  },
  tabButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    color: '#333',
  },
  exportButton: {
    backgroundColor: '#f97316',
    padding: 8,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  exportButtonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    width: '45%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  tableContainer: {
    width: '100%',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    padding: 10,
    fontWeight: '600',
    textAlign: 'left',
  },
  cell: {
    flex: 1,
    padding: 10,
    textAlign: 'left',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 32,
  },
});

export default OrderReport;
