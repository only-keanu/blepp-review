import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
interface Option {
  value: string;
  label: string;
}
interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  searchable?: boolean;
  className?: string;
}
export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  searchable = false,
  className = ''
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = searchable ? options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase())) : options;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return <div className={`relative ${className}`} ref={containerRef}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>}
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`
          relative w-full cursor-default rounded-lg bg-white py-2.5 pl-3 pr-10 text-left border shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 sm:text-sm
          ${isOpen ? 'border-teal-500 ring-2 ring-teal-500' : 'border-slate-300'}
        `}>
        <span className={`block truncate ${!selectedOption ? 'text-slate-500' : 'text-slate-900'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </span>
      </button>

      {isOpen && <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {searchable && <div className="sticky top-0 z-10 bg-white px-2 py-1.5 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-slate-400" />
                <input type="text" className="w-full rounded-md border border-slate-300 py-1.5 pl-8 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
              </div>
            </div>}

          {filteredOptions.length === 0 ? <div className="relative cursor-default select-none py-2 px-4 text-slate-500">
              No options found.
            </div> : filteredOptions.map(option => <div key={option.value} className={`
                  relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-teal-50 hover:text-teal-900
                  ${value === option.value ? 'bg-teal-50 text-teal-900 font-medium' : 'text-slate-900'}
                `} onClick={() => {
        onChange(option.value);
        setIsOpen(false);
        setSearch('');
      }}>
                <span className="block truncate">{option.label}</span>
                {value === option.value && <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-teal-600">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>}
              </div>)}
        </div>}
    </div>;
}