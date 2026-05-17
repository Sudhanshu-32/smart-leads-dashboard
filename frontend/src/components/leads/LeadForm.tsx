
import React, { useState } from 'react';
import { CreateLeadDto, LeadStatus, LeadSource, Lead } from '../../types';
import { useCreateLead, useUpdateLead } from '../../hooks/useLeads';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface LeadFormProps {
  lead?: Lead; // If provided, we're in "edit" mode
  onSuccess: () => void;
}

type FormErrors = Partial<Record<keyof CreateLeadDto, string>>;

const LeadForm: React.FC<LeadFormProps> = ({ lead, onSuccess }) => {
  const isEditing = !!lead;

  const [form, setForm] = useState<CreateLeadDto>({
    name: lead?.name || '',
    email: lead?.email || '',
    status: lead?.status || 'New',
    source: lead?.source || 'Website',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const isPending = createLead.isPending || updateLead.isPending;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.source) newErrors.source = 'Source is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && lead) {
      await updateLead.mutateAsync({ id: lead._id, data: form });
    } else {
      await createLead.mutateAsync(form);
    }
    onSuccess();
  };

  const update = (field: keyof CreateLeadDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
  const sources: LeadSource[] = ['Website', 'Instagram', 'Referral'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        error={errors.name}
        placeholder="Rahul Sharma"
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        error={errors.email}
        placeholder="rahul@example.com"
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
        <select
          value={form.status}
          onChange={(e) => update('status', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Source</label>
        <select
          value={form.source}
          onChange={(e) => update('source', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.source && <p className="text-xs text-red-500">{errors.source}</p>}
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isPending} className="flex-1">
          {isEditing ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
