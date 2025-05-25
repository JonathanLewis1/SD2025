
// // src/components/Footer.js
// import React from 'react';
// import { Link } from 'react-router-dom';

// export default function Footer() {
//   const year = new Date().getFullYear();

//   return (
//     <div style={styles.footer}>
//       <div style={styles.linksRow}>
//         <Link to="/about" style={styles.link}>About</Link>
//         <Link to="/privacy-policy" style={styles.link}>Privacy Policy</Link>
//         <Link to="#" style={styles.link}>Terms</Link>
//         <Link to="/contact-admin" style={styles.link}>Contact</Link>
//       </div>

//       <div style={styles.socialRow}>
//         <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.social}>🐦</a>
//         <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.social}>📘</a>
//         <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.social}>📸</a>
//       </div>

//       <p style={styles.brand}>Craft Nest</p>
//       <p style={styles.copy}>© {year} Craft Nest. All rights reserved.</p>
//     </div>
//   );
// }

// const styles = {
//   footer: {
//     width: '100%',
//     padding: '24px 16px',
//     backgroundColor: '#000',
//     color: '#fff',
//     textAlign: 'center',
//     marginTop: 'auto',
//   },
//   linksRow: {
//     display: 'flex',
//     justifyContent: 'center',
//     gap: '20px',
//     marginBottom: '12px',
//     flexWrap: 'wrap',
//   },
//   link: {
//     color: '#9ca3af',
//     textDecoration: 'underline',
//     fontSize: '14px',
//   },
//   socialRow: {
//     display: 'flex',
//     justifyContent: 'center',
//     gap: '12px',
//     marginBottom: '12px',
//   },
//   social: {
//     fontSize: '20px',
//     textDecoration: 'none',
//     color: '#fff',
//   },
//   brand: {
//     fontSize: '16px',
//     fontWeight: 'bold',
//   },
//   copy: {
//     fontSize: '12px',
//     color: '#9ca3af',
//   },
// };
// src/components/common/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';
import Section from './common/Section';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Section
      as="footer"
      styleProps={{
        width: '100%',
        backgroundColor: '#000',
        color: '#fff',
        padding: '24px 16px',
      }}
    >
      {/* links row */}
      <Section
        as="nav"
        styleProps={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <Link to="/home"    style={styles.link}>Home</Link>
        <Link to="/about"    style={styles.link}>About</Link>
        <Link to="/contact-admin" style={styles.link}>Contact</Link>
      </Section>

      {/* branding */}
      <Section
        styleProps={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <p style={styles.brand}>Craft Nest</p>
        <p style={styles.copy}>© {year} Craft Nest. All rights reserved.</p>
      </Section>
    </Section>
  );
}

const styles = {
  link: {
    color: '#9ca3af',
    textDecoration: 'underline',
    fontSize: '14px',
  },
  brand: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
  },
  copy: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
};
