
import React from 'react';
import { LeadFilters, LeadStatus, LeadSource } from '../../types';
import Input from '../ui/Input';

interface LeadFiltersProps {
  filters: LeadFilters;
  searchValue: string; // The raw (not debounced) search value for immediate UI update
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
}

// This component only manages the UI — the parent controls actual state.
// Why? So the parent can debounce search before sending it to the API.
const LeadFiltersComponent: React.FC<LeadFiltersProps> = ({
  filters,
  searchValue,
  onSearchChange,
  onFilterChange,
}) => {
  const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
  const sources: LeadSource[] = ['Website', 'Instagram', 'Referral'];

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* Search — updates immediately in UI, API call is debounced in parent */}
      <div className="flex-1 min-w-48">
        <Input
          placeholder="Search by name or email..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => onFilterChange({ status: e.target.value as LeadStatus | '' })}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Source filter */}
      <select
        value={filters.source || ''}
        onChange={(e) => onFilterChange({ source: e.target.value as LeadSource | '' })}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Sources</option>
        {sources.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Sort */}
      <select
        value={filters.sortBy || 'latest'}
        onChange={(e) => onFilterChange({ sortBy: e.target.value as 'latest' | 'oldest' })}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="latest">Latest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>
  );
};

export default LeadFiltersComponent;
