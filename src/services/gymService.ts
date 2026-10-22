import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, DEFAULT_BUSINESS_SETTINGS } from '../lib/firebase';
import {
  GymSettings,
  MembershipPlan,
  Member,
  Membership,
  Attendance,
  Enquiry,
  PaymentRecord,
  Trainer,
  GalleryItem,
  AuditLog,
} from '../types';

// GYM SETTINGS
export async function getGymSettings(): Promise<GymSettings> {
  const path = 'gymSettings/general';
  try {
    const snap = await getDoc(doc(db, 'gymSettings', 'general'));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as GymSettings;
    }
    // Return default settings
    return DEFAULT_BUSINESS_SETTINGS;
  } catch (error) {
    console.warn('Could not fetch settings from Firestore, using defaults:', error);
    return DEFAULT_BUSINESS_SETTINGS;
  }
}

export async function saveGymSettings(settings: Partial<GymSettings>): Promise<void> {
  const path = 'gymSettings/general';
  try {
    await setDoc(doc(db, 'gymSettings', 'general'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// MEMBERSHIP PLANS
export async function getPublishedPlans(): Promise<MembershipPlan[]> {
  const path = 'membershipPlans';
  try {
    const q = query(collection(db, path), where('isPublished', '==', true));
    const snap = await getDocs(q);
    const plans: MembershipPlan[] = [];
    snap.forEach((d) => plans.push({ id: d.id, ...d.data() } as MembershipPlan));
    return plans.sort((a, b) => a.durationMonths - b.durationMonths);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function getAllPlans(): Promise<MembershipPlan[]> {
  const path = 'membershipPlans';
  try {
    const snap = await getDocs(collection(db, path));
    const plans: MembershipPlan[] = [];
    snap.forEach((d) => plans.push({ id: d.id, ...d.data() } as MembershipPlan));
    return plans.sort((a, b) => a.durationMonths - b.durationMonths);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function savePlan(plan: Partial<MembershipPlan>): Promise<string> {
  const path = 'membershipPlans';
  try {
    const now = new Date().toISOString();
    if (plan.id) {
      const planDoc = doc(db, path, plan.id);
      await updateDoc(planDoc, {
        ...plan,
        updatedAt: now,
      });
      return plan.id;
    } else {
      const newDoc = await addDoc(collection(db, path), {
        ...plan,
        createdAt: now,
        updatedAt: now,
      });
      return newDoc.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deletePlan(planId: string): Promise<void> {
  const path = `membershipPlans/${planId}`;
  try {
    await deleteDoc(doc(db, 'membershipPlans', planId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// MEMBERS
export async function getMembers(): Promise<Member[]> {
  const path = 'members';
  try {
    const snap = await getDocs(collection(db, path));
    const list: Member[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Member));
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveMember(member: Partial<Member>): Promise<string> {
  const path = 'members';
  try {
    const now = new Date().toISOString();
    if (member.id) {
      await updateDoc(doc(db, path, member.id), {
        ...member,
        updatedAt: now,
      });
      return member.id;
    } else {
      const newDoc = await addDoc(collection(db, path), {
        ...member,
        createdAt: now,
        updatedAt: now,
      });
      return newDoc.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteMember(memberId: string): Promise<void> {
  const path = `members/${memberId}`;
  try {
    await deleteDoc(doc(db, 'members', memberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// MEMBERSHIPS / SUBSCRIPTIONS
export async function getMemberships(): Promise<Membership[]> {
  const path = 'memberships';
  try {
    const snap = await getDocs(collection(db, path));
    const list: Membership[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Membership));
    return list.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveMembership(membership: Partial<Membership>): Promise<string> {
  const path = 'memberships';
  try {
    const now = new Date().toISOString();
    if (membership.id) {
      await updateDoc(doc(db, path, membership.id), {
        ...membership,
        updatedAt: now,
      });
      return membership.id;
    } else {
      const newDoc = await addDoc(collection(db, path), {
        ...membership,
        createdAt: now,
        updatedAt: now,
      });
      return newDoc.id;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// ATTENDANCE
export async function getAttendanceLogs(dateKey?: string): Promise<Attendance[]> {
  const path = 'attendance';
  try {
    let q;
    if (dateKey) {
      q = query(collection(db, path), where('dateKey', '==', dateKey));
    } else {
      q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(150));
    }
    const snap = await getDocs(q);
    const list: Attendance[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Attendance));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function checkInMember(memberId: string, memberName: string): Promise<{ success: boolean; message: string; record?: Attendance }> {
  const path = 'attendance';
  const todayKey = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });

  try {
    // Duplicate check prevention: check if member is already checked in today
    const q = query(
      collection(db, path),
      where('memberId', '==', memberId),
      where('dateKey', '==', todayKey)
    );
    const existingSnap = await getDocs(q);
    if (!existingSnap.empty) {
      return { success: false, message: `Member ${memberName} is already checked in for today (${todayKey}).` };
    }

    const newRecord: Omit<Attendance, 'id'> = {
      memberId,
      memberName,
      dateKey: todayKey,
      checkInTime: nowTime,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, path), newRecord);
    return {
      success: true,
      message: `Check-in recorded for ${memberName} at ${nowTime}`,
      record: { id: docRef.id, ...newRecord },
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function checkOutMember(attendanceId: string): Promise<void> {
  const path = `attendance/${attendanceId}`;
  const nowTime = new Date().toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit' });
  try {
    await updateDoc(doc(db, 'attendance', attendanceId), {
      checkOutTime: nowTime,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ENQUIRIES / TRIAL BOOKINGS
export async function submitPublicEnquiry(data: {
  fullName: string;
  phone: string;
  email?: string;
  preferredDate?: string;
  preferredTime?: string;
  fitnessGoal?: string;
  message?: string;
  source?: string;
}): Promise<string> {
  const path = 'enquiries';
  // Client-side sanitization and validation adhering to firestore.rules
  const cleanName = (data.fullName || '').trim();
  const cleanPhone = (data.phone || '').trim().replace(/\s+/g, '');

  if (cleanName.length < 2 || cleanName.length > 100) {
    throw new Error('Please enter a valid full name between 2 and 100 characters.');
  }
  if (cleanPhone.length < 7 || cleanPhone.length > 20) {
    throw new Error('Please enter a valid phone number (minimum 7 digits).');
  }

  const payload: Record<string, string> = {
    fullName: cleanName,
    phone: cleanPhone,
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  if (data.email?.trim()) payload.email = data.email.trim();
  if (data.preferredDate?.trim()) payload.preferredDate = data.preferredDate.trim();
  if (data.preferredTime?.trim()) payload.preferredTime = data.preferredTime.trim();
  if (data.fitnessGoal?.trim()) payload.fitnessGoal = data.fitnessGoal.trim();
  if (data.message?.trim()) payload.message = data.message.trim();
  if (data.source?.trim()) payload.source = data.source.trim();

  try {
    const docRef = await addDoc(collection(db, path), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const path = 'enquiries';
  try {
    const snap = await getDocs(collection(db, path));
    const list: Enquiry[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Enquiry));
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function updateEnquiryStatus(
  enquiryId: string,
  status: Enquiry['status'],
  internalNotes?: string
): Promise<void> {
  const path = `enquiries/${enquiryId}`;
  try {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes;
    }
    await updateDoc(doc(db, 'enquiries', enquiryId), updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// PAYMENT RECORDS
export async function getPaymentRecords(): Promise<PaymentRecord[]> {
  const path = 'paymentRecords';
  try {
    const snap = await getDocs(collection(db, path));
    const list: PaymentRecord[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as PaymentRecord));
    return list.sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || ''));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function recordPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt'>): Promise<string> {
  const path = 'paymentRecords';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...payment,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// TRAINERS
const LOCAL_TRAINERS_KEY = 'smp_local_trainers';

export async function getTrainers(): Promise<Trainer[]> {
  const path = 'trainers';
  try {
    const snap = await getDocs(collection(db, path));
    const list: Trainer[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Trainer));

    // Also merge any locally saved trainers (for staff preview or offline mode)
    const local = localStorage.getItem(LOCAL_TRAINERS_KEY);
    if (local) {
      try {
        const localItems: Trainer[] = JSON.parse(local);
        localItems.forEach((lt) => {
          if (!list.some((it) => it.id === lt.id)) {
            list.push(lt);
          }
        });
      } catch (e) {
        console.warn('Error reading local trainers:', e);
      }
    }

    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    // If Firestore fails, check local storage
    const local = localStorage.getItem(LOCAL_TRAINERS_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveTrainer(trainer: Partial<Trainer>): Promise<string> {
  const path = 'trainers';
  const trainerId = trainer.id || `TR-${Date.now()}`;
  const fullTrainer: Trainer = {
    id: trainerId,
    name: trainer.name || 'Coach',
    role: trainer.role || 'Fitness Coach',
    specialization: trainer.specialization || 'Strength & Conditioning',
    qualifications: trainer.qualifications || 'Certified Trainer',
    experience: trainer.experience || '3+ Years',
    bio: trainer.bio || '',
    imageUrl: trainer.imageUrl || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
    isAvailable: trainer.isAvailable !== false,
    displayOrder: trainer.displayOrder || 1,
  };

  // Always update local cache first for instant feedback
  try {
    const local = localStorage.getItem(LOCAL_TRAINERS_KEY);
    const list: Trainer[] = local ? JSON.parse(local) : [];
    const existingIdx = list.findIndex((t) => t.id === trainerId);
    if (existingIdx >= 0) {
      list[existingIdx] = fullTrainer;
    } else {
      list.push(fullTrainer);
    }
    localStorage.setItem(LOCAL_TRAINERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Local trainer sync error:', e);
  }

  try {
    if (trainer.id) {
      await updateDoc(doc(db, path, trainer.id), trainer);
      return trainer.id;
    } else {
      const docRef = await addDoc(collection(db, path), fullTrainer);
      return docRef.id;
    }
  } catch (error) {
    console.warn('Firestore write notice (saved locally):', error);
    return trainerId;
  }
}

export async function deleteTrainer(trainerId: string): Promise<void> {
  const path = `trainers/${trainerId}`;
  try {
    const local = localStorage.getItem(LOCAL_TRAINERS_KEY);
    if (local) {
      const list: Trainer[] = JSON.parse(local);
      const filtered = list.filter((t) => t.id !== trainerId);
      localStorage.setItem(LOCAL_TRAINERS_KEY, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }

  try {
    await deleteDoc(doc(db, 'trainers', trainerId));
  } catch (error) {
    console.warn('Firestore delete notice (removed locally):', error);
  }
}

// GALLERY
const LOCAL_GALLERY_KEY = 'smp_local_gallery';

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const path = 'gallery';
  try {
    const snap = await getDocs(collection(db, path));
    const list: GalleryItem[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as GalleryItem));

    // Merge any locally saved gallery items
    const local = localStorage.getItem(LOCAL_GALLERY_KEY);
    if (local) {
      try {
        const localItems: GalleryItem[] = JSON.parse(local);
        localItems.forEach((lg) => {
          if (!list.some((it) => it.id === lg.id)) {
            list.push(lg);
          }
        });
      } catch (e) {
        console.warn('Error reading local gallery:', e);
      }
    }

    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    const local = localStorage.getItem(LOCAL_GALLERY_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveGalleryItem(item: Partial<GalleryItem>): Promise<string> {
  const path = 'gallery';
  const itemId = item.id || `GAL-${Date.now()}`;
  const fullItem: GalleryItem = {
    id: itemId,
    title: item.title || 'Gym Facility',
    category: item.category || 'equipment',
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    description: item.description || '',
    displayOrder: item.displayOrder || 1,
  };

  // Local storage cache for instant reflection
  try {
    const local = localStorage.getItem(LOCAL_GALLERY_KEY);
    const list: GalleryItem[] = local ? JSON.parse(local) : [];
    const existingIdx = list.findIndex((g) => g.id === itemId);
    if (existingIdx >= 0) {
      list[existingIdx] = fullItem;
    } else {
      list.push(fullItem);
    }
    localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Local gallery sync error:', e);
  }

  try {
    if (item.id) {
      await updateDoc(doc(db, path, item.id), item);
      return item.id;
    } else {
      const docRef = await addDoc(collection(db, path), fullItem);
      return docRef.id;
    }
  } catch (error) {
    console.warn('Firestore write notice (saved locally):', error);
    return itemId;
  }
}

export async function deleteGalleryItem(itemId: string): Promise<void> {
  const path = `gallery/${itemId}`;
  try {
    const local = localStorage.getItem(LOCAL_GALLERY_KEY);
    if (local) {
      const list: GalleryItem[] = JSON.parse(local);
      const filtered = list.filter((g) => g.id !== itemId);
      localStorage.setItem(LOCAL_GALLERY_KEY, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }

  try {
    await deleteDoc(doc(db, 'gallery', itemId));
  } catch (error) {
    console.warn('Firestore delete notice (removed locally):', error);
  }
}


// AUDIT LOGS
export async function logAuditEvent(action: string, entityType: string, entityId: string, details: string, email: string): Promise<void> {
  const path = 'auditLogs';
  try {
    await addDoc(collection(db, path), {
      action,
      entityType,
      entityId,
      details,
      performedByEmail: email || 'system@smpgym.com',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Audit logging skipped or denied:', e);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const path = 'auditLogs';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    const list: AuditLog[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AuditLog));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// INITIAL SEEDING HELPER
export async function seedInitialGymData(): Promise<void> {
  try {
    // 1. Settings
    const settingSnap = await getDoc(doc(db, 'gymSettings', 'general'));
    if (!settingSnap.exists()) {
      await setDoc(doc(db, 'gymSettings', 'general'), {
        ...DEFAULT_BUSINESS_SETTINGS,
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Initial plans (with unpublished or published note, ready for owner pricing)
    const plansSnap = await getDocs(collection(db, 'membershipPlans'));
    if (plansSnap.empty) {
      const defaultPlans: Omit<MembershipPlan, 'id'>[] = [
        {
          name: '1 Month General Fitness',
          price: 1500,
          durationMonths: 1,
          category: 'monthly',
          benefits: [
            'Full access to gym floor & free weights',
            'Cardio zone and functional training machines',
            'Locker room & clean restrooms access',
            'General floor trainer guidance',
          ],
          terms: 'Subject to gym rules. Non-transferable.',
          isPublished: true,
          isPopular: false,
          createdAt: new Date().toISOString(),
        },
        {
          name: '3 Months Quarterly Plan',
          price: 3800,
          durationMonths: 3,
          category: 'quarterly',
          benefits: [
            'Full 24/7 gym access',
            'Body composition & progress assessment',
            'Customized workout split plan',
            'Locker facility & shower area',
          ],
          terms: 'Valid for 90 days from activation.',
          isPublished: true,
          isPopular: true,
          createdAt: new Date().toISOString(),
        },
        {
          name: '6 Months Half-Yearly Power',
          price: 6500,
          durationMonths: 6,
          category: 'half-yearly',
          benefits: [
            'Unlimited gym floor & strength machinery',
            'Bi-weekly coach check-ins & form corrections',
            'Nutrition guidance blueprint',
            '1 Free guest day pass per month',
          ],
          terms: 'Valid for 180 days.',
          isPublished: true,
          isPopular: false,
          createdAt: new Date().toISOString(),
        },
        {
          name: '1 Year Annual Transformation',
          price: 11000,
          durationMonths: 12,
          category: 'annual',
          benefits: [
            'Best value full-year membership',
            'Complete access to all machines & cardio',
            'Priority coaching support & routine updates',
            'Complimentary gym workout tee / shaker',
          ],
          terms: 'Valid for 365 days. 1 freeze period allowed.',
          isPublished: true,
          isPopular: false,
          createdAt: new Date().toISOString(),
        },
        {
          name: 'Personal Training (1 Month)',
          price: 4500,
          durationMonths: 1,
          category: 'personal-training',
          benefits: [
            '1-on-1 dedicated coach sessions (12 sessions/mo)',
            'Form correction, progressive overload tracking',
            'Personalized diet & supplement roadmap',
            'Gym floor access included',
          ],
          terms: 'Trainer schedule booked in advance.',
          isPublished: true,
          isPopular: false,
          createdAt: new Date().toISOString(),
        },
      ];

      for (const p of defaultPlans) {
        await addDoc(collection(db, 'membershipPlans'), p);
      }
    }

    // 3. Initial Sample Members for instant live analytics in dashboard
    const membersSnap = await getDocs(collection(db, 'members'));
    if (membersSnap.empty) {
      const today = new Date();
      const formatIsoDate = (d: Date) => d.toISOString().split('T')[0];
      const addDays = (d: Date, days: number) => {
        const copy = new Date(d);
        copy.setDate(copy.getDate() + days);
        return copy;
      };

      const seedMembers = [
        {
          memberId: 'SMP-101',
          name: 'Ravi Kumar',
          phone: '+91 98451 22340',
          email: 'ravi.k@example.com',
          joinDate: formatIsoDate(addDays(today, -60)),
          status: 'active' as const,
          currentPlanName: '3 Months Quarterly Plan',
          currentStartDate: formatIsoDate(addDays(today, -60)),
          currentExpiryDate: formatIsoDate(addDays(today, 30)),
          emergencyContact: '+91 98451 00000',
          bloodGroup: 'B+',
          createdAt: addDays(today, -60).toISOString(),
        },
        {
          memberId: 'SMP-102',
          name: 'Kavitha Reddy',
          phone: '+91 97312 44510',
          email: 'kavitha.r@example.com',
          joinDate: formatIsoDate(addDays(today, -20)),
          status: 'active' as const,
          currentPlanName: '1 Year Annual Transformation',
          currentStartDate: formatIsoDate(addDays(today, -20)),
          currentExpiryDate: formatIsoDate(addDays(today, 345)),
          emergencyContact: '+91 97312 99999',
          bloodGroup: 'O+',
          createdAt: addDays(today, -20).toISOString(),
        },
        {
          memberId: 'SMP-103',
          name: 'Arun Prakash',
          phone: '+91 91234 56789',
          email: 'arun.p@example.com',
          joinDate: formatIsoDate(addDays(today, -85)),
          status: 'expiring' as const,
          currentPlanName: '3 Months Quarterly Plan',
          currentStartDate: formatIsoDate(addDays(today, -85)),
          currentExpiryDate: formatIsoDate(addDays(today, 5)),
          emergencyContact: '+91 91234 00000',
          bloodGroup: 'A+',
          notes: 'Renewal reminder sent via WhatsApp',
          createdAt: addDays(today, -85).toISOString(),
        },
        {
          memberId: 'SMP-104',
          name: 'Praveen Gowda',
          phone: '+91 99887 76655',
          email: 'praveen.g@example.com',
          joinDate: formatIsoDate(addDays(today, -45)),
          status: 'expired' as const,
          currentPlanName: '1 Month General Fitness',
          currentStartDate: formatIsoDate(addDays(today, -45)),
          currentExpiryDate: formatIsoDate(addDays(today, -15)),
          emergencyContact: '+91 99887 00000',
          bloodGroup: 'AB+',
          createdAt: addDays(today, -45).toISOString(),
        },
      ];

      for (const m of seedMembers) {
        const docRef = await addDoc(collection(db, 'members'), m);
        // create corresponding membership subscription record
        await addDoc(collection(db, 'memberships'), {
          memberId: m.memberId,
          memberName: m.name,
          planId: 'plan-auto',
          planName: m.currentPlanName,
          price: m.currentPlanName.includes('Year') ? 11000 : 3800,
          startDate: m.currentStartDate,
          expiryDate: m.currentExpiryDate,
          status: m.status,
          isPaid: true,
          createdAt: m.createdAt,
        });

        // Seed a verified payment record
        await addDoc(collection(db, 'paymentRecords'), {
          memberId: m.memberId,
          memberName: m.name,
          planName: m.currentPlanName,
          amount: m.currentPlanName.includes('Year') ? 11000 : 3800,
          currency: 'INR',
          paymentDate: m.currentStartDate,
          paymentMethod: 'UPI',
          paymentStatus: 'Verified',
          transactionReference: `UPI${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          verifiedBy: 'Staff Admin',
          createdAt: m.createdAt,
        });
      }

      // Seed today's attendance records for live analytics
      const todayStr = formatIsoDate(today);
      await addDoc(collection(db, 'attendance'), {
        memberId: 'SMP-101',
        memberName: 'Ravi Kumar',
        dateKey: todayStr,
        checkInTime: '06:15 AM',
        createdAt: new Date().toISOString(),
      });
      await addDoc(collection(db, 'attendance'), {
        memberId: 'SMP-102',
        memberName: 'Kavitha Reddy',
        dateKey: todayStr,
        checkInTime: '07:05 AM',
        checkOutTime: '08:20 AM',
        createdAt: new Date().toISOString(),
      });

      // Seed a sample enquiry
      await addDoc(collection(db, 'enquiries'), {
        fullName: 'Manjunath B',
        phone: '+91 98865 43210',
        email: 'manju.b@example.com',
        preferredDate: formatIsoDate(addDays(today, 1)),
        preferredTime: 'Evening (6 PM - 8 PM)',
        fitnessGoal: 'Weight Loss and Muscle Building',
        message: 'Looking for a trial workout session this Friday.',
        status: 'New',
        source: 'Website Trial Form',
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Trainers with realistic coaching profiles (verified structure with clear owner note)
    const trainerSnap = await getDocs(collection(db, 'trainers'));
    if (trainerSnap.empty) {
      const defaultTrainers: Omit<Trainer, 'id'>[] = [
        {
          name: 'Head Coach Maruthi',
          role: 'Head Strength & Conditioning Coach',
          specialization: 'Powerlifting, Hypertrophy & Athletic Conditioning',
          qualifications: 'Certified Strength Specialist & Personal Trainer',
          experience: '8+ Years Gym Coaching',
          bio: 'Passionate about helping Jigani fitness enthusiasts build lasting strength with proper biomechanics and injury-free progression.',
          imageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          displayOrder: 1,
        },
        {
          name: 'Coach Suresh',
          role: 'Senior Floor Coach & Functional Trainer',
          specialization: 'Fat Loss, Endurance & Mobility Training',
          qualifications: 'K11 & ACSM Certified Fitness Coach',
          experience: '5+ Years Coaching',
          bio: 'Specialized in beginner onboarding, functional conditioning, and encouraging members of all fitness levels.',
          imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          displayOrder: 2,
        },
        {
          name: 'Coach Priya',
          role: 'Transformation & Nutrition Advisor',
          specialization: 'Female Fitness, Posture & Core Stability',
          qualifications: 'Certified Fitness Trainer & Sports Nutritionist',
          experience: '4+ Years Coaching',
          bio: 'Dedicated to empowering women and working professionals in Jigani to stay consistent, energetic, and confident.',
          imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=600&q=80',
          isAvailable: true,
          displayOrder: 3,
        },
      ];

      for (const t of defaultTrainers) {
        await addDoc(collection(db, 'trainers'), t);
      }
    }

    // 5. Gallery items (clean high-res strength, cardio & training facility images)
    const gallerySnap = await getDocs(collection(db, 'gallery'));
    if (gallerySnap.empty) {
      const defaultGallery: Omit<GalleryItem, 'id'>[] = [
        {
          title: 'Heavy Duty Dumbbell & Free Weight Rack',
          category: 'equipment',
          imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
          description: 'Wide variety of calibrated dumbbells and barbells for progressive overload.',
          displayOrder: 1,
        },
        {
          title: 'Spacious Multi-Station Machine Floor',
          category: 'interior',
          imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
          description: 'Modern cable stations, lat pull-downs, and plate-loaded leg presses.',
          displayOrder: 2,
        },
        {
          title: 'Power Racks & Deadlift Platform',
          category: 'equipment',
          imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
          description: 'Sturdy squat cages and shock-absorbing rubber flooring for heavy lifts.',
          displayOrder: 3,
        },
        {
          title: 'Cardio Zone & Treadmills',
          category: 'workout',
          imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
          description: 'High-end cardiovascular equipment for warm-ups, stamina, and calorie burn.',
          displayOrder: 4,
        },
        {
          title: 'High-Energy Motivating Training Atmosphere',
          category: 'atmosphere',
          imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
          description: 'Clean, air-ventilated workout space with motivating music and community spirit.',
          displayOrder: 5,
        },
        {
          title: '1-on-1 Trainer Coaching Session',
          category: 'training',
          imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
          description: 'Hands-on posture guidance and supportive coaching for every member.',
          displayOrder: 6,
        },
      ];

      for (const g of defaultGallery) {
        await addDoc(collection(db, 'gallery'), g);
      }
    }
  } catch (err) {
    console.warn('Initial seed check completed (some collections may already exist):', err);
  }
}
