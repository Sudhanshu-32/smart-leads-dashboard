
import React from 'react';
import { LeadStatus, LeadSource } from '../../types';

// Status badges: color-coded so users can scan the table at a glance
const statusColors: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Qualified: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Lost: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const sourceColors: Record<LeadSource, string> = {
  Website: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Instagram: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  Referral: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

interface StatusBadgeProps {
  status: LeadStatus;
}

interface SourceBadgeProps {
  source: LeadSource;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
    {status}
  </span>
);

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceColors[source]}`}>
    {source}
  </span>
);
