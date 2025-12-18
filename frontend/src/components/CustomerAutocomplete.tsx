import React, { useState, useEffect, useMemo } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import type { Customer } from '../types';
import { CustomerService } from '../services/customerService';

interface CustomerAutocompleteProps {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  fullWidth?: boolean;
  className?: string;
  id?: string;
}

export function CustomerAutocomplete({
  value,
  onChange,
  label = 'Customer',
  placeholder = 'Select or type to search customer',
  required = false,
  disabled = false,
  error = false,
  helperText,
  variant = 'outlined',
  fullWidth = true,
  className,
  id,
}: CustomerAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Load initial customers
  useEffect(() => {
    loadInitialCustomers();
  }, []);

  const loadInitialCustomers = async () => {
    try {
      setLoadingInitial(true);
      const customers = await CustomerService.getCustomersForAutocomplete();
      setOptions(customers);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoadingInitial(false);
    }
  };

  // Debounced search function
  const searchCustomers = useMemo(() => {
    return async (searchTerm: string) => {
      if (searchTerm.trim().length < 2) {
        // If search term is too short, show initial customers
        if (options.length === 0) {
          await loadInitialCustomers();
        }
        return;
      }

      try {
        setLoading(true);
        const customers = await CustomerService.getCustomersForAutocomplete(searchTerm);
        setOptions(customers);
      } catch (error) {
        console.error('Error searching customers:', error);
      } finally {
        setLoading(false);
      }
    };
  }, [options.length]);

  // Handle input change with debouncing
  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for search
    const timeout = setTimeout(() => {
      searchCustomers(newInputValue);
    }, 300); // 300ms delay

    setSearchTimeout(timeout);
  };

  // Handle selection change
  const handleValueChange = (_event: React.SyntheticEvent, newValue: Customer | null) => {
    onChange(newValue);
  };

  // Get display text for selected value
  const getOptionLabel = (option: Customer) => {
    return `${option.name}${option.phone ? ` (${option.phone})` : ''}`;
  };

  // Custom option rendering
  const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: Customer) => {
    return (
      <li key={option.id} {...props}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500 }}>{option.name}</span>
          {option.phone && (
            <span style={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              📞 {option.phone}
            </span>
          )}
          {option.address && (
            <span style={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              📍 {option.address.length > 50 ? `${option.address.substring(0, 50)}...` : option.address}
            </span>
          )}
        </div>
      </li>
    );
  };

  // Auto-select if only one option matches
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const matchingOptions = options.filter(option => 
        option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        (option.phone && option.phone.includes(inputValue))
      );
      
      if (matchingOptions.length === 1) {
        onChange(matchingOptions[0]);
      }
    }
  };

  return (
    <Autocomplete
      id={id || 'customer-autocomplete'}
      value={value}
      onChange={handleValueChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      loading={loading || loadingInitial}
      disabled={disabled}
      fullWidth={fullWidth}
      className={className}
      onKeyDown={handleKeyDown}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          error={error}
          helperText={helperText || (loadingInitial ? 'Loading customers...' : `${options.length} customers available - Type to search`)}
          variant={variant}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {(loading || loadingInitial) && (
                  <CircularProgress color="inherit" size={20} />
                )}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      filterOptions={(x) => x} // Let server handle filtering
      isOptionEqualToValue={(option, value) => option.id === value.id}
      noOptionsText={
        loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CircularProgress size={20} />
            Searching...
          </div>
        ) : (
          inputValue.length < 2 
            ? 'Type at least 2 characters to search' 
            : 'No customers found'
        )
      }
    />
  );
}

export default CustomerAutocomplete;