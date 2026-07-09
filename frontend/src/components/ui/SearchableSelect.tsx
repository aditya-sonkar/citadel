import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '-- Select option --',
  searchPlaceholder = 'Search...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="w-full h-[36px] px-3 flex items-center justify-between text-[13px] bg-white dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors disabled:opacity-50 text-left select-none"
      >
        <span className={selectedOption ? 'truncate' : 'text-zinc-400 dark:text-zinc-500'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={14} className="text-zinc-400 dark:text-zinc-550 shrink-0" />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl overflow-hidden animate-fade-in flex flex-col max-h-[220px]">
          {/* Search box inside popover */}
          <div className="p-2 border-b border-zinc-150 dark:border-zinc-800 flex items-center gap-2 shrink-0 bg-zinc-50 dark:bg-[#0e0e0e]">
            <Search size={12} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-[12px] text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-0 focus:border-none"
            />
          </div>

          {/* Options list scroll container */}
          <div className="overflow-y-auto flex-1 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-[12px] text-zinc-500 text-center">
                No matches found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[12px] hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors ${
                    value === option.id
                      ? 'bg-zinc-100 dark:bg-zinc-900 font-semibold text-zinc-900 dark:text-white'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
