import React from 'react';

export default function TextInput({
  as = 'input',
  styleProps = {},
  children,
  ...props
}) {
  const baseStyle = {
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 16,
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box',
    ...styleProps
  };

  if (as === 'textarea') {
    return <textarea style={{ ...baseStyle, minHeight: 80 }} {...props} />;
  }
  if (as === 'select') {
    return (
      <select style={baseStyle} {...props}>
        {children}
      </select>
    );
  }
  return <input style={baseStyle} {...props} />;
}
