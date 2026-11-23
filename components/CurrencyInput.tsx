'use client';

import { useState } from 'react';

type CurrencyInputProps = {
  name: string;
  value?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  className?: string;
};

export default function CurrencyInput({
  name,
  value,
  onValueChange,
  required,
  className,
}: CurrencyInputProps) {
  const [internalValue, setInternalValue] = useState('');

  const currentValue = value !== undefined ? value : internalValue;

  const formattedValue = currentValue
    ? new Intl.NumberFormat('id-ID').format(Number(currentValue))
    : '';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');

    if (onValueChange) {
      onValueChange(digits);
    } else {
      setInternalValue(digits);
    }
  }

  return (
    <input
      name={name}
      type="text"
      inputMode="numeric"
      value={formattedValue}
      onChange={handleChange}
      required={required}
      placeholder="0"
      className={className}
    />
  );
}