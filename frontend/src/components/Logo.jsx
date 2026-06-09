import React from 'react';
import { BACKEND_URL } from '../config/config';

const Logo = ({ className = "h-8", src }) => {
  const defaultSrc = `${BACKEND_URL}/images/products/logo2.jpg`;
  return (
    <img 
      src={src || defaultSrc} 
      alt="Fashion Store Logo" 
      className={className} 
      style={{ objectFit: 'contain' }}
    />
  );
};

export default Logo;
