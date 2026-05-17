import mongoose, { Schema, Document } from 'mongoose';
import { LeadStatus, LeadSource } from '../types';

export interface ILeadDocument extends Document {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Lost'],
      default: 'New',
    },
    source: {
      type: String,
      enum: ['Website', 'Instagram', 'Referral'],
      required: [true, 'Source is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Text index: enables MongoDB full-text search on name and email.
// Without this, search would require regex which is slow on large datasets.
// This is what powers: db.leads.find({ $text: { $search: "rahul" } })
LeadSchema.index({ name: 'text', email: 'text' });

// Compound index: speeds up filtered queries like status=Qualified&source=Instagram
LeadSchema.index({ status: 1, source: 1 });

export default mongoose.model<ILeadDocument>('Lead', LeadSchema);
