import React from 'react';

export default function Card({ children, styleProps = {}, ...props }) {
  return (
    <section
      {...props}
      style={{
        border: '1px solid #ccc',
        borderRadius: 10,
        padding: 16,
        backgroundColor: '#f9f9f9',
        ...styleProps
      }}
    >
      {children}
    </section>
  );
}
