// src/components/Footer.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

export default function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => Linking.openURL('#')}>
          <Text style={styles.link}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('#')}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('#')}>
          <Text style={styles.link}>Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('#')}>
          <Text style={styles.link}>Contact</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity onPress={() => Linking.openURL('#')}>
          <Text style={styles.social}>🐦</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('#')}>
          <Text style={styles.social}>📘</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('#')}>
          <Text style={styles.social}>📸</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.brand}>Craft Nest</Text>
      <Text style={styles.copy}>© {new Date().getFullYear()} Craft Nest. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    marginTop: 'auto',
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  link: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#4b5563',
    textDecorationLine: 'underline',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  social: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  brand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  copy: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
