
import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLeads, useDeleteLead } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import { LeadFilters, Lead } from '../types';
import { leadsApi } from '../api/leads';
import LeadTable from '../components/leads/LeadTable';
import LeadFiltersComponent from '../components/leads/LeadFilters';
import Pagination from '../components/leads/Pagination';
import LeadForm from '../components/leads/LeadForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';


const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const deleteLead = useDeleteLead();

  // Dark mode toggle — persisted via a class on <html>
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark((prev) => !prev);
  };

  // Separate raw search (for immediate input feedback) from debounced search (for API)
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  const [filters, setFilters] = useState<LeadFilters>({ page: 1, sortBy: 'latest' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();

  // Build the actual query with debounced search merged in
  const queryFilters: LeadFilters = {
    ...filters,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, isError } = useLeads(queryFilters);

  const handleFilterChange = (newFilters: Partial<LeadFilters>) => {
    // Reset to page 1 when filters change — avoid landing on an empty page
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    await deleteLead.mutateAsync(id);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLead(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Smart Leads
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Top bar: title + actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h2>
            {data?.meta && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {data.meta.total} total leads
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => leadsApi.exportCSV()}>
              Export CSV
            </Button>
            <Button onClick={() => { setEditingLead(undefined); setIsModalOpen(true); }}>
              + Add Lead
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <LeadFiltersComponent
            filters={filters}
            searchValue={searchValue}
            onSearchChange={(v) => { setSearchValue(v); setFilters((p) => ({ ...p, page: 1 })); }}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Table states */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400">Failed to load leads. Please try again.</p>
          </div>
        )}

        {!isLoading && !isError && data?.data.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No leads found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Try adjusting your filters or add a new lead
            </p>
          </div>
        )}

        {!isLoading && !isError && data && data.data.length > 0 && (
          <>
            <LeadTable leads={data.data} onEdit={handleEdit} onDelete={handleDelete} />
            <Pagination
              meta={data.meta}
              onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
            />
          </>
        )}
      </main>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingLead ? 'Edit Lead' : 'New Lead'}
      >
        <LeadForm lead={editingLead} onSuccess={handleModalClose} />
      </Modal>
    </div>
  );
};

export default DashboardPage;
