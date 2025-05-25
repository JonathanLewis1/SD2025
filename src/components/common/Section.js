import React from 'react';

export default React.forwardRef(function Section({ children, styleProps = {} }, ref) {
  return (
    <section ref={ref} style={{ marginTop: 32, ...styleProps }}>
      {children}
    </section>
  );
});
