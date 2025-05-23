// SellerReport.js
import React, { useState, useEffect, forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { exportToCSV } from './exportCSV';

const SellerReport = forwardRef(({ userEmail }, ref) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userEmail) fetchInventoryData();
  }, [userEmail]);

  const fetchInventoryData = async () => {
    try {
      const getSellerProducts = httpsCallable(functions, 'getSellerProducts');
      const response = await getSellerProducts({ email: userEmail });
      setInventoryData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
      setError('Failed to fetch inventory data');
    }
  };

  const renderTable = (data, headers) => (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        {headers.map(h => (
          <Text key={h} style={styles.headerCell}>{h}</Text>
        ))}
      </View>
      {data.map((row, i) => (
        <View key={i} style={styles.tableRow}>
          {headers.map(h => (
            <Text key={h} style={styles.cell}>{row[h]}</Text>
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
    <View ref={ref} style={styles.container}>
      <Text style={styles.heading}>Dashboard Reports</Text>
      <Text style={styles.subheading}>Inventory Status</Text>
      {renderTable(
        inventoryData.map(p => ({
          name: p.name,
          quantity: p.stock,
          price: p.price,
          description: p.description
        })),
        ['name', 'quantity', 'price', 'description']
      )}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => exportToCSV(
          inventoryData.map(p => ({
            name: p.name,
            quantity: p.stock,
            price: p.price,
            description: p.description,
            imageUrl: p.image
          })),
          `${userEmail}_Inventory`
        )}
      >
        <Text style={styles.buttonText}>Export as CSV</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#feffdf',
    padding: 32,
    alignItems: 'center',
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
  tableContainer: {
    width: '100%',
    marginBottom: 20,
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
  button: {
    backgroundColor: '#f97316',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginTop: 32,
    textAlign: 'center',
  }
});

export default SellerReport;
