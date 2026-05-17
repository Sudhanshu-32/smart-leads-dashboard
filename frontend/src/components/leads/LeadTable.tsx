
import React from 'react';
import { Lead } from '../../types';
import { StatusBadge, SourceBadge } from '../ui/Badge';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onEdit, onDelete }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Name</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Email</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Source</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Created</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {leads.map((lead) => (
            <tr
              key={lead._id}
              className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{lead.name}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{lead.email}</td>
              <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
              <td className="px-4 py-3"><SourceBadge source={lead.source} /></td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onEdit(lead)}>
                    Edit
                  </Button>
                  {/* Delete is only shown to admins — RBAC on the frontend */}
                  {isAdmin && (
                    <Button size="sm" variant="danger" onClick={() => onDelete(lead._id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
