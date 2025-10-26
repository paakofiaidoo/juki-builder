import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AutocompleteInputProps {
  value: string;
  onChange: (newValue: string) => void;
  suggestions: string[];
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, suggestions }) => {
  const [inputValue, setInputValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputValue(text);
    onChange(text); // Propagate changes immediately

    const words = text.split(' ');
    const currentWord = words[words.length - 1];

    if (currentWord) {
      const newFiltered = suggestions.filter(s =>
        s.toLowerCase().startsWith(currentWord.toLowerCase())
      );
      setFilteredSuggestions(newFiltered);
      setIsDropdownVisible(newFiltered.length > 0);
      setActiveIndex(0);
    } else {
      setIsDropdownVisible(false);
    }
  };
  
  const handleSelect = useCallback((suggestion: string) => {
    const words = inputValue.split(' ');
    words[words.length - 1] = suggestion;
    const newValue = words.join(' ') + ' ';
    setInputValue(newValue);
    onChange(newValue);
    setIsDropdownVisible(false);
  }, [inputValue, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isDropdownVisible) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if(filteredSuggestions.length > 0) {
        e.preventDefault();
        handleSelect(filteredSuggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownVisible(false);
    }
  };

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <textarea
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={3}
        className="w-full p-2 text-xs bg-slate-700 border border-slate-600 rounded font-mono"
        placeholder="e.g., flex items-center"
      />
      {isDropdownVisible && (
        <ul className="autocomplete-dropdown">
          {filteredSuggestions.slice(0, 100).map((suggestion, index) => (
            <li
              key={suggestion}
              className={`autocomplete-item ${index === activeIndex ? 'autocomplete-item-active' : ''}`}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
