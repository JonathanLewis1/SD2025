import React from 'react';

export default function Button({ children, onClick, styleProps = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#3b82f6',
        color: '#fff',
        padding: '12px 16px',
        border: 'none',
        borderRadius: 12,
        fontWeight: 500,
        fontSize: 16,
        cursor: 'pointer',
        ...styleProps
      }}
    >
      {children}
    </button>
  );
}
