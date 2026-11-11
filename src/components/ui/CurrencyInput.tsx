import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters.js';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'R$ 0,00',
  required = false,
  autoFocus = false,
  className = ''
}) => {
  // Store raw cents string internally for seamless typing
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return value ? formatCurrency(value) : '';
  });

  useEffect(() => {
    setDisplayValue(value ? formatCurrency(value) : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const centsNumber = parseInt(rawDigits, 10);
    const amount = centsNumber / 100;
    setDisplayValue(formatCurrency(amount));
    onChange(amount);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-4 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-lg font-bold font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
        />
      </div>
    </div>
  );
};
