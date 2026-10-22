# Security Specification & Test Suite for Sri Maruthi Power House Gym 24/7

## 1. Data Invariants

1. **Default-Deny Catch-all**: No collection or document may be read or written by default.
2. **Admin-Only Private Data**: `members`, `memberships`, `attendance`, `paymentRecords`, `auditLogs`, and `admins` must never be read or listed by unauthenticated or non-admin users.
3. **Admin Privilege Rule**: Admin status is strictly resolved via database lookup `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or matching bootstrapped owner email (`www.hansika2007@gmail.com`).
4. **Public Inquiry Submission**: Public visitors can create an enquiry/trial booking with valid schema, but cannot read any enquiry, update any enquiry, or alter status/internal notes.
5. **Published Content Readability**: Public visitors can read published `membershipPlans`, `gymSettings`, `trainers`, and `gallery` items, but only authenticated admins can create, update, or delete them.
6. **No Self-Assigned Roles**: Normal users cannot create or modify `/admins/` records or elevate themselves.
7. **Attendance Integrity**: Member attendance records require valid memberId, dateKey, and cannot be spoofed by unauthenticated requests.
8. **Payment Integrity**: Only admins can record or verify payment transactions.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Unauthenticated Read to /members**: An anonymous user calls `getDoc(doc(db, 'members', 'M001'))` -> DENIED.
2. **Unauthenticated List on /paymentRecords**: An attacker queries all payment transactions -> DENIED.
3. **Public Infiltration to /admins**: An attacker attempts `setDoc(doc(db, 'admins', attackerUid), { role: 'superadmin' })` -> DENIED.
4. **Enquiry Status Tamper**: A visitor attempts to insert an enquiry with `status: 'Completed'` and `internalNotes: 'VIP Free Pass'` -> DENIED.
5. **Shadow Field Injection**: A visitor submits an enquiry with ghost field `{ secretAdminAccess: true }` -> DENIED.
6. **Immortal Field Override**: An update to an enquiry or payment record attempting to overwrite original `createdAt` timestamp -> DENIED.
7. **Oversized String Bomb**: Visitor submits an enquiry with 500KB text in `fullName` -> DENIED by string length validation.
8. **ID Poisoning Attack**: An attacker attempts to read or write a document with path containing illegal characters or >128 length -> DENIED by `isValidId`.
9. **Unpublished Plan Snooping**: A public query attempts to list draft/unverified membership plans (`isPublished == false`) -> DENIED.
10. **Unauthenticated Attendance Log**: An external client posts fake check-in data into `/attendance` -> DENIED.
11. **Tampering with Business Profile**: An unauthenticated user attempts to update gym phone number or UPI details in `gymSettings` -> DENIED.
12. **Audit Log Deletion**: An unauthorized user attempts to delete records from `/auditLogs` -> DENIED.
