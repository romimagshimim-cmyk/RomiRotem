import React from 'react';

interface SpaceProps {
  h?: string | number;
  w?: string | number;
  display?: 'block' | 'inline-block';
}

export const Space: React.FC<SpaceProps> = ({ h, w, display = 'block' }) => {
  return (
    <div 
      style={{ 
        height: h, 
        width: w, 
        display: display 
      }} 
      aria-hidden="true"
    />
  );
};