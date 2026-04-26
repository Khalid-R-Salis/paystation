export type UserRole = 'user' | 'agent' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  walletBalance: number;
  referralPoints: number;
  referralCode: string;
  joinedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'airtime' | 'data' | 'electricity' | 'cable' | 'exam' | 'sms' | 'flight' | 'wallet_fund' | 'referral';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  date: string;
  details: string;
}

export interface AgentRequest {
  id: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  address: string;
  targetUsers: string;
  dateOfBirth: string;
}