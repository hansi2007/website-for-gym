export type MembershipStatus = 'active' | 'expiring' | 'expired' | 'inactive';
export type PlanCategory = 'monthly' | 'quarterly' | 'half-yearly' | 'annual' | 'personal-training' | 'couple';
export type EnquiryStatus = 'New' | 'Contacted' | 'Trial Booked' | 'Completed' | 'Closed';
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
export type PaymentStatus = 'Verified' | 'Pending' | 'Failed';

export interface GymSettings {
  id?: string;
  businessName: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  googleMapsUrl: string;
  openingHours: string;
  ratingSnapshot: number;
  reviewCountSnapshot: number;
  is24x7Confirmed: boolean;
  announcement?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  updatedAt?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  category: PlanCategory;
  benefits: string[];
  terms?: string;
  isPublished: boolean;
  isPopular?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Member {
  id: string;
  memberId: string; // e.g. SMP-101
  name: string;
  phone: string;
  email?: string;
  joinDate: string;
  status: MembershipStatus;
  currentPlanId?: string;
  currentPlanName?: string;
  currentStartDate?: string;
  currentExpiryDate?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Membership {
  id: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  price: number;
  startDate: string;
  expiryDate: string;
  status: MembershipStatus | 'renewed';
  isPaid: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  dateKey: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss or ISO
  checkOutTime?: string;
  notes?: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  preferredDate?: string;
  preferredTime?: string;
  fitnessGoal?: string;
  message?: string;
  status: EnquiryStatus;
  internalNotes?: string;
  source: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  membershipId?: string;
  planName?: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  verifiedBy: string;
  notes?: string;
  createdAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  role: string;
  specialization: string;
  qualifications: string;
  experience: string;
  bio: string;
  imageUrl: string;
  isAvailable: boolean;
  displayOrder: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'interior' | 'equipment' | 'workout' | 'training' | 'atmosphere';
  imageUrl: string;
  description: string;
  displayOrder: number;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  performedByEmail: string;
  timestamp: string;
}

export type JoiningRequestStatus = 'pending' | 'contacted' | 'approved' | 'enrolled' | 'rejected';

export interface GymJoiningRequest {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: string | null;
  selected_membership_plan: string;
  fitness_goal?: string | null;
  preferred_start_date: string;
  preferred_end_date?: string | null;
  message?: string | null;
  status: JoiningRequestStatus | string;
  created_at: string;
}
