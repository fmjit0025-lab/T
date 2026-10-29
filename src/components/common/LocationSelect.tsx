import React from 'react';
import { Location } from '../../types';

interface LocationSelectProps {
  locations: Location[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  locations,
  value,
  onChange,
  required = false,
  placeholder = '-- Select Location --',
  className = '',
  allowCustom = true,
}) => {
  // Check if current value exists in locations
  const isCustom = Boolean(value) && !locations.some(l => l.code === value);

  return (
    <div className="relative">
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full text-xs bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300 focus:outline-blue-500 font-mono ${className}`}
      >
        <option value="">{placeholder}</option>
        {isCustom && (
          <option value={value}>
            {value} (Custom Location)
          </option>
        )}
        {locations
          .filter(l => l.isActive)
          .map((loc) => (
            <option key={loc.id} value={loc.code}>
              {loc.code} — {loc.name} {loc.zone ? `[${loc.zone}]` : ''}
            </option>
          ))}
      </select>
    </div>
  );
};
