
import { useState, useEffect } from 'react';

// Debounce: delays updating the value until the user stops typing for `delay` ms.
// Without this, every keystroke fires an API call — with 300ms delay,
// only fires after the user pauses. This is the "Debounced Search" requirement.
export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: if value changes before delay, clear the old timer
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
