import React from 'react';

export interface OptionsSliderProps {
  options: Record<string, any>; 
  value: any;
  onChange: (value: any) => void;
}

export const OptionsSlider: React.FC<OptionsSliderProps> = ({
  options,
  value,
  onChange,
}) => {
  const entries = Object.entries(options);

  return (
    <div style={{
      backgroundColor: '#18181b',
      borderRadius: '12px',
      padding: '6px',
      width: '250px',
      display: 'flex',
      flexDirection: 'column',
      // boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxSizing: 'border-box'
    }}>
      {entries.map(([label, optionValue], index) => {
        const isActive = value === optionValue;
        const isLast = index === entries.length - 1;
        const nextIsActive = index < entries.length - 1 && entries[index + 1][1] === value;
        const showDivider = !isLast && !isActive && !nextIsActive;

        return (
          <div key={optionValue} style={{ position: 'relative' }}>
            <button
              onClick={() => onChange(optionValue)}
              style={{
                width: '100%',
                padding: '10px 0',
                textAlign: 'center',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: isActive ? '#3b82f6' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(191, 219, 254, 0.6)',
                borderRadius: isActive ? '8px' : '0px',
                fontWeight: isActive ? '600' : '400',
                // boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {label}
            </button>
            
            {showDivider && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '16px',
                right: '16px',
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};