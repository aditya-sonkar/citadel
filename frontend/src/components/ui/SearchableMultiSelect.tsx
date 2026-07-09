import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface SearchableMultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '-- Select options --',
  searchPlaceholder = 'Search...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id: string) => {
    const exists = value.includes(id);
    if (exists) {
      onChange(value.filter((val) => val !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOptions = options.filter((o) => value.includes(o.id));

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full min-h-[36px] px-3 py-1.5 flex items-center justify-between text-[13px] bg-white dark:bg-[#050505] border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors disabled:opacity-50 text-left select-none cursor-pointer"
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 pr-2">
          {selectedOptions.length === 0 ? (
            <span className="text-zinc-400 dark:text-zinc-500">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80"
              >
                <span className="max-w-[120px] truncate">{opt.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(opt.id);
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown size={14} className="text-zinc-400 dark:text-zinc-550 shrink-0 self-center" />
      </div>

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
            {value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[10px] text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 shrink-0"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Options list scroll container */}
          <div className="overflow-y-auto flex-1 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-[12px] text-zinc-500 text-center">
                No matches found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = value.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleToggle(option.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors text-zinc-750 dark:text-zinc-300 text-left"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-blue-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                    />
                    <span className={isChecked ? 'font-semibold text-zinc-900 dark:text-white' : ''}>
                      {option.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
