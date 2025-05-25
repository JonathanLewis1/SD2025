import React from 'react';

export default function Container({ children, styleProps = {} }) {
  return (
    <section style={{ padding: 24, maxWidth: 1000, margin: '0 auto', ...styleProps }}>
      {children}
    </section>
  );
}