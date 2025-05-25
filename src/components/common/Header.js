import React from 'react';

export default function Header({ level = 1, children, styleProps = {} }) {
  const Tag = `h${level}`;
  const sizes = { 1: '2rem', 2: '1.5rem', 3: '1.25rem' };
  return (
    <Tag style={{ fontSize: sizes[level] || '1rem', margin: '1rem 0', ...styleProps }}>
      {children}
    </Tag>
  );
}
