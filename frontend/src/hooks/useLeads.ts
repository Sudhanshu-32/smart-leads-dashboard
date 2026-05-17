
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/leads';
import { LeadFilters, CreateLeadDto, UpdateLeadDto } from '../types';
import toast from 'react-hot-toast';

// React Query manages server state (data from APIs):
// - caches results so re-visiting a page doesn't re-fetch needlessly
// - shows loading/error states automatically
// - refetches when the window regains focus (keeps data fresh)

// Query key factory: arrays that uniquely identify each query.
// When filters change, the key changes, triggering a new fetch.
const leadKeys = {
  all: ['leads'] as const,
  list: (filters: LeadFilters) => ['leads', 'list', filters] as const,
  detail: (id: string) => ['leads', 'detail', id] as const,
};

export const useLeads = (filters: LeadFilters) => {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => leadsApi.getLeads(filters),
    staleTime: 30_000, // Consider data fresh for 30s before background refetch
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.getLead(id),
    enabled: !!id, // Don't fetch if id is empty
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadDto) => leadsApi.createLead(data),
    onSuccess: () => {
      // Invalidate all leads queries → forces a refetch so the new lead appears
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create lead');
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadDto }) =>
      leadsApi.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      toast.success('Lead deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    },
  });
};
