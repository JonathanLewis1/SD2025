import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  getDoc,
  doc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';


export default function Header() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const goHome = async () => {
      navigate('/home');
  };

  const viewProducts = async () => {
    const user = auth.currentUser;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
  
      const role = userDoc.data().role;

      if (role === 'seller') {
        navigate('/sellerpage')
      } else if (role === 'buyer') {
        alert("Only registered sellers may add products");
      }
  };

  const aboutUs = async () => {
    navigate('/about')
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Logo, Nav, Cart/Logout */}
      <View style={styles.topRow}>
      <img src="/craftnest_icon_192x192.png" alt="Logo" style={styles.logoImage} />

        <View style={styles.navButtons}>
          <TouchableOpacity onPress={goHome} style={styles.navButton}>
            <Text>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={viewProducts} style={styles.navButton}>
            <Text>My Products</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={aboutUs} style={styles.navButton}>
            <Text>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Text>Contact</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text>Cart 🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.actionButton}>
            <Text>Logout 🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
     <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search...\"
          style={styles.searchInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  navButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  logoImage: {
    height: 40,
    objectFit: 'contain',
  },
});

