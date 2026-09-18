import React from 'react';

export function BrandLogo({ className = '', alt = '', ...props }) {
  return <img src="/automatex-logo.svg" alt={alt} className={className} {...props} />;
}

export default BrandLogo;
