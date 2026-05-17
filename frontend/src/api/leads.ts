
import api from './axios';
import { Lead, LeadFilters, LeadsResponse, CreateLeadDto, UpdateLeadDto } from '../types';

export const leadsApi = {
  // Builds query string from the filters object — only includes defined values
  getLeads: async (filters: LeadFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', String(filters.page));

    const res = await api.get<LeadsResponse>(`/leads?${params}`);
    return res.data;
  },

  getLead: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Lead }>(`/leads/${id}`);
    return res.data;
  },

  createLead: async (data: CreateLeadDto) => {
    const res = await api.post<{ success: boolean; data: Lead }>('/leads', data);
    return res.data;
  },

  updateLead: async (id: string, data: UpdateLeadDto) => {
    const res = await api.put<{ success: boolean; data: Lead }>(`/leads/${id}`, data);
    return res.data;
  },

  deleteLead: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/leads/${id}`);
    return res.data;
  },

  // CSV export: using window.location tricks browser to download the file
 exportCSV: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/leads/export/csv', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
