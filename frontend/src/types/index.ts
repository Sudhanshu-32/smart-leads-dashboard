export type UserRole = "admin" | "sales";
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Instagram" | "Referral";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  meta: PaginationMeta;
}

export interface LeadFilters {
  status?: LeadStatus | "";
  source?: LeadSource | "";
  search?: string;
  sortBy?: "latest" | "oldest";
  page?: number;
}

export type CreateLeadDto = {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
};

export type UpdateLeadDto = Partial<CreateLeadDto>;
