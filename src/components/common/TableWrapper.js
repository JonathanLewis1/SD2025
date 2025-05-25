import React from 'react';

export default function TableWrapper({ children }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      {children}
    </div>
  );
}