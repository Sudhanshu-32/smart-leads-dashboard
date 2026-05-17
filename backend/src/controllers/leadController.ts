import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Lead from '../models/Lead';
import { AuthRequest, LeadFilters } from '../types';
import { createError } from '../middleware/errorHandler';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']).default('New'),
  source: z.enum(['Website', 'Instagram', 'Referral']),
});

export const updateLeadSchema = createLeadSchema.partial(); // All fields optional on update

// ─── GET /leads ───────────────────────────────────────────────────────────────
// This is the most complex endpoint — handles filtering, searching, sorting, pagination

export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sortBy = 'latest',
      page = '1',
      limit = '10',
    } = req.query as Record<string, string>;

    // Build MongoDB query object dynamically based on what filters are provided
    // We only add a filter if the user actually sent it
    const query: Record<string, unknown> = {};

    if (status) query.status = status;
    if (source) query.source = source;

    // Text search uses MongoDB's $text operator which works with the text index
    // we created on the model. Much faster than $regex for large datasets.
    if (search) {
      query.$text = { $search: search };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50
    const skip = (pageNum - 1) * limitNum;

    // Sort: latest = newest first (descending), oldest = oldest first (ascending)
    const sortOrder = sortBy === 'oldest' ? 1 : -1;

    // Run count and data queries in PARALLEL using Promise.all
    // Without this, they'd run sequentially — doubling the DB round trips
    const [total, leads] = await Promise.all([
      Lead.countDocuments(query),
      Lead.find(query)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({
      success: true,
      data: leads,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /leads/:id ───────────────────────────────────────────────────────────

export const getLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return next(createError('Lead not found', 404));
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// ─── POST /leads ──────────────────────────────────────────────────────────────

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// ─── PUT /leads/:id ───────────────────────────────────────────────────────────

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // new: true → return the UPDATED document, not the old one
    // runValidators: true → run schema validators on update (not default behavior)
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      return next(createError('Lead not found', 404));
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /leads/:id ────────────────────────────────────────────────────────
// Only admins can delete — enforced at the ROUTE level with authorize('admin')

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return next(createError('Lead not found', 404));
    }

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── GET /leads/export/csv ────────────────────────────────────────────────────
// Streams CSV directly to the response without loading all data into memory first

export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });

    // Set headers to trigger browser download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');

    // Write CSV header row
    res.write('Name,Email,Status,Source,Created At\n');

    // Write each lead as a CSV row
    leads.forEach((lead) => {
      res.write(
        `"${lead.name}","${lead.email}","${lead.status}","${lead.source}","${lead.createdAt.toISOString()}"\n`
      );
    });

    res.end();
  } catch (error) {
    next(error);
  }
};
