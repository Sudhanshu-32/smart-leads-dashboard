import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types';

// Document extends IUser with Mongoose-specific methods like .save(), .toJSON()
export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Creates a DB index automatically
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'sales'],
      default: 'sales',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// PRE-SAVE HOOK: Runs before every .save()
// KEY: We only re-hash if the password field was actually changed.
// Without the isModified check, every profile update would re-hash, breaking login.
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10); // Cost factor 10 = good security/speed balance
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare plain password against the hashed one stored in DB
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserDocument>('User', UserSchema);
