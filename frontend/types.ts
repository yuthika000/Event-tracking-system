
export enum UserRole {
  STUDENT = 'STUDENT',
  ADVISOR = 'ADVISOR',
  HOD = 'HOD',
  PRINCIPAL = 'PRINCIPAL'
}

export enum RequestCategory {
  LEAVE = 'Leave',
  MEDICAL_LEAVE = 'Medical Leave',
  PERMISSION = 'Permission',
  OD = 'On-Duty (OD)'
}

export enum RequestStatus {
  PENDING_ADVISOR = 'Pending Advisor',
  PENDING_HOD = 'Pending HOD',
  PENDING_PRINCIPAL = 'Pending Principal',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  name: string;
  rollNumber?: string;
  registerNumber?: string;
  department?: string;
  year?: string;
  parentPhoneNumber?: string;
  email?: string;
  role: UserRole;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  category: RequestCategory;
  purpose: string;
  fromDate: string;
  toDate: string;
  advisorId?: string;
  attachmentName?: string;
  status: RequestStatus;
  parentPhoneNumber?: string;
  createdAt: string;
  history: {
    role: UserRole;
    action: 'Approved' | 'Rejected' | 'Submitted';
    timestamp: string;
    comment?: string;
  }[];
}

export interface StudentProfile {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  year: string;
  parentPhoneNumber: string;
  email: string;
  profilePictureUrl?: string;
  user?: {
    id: string;
    username: string;
  };
}
