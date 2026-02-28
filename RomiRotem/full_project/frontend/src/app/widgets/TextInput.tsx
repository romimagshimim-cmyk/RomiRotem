import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, id, type = 'text', className = '', ...props }, ref) => {
    
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '1rem' }}>
        {label && (
          <label htmlFor={inputId} style={{ fontWeight: 600, fontSize: '14px' }}>
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            borderRadius: '4px',
            border: `1px solid ${error ? 'red' : '#ccc'}`,
            outline: 'none',
          }}
          {...props}
        />

        {error && (
          <span style={{ color: 'red', fontSize: '12px' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';